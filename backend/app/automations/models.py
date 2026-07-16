import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, JSON, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

def get_utc_now():
    return datetime.now(timezone.utc)

class AutomationRule(Base):
    __tablename__ = "automation_rules"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    rule_type = Column(String, nullable=False)
    trigger_conditions = Column(JSON, nullable=False)
    is_enabled = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    last_run = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="rules")


class AutomationLog(Base):
    __tablename__ = "automation_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    rule_id = Column(String, ForeignKey("automation_rules.id", ondelete="CASCADE"), nullable=False)
    action_taken = Column(String(500), nullable=False)
    status = Column(String(50), default="success")
    timestamp = Column(DateTime, default=get_utc_now, nullable=False)