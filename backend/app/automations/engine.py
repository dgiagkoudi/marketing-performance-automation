import os
from dotenv import load_dotenv
import pandas as pd
import requests
from sqlalchemy.orm import Session
from app.campaigns.models import Campaign
from app.automations.models import AutomationRule, AutomationLog
from datetime import datetime, timezone

load_dotenv()

def send_slack_notification(message: str):
    slack_webhook_url = os.getenv("SLACK_WEBHOOK_URL")
    
    if not slack_webhook_url:
        print("[SLACK] Webhook URL not configured in environment. Skipping notification.")
        return

    payload = {"text": message}
    try:
        response = requests.post(slack_webhook_url, json=payload, timeout=5)
        if response.status_code != 200:
            print(f"[SLACK] Webhook returned error code {response.status_code}: {response.text}")
    except Exception as e:
        print(f"[SLACK] Failed to send Slack alert: {e}")


def evaluate_conditions(row: pd.Series, conds: dict) -> bool:
    if not conds:
        return False

    match_results = []
    
    if conds.get("spend_threshold") is not None:
        match_results.append(float(row.get("spend", 0.0)) >= float(conds["spend_threshold"]))
        
    if conds.get("roas_threshold") is not None:
        match_results.append(float(row.get("roas", 0.0)) < float(conds["roas_threshold"]))
        
    if conds.get("ctr_threshold") is not None:
        match_results.append(float(row.get("ctr", 0.0)) < float(conds["ctr_threshold"]))
        
    if conds.get("conversions_threshold") is not None:
        match_results.append(int(row.get("conversions", 0)) < int(conds["conversions_threshold"]))
        
    if not match_results:
        return False
        
    operator = conds.get("operator", "AND").upper()
    if operator == "OR":
        return any(match_results)
    return all(match_results)


def run_automation_engine(db: Session, user_id: str): 
    print(f"[ENGINE] Starting automation engine for user context: {user_id}")
    
    rules = db.query(AutomationRule).filter(
        AutomationRule.user_id == user_id, 
        AutomationRule.is_enabled == True
    ).all()
    
    if not rules:
        return {"status": "skipped", "message": "No active rules found."}

    campaigns = db.query(Campaign).filter(Campaign.user_id == user_id).all()
    if not campaigns:
        return {"status": "skipped", "message": "No active campaigns to optimize."}

    campaign_data = []
    for c in campaigns:
        metrics = c.current_metrics or {}
        campaign_data.append({
            "db_id": c.id,
            "name": c.name,
            "platform": c.platform,
            "status": c.status or "active",
            "daily_budget": float(c.daily_budget),
            "spend": float(metrics.get("spend", 0.0)),
            "conversions": int(metrics.get("conversions", 0)),
            "ctr": float(metrics.get("ctr", 0.0)),
            "roas": float(metrics.get("roas", 0.0))
        })
    
    df = pd.DataFrame(campaign_data)
    actions_logged = []
    current_now = datetime.now(timezone.utc)

    for rule in rules:
        if rule.last_run:
            last_run_aware = rule.last_run.replace(tzinfo=timezone.utc) if rule.last_run.tzinfo is None else rule.last_run
            time_elapsed = current_now - last_run_aware
            if time_elapsed.total_seconds() < 60:
                print(f"[ENGINE] Skipping rule '{rule.name}' due to cooldown ({int(60 - time_elapsed.total_seconds())}s remaining).")
                continue

        rule.last_run = current_now
        conds = rule.trigger_conditions or {}

        # --- FEATURE 1: MULTI-METRIC ANOMALY DETECTION (Kill-Switch) ---
        if rule.rule_type == "anomaly_detection":
            for _, row in df.iterrows():
                if str(row["status"]).lower() != "paused" and evaluate_conditions(row, conds):
                    campaign_to_pause = db.query(Campaign).filter(Campaign.id == row["db_id"]).first()
                    if campaign_to_pause:
                        campaign_to_pause.status = "paused"
                        
                        log_text = f"🚨 [KILL-SWITCH] Paused {row['platform'].upper()} campaign '{row['name']}' βάσει του κανόνα '{rule.name}' (Spend: €{row['spend']}, ROAS: {row['roas']}x, CTR: {row['ctr']}%, Conv: {row['conversions']})."
                        
                        log_entry = AutomationLog(
                            rule_id=rule.id,
                            status="success",
                            action_taken=log_text
                        )
                        db.add(log_entry)
                        actions_logged.append(log_entry.action_taken)
                        
                        send_slack_notification(
                            f"🚨 *Kill-Switch Triggered!*\n"
                            f"• *Καμπάνια:* {row['name']} ({row['platform'].upper()})\n"
                            f"• *Κανόνας:* {rule.name}\n"
                            f"• *Κατάσταση:* Απενεργοποιήθηκε αυτόματα (Paused)\n"
                            f"• *Metrics:* ROAS: {row['roas']}x | CTR: {row['ctr']}% | Spend: €{row['spend']}"
                        )

        # --- FEATURE 2: CROSS-CHANNEL BUDGET REBALANCE ---
        elif rule.rule_type == "budget_rebalance":
            active_df = df[df["status"].str.lower() != "paused"]
            if len(active_df) < 2:
                continue
                
            winner_idx = active_df["roas"].idxmax()
            loser_idx = active_df["roas"].idxmin()
            winner = active_df.loc[winner_idx]
            loser = active_df.loc[loser_idx]
            
            if evaluate_conditions(loser, conds) and winner["db_id"] != loser["db_id"]:
                current_loser_budget = float(loser["daily_budget"])
                budget_to_move = round(current_loser_budget * 0.20, 2)
                
                if budget_to_move > 1.0 and (current_loser_budget - budget_to_move) >= 2.0:
                    db_loser = db.query(Campaign).filter(Campaign.id == loser["db_id"]).first()
                    db_loser.daily_budget = round(float(db_loser.daily_budget) - budget_to_move, 2)
                    
                    db_winner = db.query(Campaign).filter(Campaign.id == winner["db_id"]).first()
                    db_winner.daily_budget = round(float(db_winner.daily_budget) + budget_to_move, 2)
                    
                    log_text = f"🔄 [BUDGET REBALANCE] Μεταφέρθηκαν €{budget_to_move} ημερήσιου budget από την καμπάνια {loser['platform'].upper()} ('{loser['name']}') στην καμπάνια {winner['platform'].upper()} ('{winner['name']}') λόγω χαμηλής απόδοσης βάσει του κανόνα '{rule.name}'."
                    
                    log_entry = AutomationLog(
                        rule_id=rule.id,
                        status="success",
                        action_taken=log_text
                    )
                    db.add(log_entry)
                    actions_logged.append(log_entry.action_taken)
                    
                    send_slack_notification(
                        f"🔄 *Cross-Channel Budget Rebalance!*\n"
                        f"• *Κανόνας:* {rule.name}\n"
                        f"• *Από:* {loser['name']} ({loser['platform'].upper()}) -> Νέο Budget: €{db_loser.daily_budget}\n"
                        f"• *Προς:* {winner['name']} ({winner['platform'].upper()}) -> Νέο Budget: €{db_winner.daily_budget}\n"
                        f"• *Ποσό Μεταφοράς:* €{budget_to_move} (20% του budget)"
                    )
                        
    db.commit()
    return {
        "status": "success", 
        "executed_rules": len(rules), 
        "actions_taken": actions_logged if actions_logged else ["Δεν χρειάστηκε κάποια ενέργεια βελτιστοποίησης αυτή τη στιγμή."]
    }