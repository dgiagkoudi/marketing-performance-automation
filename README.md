# Marketing Performance & Automation Dashboard

A full-stack marketing performance tracking and automation SaaS dashboard. Built with a focus on real-time analytics and intelligent budget optimization, it allows users to monitor multi-channel ad campaigns (Google & Meta) and deploy automated rules like Anomaly Kill-Switches and Cross-Channel Budget Rebalancing, with real-time logging and Slack integration.

## Features

- Real-time Performance Monitoring: View active and paused Google & Meta campaigns with up-to-date metrics (Spend, Conversions, ROAS, CTR).
- Intelligent Automation Engine: Execute custom-defined optimization rules manually or automatically in the background via an integrated scheduler.
- Rule Creation & Management: Create, toggle, and delete rules dynamically based on multi-metric triggers using `AND` / `OR` operators:
  - Anomaly Detection (Kill-Switch): Automatically pause underperforming campaigns.
  - Cross-Channel Budget Rebalance: Transfer 20% of the daily budget from the worst-performing campaign to the best-performing one.
- Live Slack Notifications: Receive rich-formatted messages with detailed alerts, statistics, and custom emojis instantly in your Slack workspace when actions are triggered.
- Interactive Visualizations: Analyze budget allocation and performance instantly using responsive charts (Recharts).
- Mock Data Generator: Reset and load 4 pre-configured Google & Meta campaigns to showcase the automation capabilities.
- Detailed Audit Logs: Complete historical tracking of every action successfully taken by the automation engine.
- Secure Authentication: User signup and login flow secured with JWT token authentication.

## Tech Stack

Frontend
- React 19
- Tailwind CSS
- Recharts
- Lucide React
- Axios

Backend
- Python & FastAPI
- SQLAlchemy (ORM)
- SQLite / PostgreSQL
- APScheduler
- PyJWT & Bcrypt

## Project Structure
```bash
root/
├── backend/
│   ├── app/
│   │   ├── automations/ # Automation rules engine, logs & rule routes
│   │   ├── campaigns/   # Campaign metrics, mock generator & routes
│   │   ├── users/       # Auth routes, JWT handling & bcrypt helper
│   │   ├── database.py  # SQLite connection & session configurations
│   │   └── main.py      # FastAPI app initialization, scheduler & CORS setup
│   ├── requirements.txt # Python dependencies
│   └── .env             # Backend local environment variables
│
└── frontend/
    ├── src/
    │   ├── components/  # Sidebar, Charts, Forms, and cards
    │   ├── context/     # AuthContext for global login/logout state
    │   ├── pages/       # Dashboard, Automations & AuthPage
    │   ├── services/    # Axios API client configured with localStorage token
    │   ├── App.jsx      # Route logic & layout management
    │   └── main.jsx     # Frontend entrance
    └── package.json     # Node scripts and dev dependencies
```

## Local Setup & Installation

1. Clone repository

```bash
git clone https://github.com/dgiagkoudi/marketing-performance-automation.git
cd marketing-performance-automation
```

2. Backend Setup

```bash
cd backend

# Create a virtual environment and activate it
python -m venv venv
# On Windows use: venv\Scripts\activate
source venv/bin/activate  

# Install dependencies
pip install -r requirements.txt
```
Create a `.env` file inside the `backend/` folder and configure the following variables:
```bash
DATABASE_URL="sqlite:///./test.db"
JWT_SECRET_KEY="your_secure_random_string_here"
FRONTEND_URL="http://localhost:5173"
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/webhook_url"
```
Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```
Interactive Swagger Docs will be available at: http://127.0.0.1:8000/docs

3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```
Create a `.env` file inside the `frontend/` folder and add:
```bash
VITE_API_URL="http://127.0.0.1:8000"
```
Start the development server:
```bash
npm run dev
```
The React application will run locally at: http://localhost:5173

## Step-by-Step Demo Guide (How to Test)

To witness the full automation engine and Slack notifications in action, a Mock Data Generator has been integrated to populate the database with real-world scenarios.
Step 1: Initialize Campaign Data
1. Register and log in to the system.
2. In the top-right corner of your Dashboard, click "Simulate Traffic/Προσομοίωση Traffic" (or Reset/Ανανέωση).
3. This action hits the `/api/campaigns/generate-mock-data` endpoint and seeds 4 active campaigns:
   - Google_Search_Brand_GR (Healthy Performance $\rightarrow$ Spend: €40, ROAS: 3.5x)
   - Google_Performance_Max_Anomalous (Critical Failure $\rightarrow$ Spend: €85, ROAS: 0.0x)
   - Meta_Prospecting_Lookalike_Fatigue (Declining Performance $\rightarrow$ Spend: €28, ROAS: 0.8x)
   - Meta_Retargeting_Catalog_Best (Top Performer $\rightarrow$ Spend: €35, ROAS: 5.2x)

Step 2: Create Your Automation Rules
Go to the Automations tab and create the following two active rules:
Rule A: The Kill-Switch (Anomaly Detection)
- Rule Name: `Global Kill-Switch`
- Rule Type: `anomaly_detection`
- Conditions:
  - `Spend Threshold` $\ge$ `50`
  - `ROAS Threshold` $<$ `1.0`
  - Operator: `AND`

Rule B: Budget Optimizer (Cross-Channel Rebalancing)
- Rule Name: `ROAS Optimizer`
- Rule Type: `budget_rebalance`
- Conditions:
  - `ROAS Threshold` $<$ `1.5`
 
Step 3: Trigger the Engine
1. Once both rules are Enabled, click the "Run Automation/Τρέξε την Μηχανή Τώρα" button.
2. Behold the magic:
   - In the Dashboard UI: You will see Google_Performance_Max_Anomalous automatically update its status to paused.
   - In the Audit Logs: 3 entries will record the actions.
   - In your Slack Workspace: Rich notification blocks will appear, detailing exactly which campaigns were `paused` and how 20% of the budget was automatically reallocated from underperforming to top-performing channels.

## Future Enhancements

- Native Platform APIs: Integrate authentic connections to Google Ads API and Meta Graph API.
- Predictive ML Pipelines: Incorporate forecasting models (using Scikit-Learn) to predict creative fatigue and performance drops before they trigger.
- Advanced Rebalance Customization: Offer custom budget shift percentages instead of the static 20% rule.

## License

This project is licensed under the MIT License.
