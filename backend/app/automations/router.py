from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.automations.models import AutomationRule, AutomationLog
from app.automations.schemas import RuleCreate, RuleResponse, LogResponse, RuleUpdateStatus
from app.automations.engine import run_automation_engine
from app.users.dependencies import get_current_user
from app.users.models import User

router = APIRouter( prefix="/api/automations", tags=["Automations"] )

@router.post("/rules", response_model=RuleResponse)
def create_rule(
    rule_in: RuleCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Δημιουργεί έναν νέο κανόνα αυτοματισμού"""
    trigger_conditions_dict = rule_in.trigger_conditions.model_dump() if hasattr(rule_in.trigger_conditions, "model_dump") else rule_in.trigger_conditions.dict()
    
    new_rule = AutomationRule(
        user_id=current_user.id,
        name=rule_in.name,
        rule_type=rule_in.rule_type,
        trigger_conditions=trigger_conditions_dict,
        is_enabled=True,
        last_run=None
    )
    db.add(new_rule)
    db.commit()
    db.refresh(new_rule)
    return new_rule

@router.get("/rules", response_model=List[RuleResponse])
def get_rules(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Επιστρέφει όλους τους ενεργούς κανόνες."""
    return db.query(AutomationRule).filter(AutomationRule.user_id == current_user.id).all()

@router.post("/run")
def trigger_engine(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Εκτελεί τη μηχανή αυτοματισμού."""
    result = run_automation_engine(db, user_id=current_user.id)
    return result

@router.get("/logs", response_model=List[LogResponse])
def get_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Επιστρέφει το ιστορικό ενεργειών (Audit Logs)."""
    return db.query(AutomationLog).join(AutomationRule).filter(
        AutomationRule.user_id == current_user.id
    ).order_by(AutomationLog.timestamp.desc()).all()

@router.patch("/rules/{rule_id}", response_model=RuleResponse)
def toggle_rule(
    rule_id: str,
    status_in: RuleUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Αλλάζει την κατάσταση (is_enabled) ενός κανόνα."""
    rule = db.query(AutomationRule).filter(
        AutomationRule.id == rule_id, 
        AutomationRule.user_id == current_user.id
    ).first()
    
    if not rule:
        raise HTTPException(status_code=404, detail="Automation rule not found")
        
    rule.is_enabled = status_in.is_enabled
    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/rules/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rule(
    rule_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Διαγράφει έναν κανόνα αυτοματισμού."""
    rule = db.query(AutomationRule).filter(
        AutomationRule.id == rule_id, 
        AutomationRule.user_id == current_user.id
    ).first()
    
    if not rule:
        raise HTTPException(status_code=404, detail="Automation rule not found")
        
    db.delete(rule)
    db.commit()
    return None