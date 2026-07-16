import os
from dotenv import load_dotenv
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager

from app.database import engine, Base, get_db, SessionLocal

from app.campaigns.models import Campaign
from app.automations.models import AutomationRule, AutomationLog
from app.users.models import User

from app.campaigns.router import router as campaigns_router
from app.automations.router import router as automations_router
from app.users.router import router as auth_router

from app.automations.engine import run_automation_engine

from apscheduler.schedulers.background import BackgroundScheduler

load_dotenv()

def trigger_all_automations():
    print("\n[SCHEDULER] Running scheduled automation engine check...")
    db = SessionLocal()
    try:
        active_user_ids = (
            db.query(AutomationRule.user_id)
            .filter(AutomationRule.is_enabled == True)
            .distinct()
            .all()
        )
        
        user_ids = [user[0] for user in active_user_ids]
        
        if not user_ids:
            print("[SCHEDULER] No users with active automation rules found. Skipping.")
            return

        print(f"[SCHEDULER] Found active rules for {len(user_ids)} user(s). Executing engine...")
        
        for user_id in user_ids:
            try:
                result = run_automation_engine(db, user_id=user_id)
                print(f"[SCHEDULER] User {user_id} run result: {result['status']} | Actions: {len(result.get('actions_taken', []))}")
            except Exception as e:
                print(f"[SCHEDULER ERROR] Failed to run engine for user {user_id}: {str(e)}")
                
    except Exception as e:
        print(f"[SCHEDULER ERROR] Critical error during automation check: {str(e)}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    print("[STARTUP] Database tables created/verified successfully.")
    
    scheduler = BackgroundScheduler()
    
    scheduler.add_job(
        trigger_all_automations, 
        "interval", 
        minutes=10, 
        id="automations_job",
        replace_existing=True
    )
    
    scheduler.start()
    print("[STARTUP] Background Scheduler started successfully.")
    
    yield
    
    scheduler.shutdown()
    print("[SHUTDOWN] Background Scheduler stopped safely.")


app = FastAPI(
    title="Performance Marketing Automation SaaS API",
    description="Backend API for managing cross-channel budget rebalancing, anomaly detection, and creative fatigue.",
    version="1.0.0",
    lifespan=lifespan
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

origins = [
    "http://localhost:3000",
    "http://localhost:5173", 
    FRONTEND_URL,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(campaigns_router)
app.include_router(automations_router)
app.include_router(auth_router)

@app.get("/")
def read_root():
    return {"status": "healthy", "message": "Welcome to the Marketing Automation SaaS API Engine!"}

@app.get("/api/db-check")
def test_db_connection(db: Session = Depends(get_db)):
    try:
        db.execute("SELECT 1")
        return {"status": "success", "message": "Database connection is working perfectly!"}
    except Exception as e:
        return {"status": "error", "message": f"Database connection failed: {str(e)}"}