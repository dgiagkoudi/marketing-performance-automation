from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from typing import List
from app.database import get_db
from app.campaigns.models import Campaign
from app.campaigns.schemas import CampaignResponse
from app.users.dependencies import get_current_user
from app.users.models import User
import random
from datetime import datetime, timezone

router = APIRouter(
    prefix="/api/campaigns",
    tags=["Campaigns"]
)

@router.get("/", response_model=List[CampaignResponse])
def get_all_campaigns(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return db.query(Campaign).filter(Campaign.user_id == current_user.id).all()

@router.post("/generate-mock-data")
def generate_mock_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        db.query(Campaign).filter(Campaign.user_id == current_user.id).delete()
        
        now = datetime.now(timezone.utc)
        
        mock_campaigns = [
            Campaign(
                user_id=current_user.id,
                platform="google",
                platform_campaign_id="g_camp_001",
                name="Google_Search_Brand_GR",
                status="active",
                daily_budget=50.00,
                current_metrics={"clicks": 200, "spend": 40.0, "conversions": 15, "ctr": 4.5, "revenue": 140.0, "roas": 3.5},
                created_at=now,
                updated_at=now
            ),
            Campaign(
                user_id=current_user.id,
                platform="google",
                platform_campaign_id="g_camp_002",
                name="Google_Performance_Max_Anomalous",
                status="active",
                daily_budget=100.00,
                current_metrics={"clicks": 150, "spend": 85.0, "conversions": 0, "ctr": 1.1, "revenue": 0.0, "roas": 0.0},
                created_at=now,
                updated_at=now
            ),
            Campaign(
                user_id=current_user.id,
                platform="meta",
                platform_campaign_id="m_camp_001",
                name="Meta_Prospecting_Lookalike_Fatigue",
                status="active",
                daily_budget=30.00,
                current_metrics={"clicks": 40, "spend": 28.0, "conversions": 1, "ctr": 0.4, "revenue": 22.4, "roas": 0.8},
                created_at=now,
                updated_at=now
            ),
            Campaign(
                user_id=current_user.id,
                platform="meta",
                platform_campaign_id="m_camp_002",
                name="Meta_Retargeting_Catalog_Best",
                status="active",
                daily_budget=40.00,
                current_metrics={"clicks": 300, "spend": 35.0, "conversions": 25, "ctr": 3.8, "revenue": 182.0, "roas": 5.2},
                created_at=now,
                updated_at=now
            )
        ]
        
        db.add_all(mock_campaigns)
        db.commit()
        return {"status": "success", "message": f"4 Mock campaigns successfully generated for user {current_user.email}!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to generate mock data: {str(e)}")

@router.post("/simulate-traffic")
def simulate_traffic(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    active_campaigns = db.query(Campaign).filter(
        Campaign.status == "active", 
        Campaign.user_id == current_user.id
    ).all()
    
    for campaign in active_campaigns:
        metrics = campaign.current_metrics
        if metrics and isinstance(metrics, dict):
            additional_spend = round(random.uniform(10.0, 40.0), 2)
            metrics["spend"] = round(float(metrics.get("spend", 0.0)) + additional_spend, 2)
            
            additional_conversions = random.randint(0, 3)
            metrics["conversions"] = int(metrics.get("conversions", 0)) + additional_conversions
            
            current_revenue = float(metrics.get("revenue", 0.0))
            if additional_conversions > 0:
                additional_revenue = additional_conversions * random.uniform(40.0, 100.0)
                metrics["revenue"] = round(current_revenue + additional_revenue, 2)
            else:
                metrics["revenue"] = round(current_revenue, 2)
            
            if metrics["spend"] > 0:
                metrics["roas"] = round(metrics["revenue"] / metrics["spend"], 2)
            else:
                metrics["roas"] = 0.0
            
            flag_modified(campaign, "current_metrics")
                
    db.commit()
    return {"message": "Traffic simulation completed successfully!"}