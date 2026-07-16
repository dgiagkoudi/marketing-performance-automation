from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class TriggerConditions(BaseModel):
    operator: str = Field(default="AND", description="Σύνδεσμος κριτηρίων: 'AND' ή 'OR'")
    spend_threshold: Optional[float] = None
    roas_threshold: Optional[float] = None
    ctr_threshold: Optional[float] = None
    conversions_threshold: Optional[int] = None

class RuleCreate(BaseModel):
    name: str
    rule_type: str  # 'anomaly_detection', 'budget_rebalance'
    trigger_conditions: TriggerConditions

class RuleResponse(BaseModel):
    id: str
    user_id: str
    name: str
    rule_type: str
    is_enabled: bool = True
    trigger_conditions: Dict[str, Any]
    last_run: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class LogResponse(BaseModel):
    id: str
    rule_id: str
    action_taken: str
    status: str
    timestamp: datetime

    class Config:
        from_attributes = True

class RuleUpdateStatus(BaseModel):
    is_enabled: bool