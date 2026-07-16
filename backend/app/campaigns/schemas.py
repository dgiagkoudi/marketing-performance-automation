from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class CampaignMetrics(BaseModel):
    clicks: int
    spend: float
    conversions: int
    ctr: float
    roas: float

class CampaignResponse(BaseModel):
    id: str
    user_id: str
    platform: str
    platform_campaign_id: str
    name: str
    status: str
    daily_budget: float
    current_metrics: Optional[Dict[str, Any]] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True