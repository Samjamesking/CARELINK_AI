import os
import sys
import random
from datetime import datetime
from contextlib import asynccontextmanager
from typing import Dict, Any, List, Optional

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from models.schemas import (
    TelemetryInput, BaselineProfile, AnalysisResult,
    VerificationSession, VerificationResponseInput, CaregiverAlert,
    EscalationState, DashboardState, CustomScenarioRequest
)
from data.db import init_db, log_event, get_recent_events
from data.seed_data import generate_sensor_data_csv
from agents.sensor_agent import SensorAgent
from agents.baseline_agent import BaselineAgent
from agents.reasoning_agent import ReasoningAgent
from agents.verification_agent import VerificationAgent
from agents.care_agent import CareAgent
from services.alert_service import AlertService

# Lifespan for startup and shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database and seed synthetic CSV
    init_db()
    generate_sensor_data_csv()
    log_event(
        title="CARELINK AI Guardian Started",
        description="Autonomous wellbeing monitoring engine initialized. All agents operational.",
        severity="normal",
        event_type="SYSTEM_BOOT"
    )
    yield
    # Shutdown
    print("[CARELINK AI] Shutdown complete.")

app = FastAPI(
    title="CARELINK AI — Autonomous Personal Wellbeing Guardian API",
    description="Backend API for personal baseline learning, multi-agent event chain reasoning, autonomous verification, and adaptive escalation.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the 5 AI Agents
sensor_agent = SensorAgent()
baseline_agent = BaselineAgent()
reasoning_agent = ReasoningAgent(baseline_agent.profile)
verification_agent = VerificationAgent()
care_agent = CareAgent()

# In-memory current state cache
current_telemetry = TelemetryInput(
    timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    user_id="user_default_01",
    heart_rate=68.0,
    spo2=98.0,
    temperature=36.6,
    steps=5820,
    activity_level=1.02,
    sleep_hours=7.4,
    wake_time="07:05",
    meal_status="eaten",
    motion_level=1.0,
    response_status="active",
    scenario="NORMAL"
)

current_analysis: Optional[AnalysisResult] = None
agent_execution_status: Dict[str, Dict[str, Any]] = {
    "sensor_agent": {"status": "ACTIVE", "last_run": "14:42:01", "details": "Collecting and validating sensor data..."},
    "baseline_agent": {"status": "ACTIVE", "last_run": "14:42:02", "details": "Calculating personal baseline..."},
    "reasoning_agent": {"status": "ACTIVE", "last_run": "14:42:03", "details": "Analyzing patterns and risk level..."},
    "verification_agent": {"status": "IDLE", "last_run": "14:42:04", "details": "Waiting for verification trigger..."},
    "care_agent": {"status": "IDLE", "last_run": "14:42:05", "details": "Waiting for verification result..."}
}

async def run_pipeline(telemetry: TelemetryInput) -> AnalysisResult:
    global current_telemetry, current_analysis, agent_execution_status
    now_time = datetime.now().strftime("%H:%M:%S")

    # 1. Sensor Agent
    agent_execution_status["sensor_agent"] = {
        "status": "COMPLETED", "last_run": now_time, "details": "Collecting and validating sensor data..."
    }
    cleaned_telemetry, sensor_meta = sensor_agent.process(telemetry)
    current_telemetry = cleaned_telemetry

    # 2. Baseline Agent
    agent_execution_status["baseline_agent"] = {
        "status": "COMPLETED", "last_run": now_time, "details": "Calculating personal baseline..."
    }
    deviations, evidence, baseline_meta = baseline_agent.process(cleaned_telemetry)

    # 3. Reasoning Agent
    agent_execution_status["reasoning_agent"] = {
        "status": "COMPLETED", "last_run": now_time, "details": "Analyzing patterns and risk level..."
    }
    analysis, reasoning_meta = await reasoning_agent.process(cleaned_telemetry, deviations, evidence)
    current_analysis = analysis

    # 4. Verification Agent trigger check
    if analysis.verification_required:
        agent_execution_status["verification_agent"] = {
            "status": "ACTIVE", "last_run": now_time, "details": "Autonomous check-in required..."
        }
        # Start verification session
        verification_agent.start_verification(analysis, timeout_seconds=20)
    else:
        agent_execution_status["verification_agent"] = {
            "status": "IDLE", "last_run": now_time, "details": "No verification required. Monitoring stable."
        }
        verification_agent.current_session = None
        care_agent.reset_escalation("Routine stable")

    return analysis

# --- API ENDPOINTS ---

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "CARELINK AI",
        "agents": 5,
        "llm_provider": reasoning_agent.llm_service.provider,
        "llm_configured": reasoning_agent.llm_service.is_configured
    }

@app.post("/api/sensor-data")
async def receive_sensor_data(telemetry: TelemetryInput):
    """
    Ingests telemetry and runs the CARELINK agent pipeline.
    """
    analysis = await run_pipeline(telemetry)
    return {
        "status": "success",
        "telemetry": current_telemetry,
        "analysis": analysis
    }

@app.post("/api/analyze")
async def analyze_current():
    """
    Runs Sensor -> Baseline -> Reasoning pipeline on current telemetry.
    """
    analysis = await run_pipeline(current_telemetry)
    return analysis

@app.post("/api/verify")
async def trigger_verification(prompt: Optional[str] = "Are you feeling okay?", timeout: Optional[int] = 20):
    """
    Manually or programmatically initiates an autonomous verification session.
    """
    if not current_analysis:
        await run_pipeline(current_telemetry)
    session = verification_agent.start_verification(current_analysis, timeout_seconds=timeout, prompt=prompt)
    now_time = datetime.now().strftime("%H:%M:%S")
    agent_execution_status["verification_agent"] = {
        "status": "ACTIVE", "last_run": now_time, "details": "Attempting voice check-in..."
    }
    return session

@app.post("/api/verify/response")
async def submit_verification_response(input_data: VerificationResponseInput):
    """
    Accepts user verification response:
    - 'okay' -> Cancels escalation, marks session verified
    - 'help' -> Immediate alert dispatch
    - 'no_response' -> Advances escalation ladder
    """
    session, action, meta = verification_agent.process_response(
        input_data.session_id, input_data.response, input_data.comment
    )

    now_time = datetime.now().strftime("%H:%M:%S")
    active_alert = None

    if action == "CANCEL_ESCALATION":
        care_agent.reset_escalation(reason="User confirmed wellbeing")
        agent_execution_status["verification_agent"] = {
            "status": "COMPLETED", "last_run": now_time, "details": "User verified 'I'm okay'. Escalation cancelled."
        }
        agent_execution_status["care_agent"] = {
            "status": "IDLE", "last_run": now_time, "details": "Monitoring resumed."
        }
    elif action == "ESCALATE_IMMEDIATE":
        agent_execution_status["care_agent"] = {
            "status": "ACTIVE", "last_run": now_time, "details": "Help requested! Immediate alert dispatched."
        }
        care_state, active_alert = care_agent.advance_escalation(current_analysis, session, force_max=True)
    else:  # ESCALATE_NEXT_STAGE
        agent_execution_status["care_agent"] = {
            "status": "ACTIVE", "last_run": now_time, "details": "No response. Escalation ladder advancing..."
        }
        care_state, active_alert = care_agent.advance_escalation(current_analysis, session, force_max=False)

    return {
        "verification_session": session,
        "action": action,
        "escalation_state": care_agent.escalation_state,
        "active_alert": active_alert or AlertService.get_active_alert()
    }

@app.post("/api/escalate")
async def advance_escalation():
    """
    Explicitly advances the 5-stage escalation ladder.
    """
    if not current_analysis:
        await run_pipeline(current_telemetry)
    care_state, active_alert = care_agent.advance_escalation(current_analysis, verification_agent.current_session)
    return {
        "escalation_state": care_state,
        "active_alert": active_alert or AlertService.get_active_alert()
    }

@app.get("/api/dashboard")
async def get_dashboard_state() -> DashboardState:
    """
    Returns the complete aggregated system state for the UI command center.
    """
    global current_analysis
    if not current_analysis:
        current_analysis = await run_pipeline(current_telemetry)

    active_alert = AlertService.get_active_alert()
    recent_events = get_recent_events(limit=12)

    return DashboardState(
        system_status="All systems operational" if current_analysis.risk != "HIGH" else "Active investigation / Alert state",
        is_online=True,
        current_telemetry=current_telemetry,
        baseline_profile=baseline_agent.profile,
        analysis=current_analysis,
        active_verification=verification_agent.current_session,
        active_alert=active_alert,
        escalation=care_agent.escalation_state,
        recent_events=recent_events,
        agent_status=agent_execution_status
    )

@app.get("/api/events")
async def get_events(limit: int = 20):
    return get_recent_events(limit=limit)

@app.post("/api/simulate/custom")
async def simulate_custom_scenario(req: CustomScenarioRequest):
    """
    What-If Risk Simulator endpoint with multi-select conditions.
    """
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Start with normal baseline
    hr = 68.0
    spo2 = 98.0
    steps = 5820
    activity = 1.02
    sleep = 7.4
    wake = "07:05"
    meal = "eaten"
    motion = 1.0
    resp = "active"

    if req.poor_sleep:
        sleep = 4.2
        wake = "08:45"
    if req.low_activity:
        steps = 1800
        activity = 0.3
    if req.elevated_hr:
        hr = 88.0
    if req.missed_meal:
        meal = "missed"
    if req.fall_motion:
        motion = 0.03
        hr = max(hr, 104.0)
    if req.no_response:
        resp = "none"
    if req.recovery:
        hr = 70.0
        steps = 5400
        sleep = 7.2
        meal = "eaten"
        motion = 0.95
        resp = "active"

    telemetry = TelemetryInput(
        timestamp=now_str,
        user_id="user_default_01",
        heart_rate=hr,
        spo2=spo2,
        temperature=36.6,
        steps=steps,
        activity_level=activity,
        sleep_hours=sleep,
        wake_time=wake,
        meal_status=meal,
        motion_level=motion,
        response_status=resp,
        scenario="CUSTOM_SIMULATION"
    )

    log_event(
        title="What-If Scenario Simulated",
        description=f"Conditions: Sleep={req.poor_sleep}, Act={req.low_activity}, HR={req.elevated_hr}, Meal={req.missed_meal}, Fall={req.fall_motion}, NoResp={req.no_response}",
        severity="warning" if (req.poor_sleep or req.low_activity or req.fall_motion or req.no_response) else "normal",
        event_type="CUSTOM_SIMULATION"
    )

    analysis = await run_pipeline(telemetry)
    return {
        "telemetry": telemetry,
        "analysis": analysis,
        "verification_session": verification_agent.current_session,
        "escalation_state": care_agent.escalation_state
    }

@app.post("/api/simulate/{scenario}")
async def simulate_preset_scenario(scenario: str):
    """
    Runs preset scenarios: normal, abnormal, fall, recovery, poor_sleep, low_activity, no_response.
    """
    sc_upper = scenario.upper()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if sc_upper == "NORMAL":
        telemetry = TelemetryInput(
            timestamp=now_str,
            user_id="user_default_01",
            heart_rate=68.0,
            spo2=98.0,
            temperature=36.6,
            steps=5820,
            activity_level=1.02,
            sleep_hours=7.4,
            wake_time="07:05",
            meal_status="eaten",
            motion_level=1.0,
            response_status="active",
            scenario="NORMAL"
        )
    elif sc_upper == "ABNORMAL":
        telemetry = TelemetryInput(
            timestamp=now_str,
            user_id="user_default_01",
            heart_rate=88.0,
            spo2=95.5,
            temperature=36.8,
            steps=1600,
            activity_level=0.28,
            sleep_hours=4.2,
            wake_time="09:42",
            meal_status="missed",
            motion_level=0.15,
            response_status="none",
            scenario="ABNORMAL"
        )
    elif sc_upper == "FALL":
        telemetry = TelemetryInput(
            timestamp=now_str,
            user_id="user_default_01",
            heart_rate=108.0,
            spo2=95.0,
            temperature=36.7,
            steps=1100,
            activity_level=0.05,
            sleep_hours=5.8,
            wake_time="08:15",
            meal_status="delayed",
            motion_level=0.02,
            response_status="none",
            scenario="FALL"
        )
    elif sc_upper == "RECOVERY":
        telemetry = TelemetryInput(
            timestamp=now_str,
            user_id="user_default_01",
            heart_rate=71.0,
            spo2=98.0,
            temperature=36.6,
            steps=5300,
            activity_level=0.95,
            sleep_hours=7.1,
            wake_time="07:15",
            meal_status="eaten",
            motion_level=0.9,
            response_status="active",
            scenario="RECOVERY"
        )
    elif sc_upper == "POOR_SLEEP":
        telemetry = TelemetryInput(
            timestamp=now_str,
            user_id="user_default_01",
            heart_rate=74.0,
            spo2=97.0,
            temperature=36.6,
            steps=5100,
            activity_level=0.88,
            sleep_hours=4.5,
            wake_time="07:50",
            meal_status="eaten",
            motion_level=0.85,
            response_status="active",
            scenario="POOR_SLEEP"
        )
    elif sc_upper == "LOW_ACTIVITY":
        telemetry = TelemetryInput(
            timestamp=now_str,
            user_id="user_default_01",
            heart_rate=67.0,
            spo2=98.0,
            temperature=36.5,
            steps=2100,
            activity_level=0.35,
            sleep_hours=7.5,
            wake_time="07:10",
            meal_status="eaten",
            motion_level=0.4,
            response_status="active",
            scenario="LOW_ACTIVITY"
        )
    elif sc_upper == "NO_RESPONSE":
        telemetry = TelemetryInput(
            timestamp=now_str,
            user_id="user_default_01",
            heart_rate=82.0,
            spo2=96.0,
            temperature=36.7,
            steps=2400,
            activity_level=0.38,
            sleep_hours=5.2,
            wake_time="09:10",
            meal_status="missed",
            motion_level=0.1,
            response_status="none",
            scenario="NO_RESPONSE"
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unknown scenario: {scenario}")

    log_event(
        title=f"Scenario Executed: {sc_upper}",
        description=f"Injected telemetry for scenario {sc_upper}. Running CARELINK multi-agent pipeline.",
        severity="warning" if sc_upper in ["ABNORMAL", "FALL", "NO_RESPONSE"] else "normal",
        event_type="SIMULATION"
    )

    analysis = await run_pipeline(telemetry)
    return {
        "scenario": sc_upper,
        "telemetry": telemetry,
        "analysis": analysis,
        "verification_session": verification_agent.current_session,
        "escalation_state": care_agent.escalation_state
    }

@app.post("/api/caregiver/acknowledge")
async def acknowledge_caregiver_alert(alert_id: Optional[str] = None):
    active = AlertService.get_active_alert()
    target_id = alert_id or (active.alert_id if active else None)
    if not target_id:
        raise HTTPException(status_code=404, detail="No active alert to acknowledge")
    updated = AlertService.acknowledge_alert(target_id)
    return {"status": "success", "alert": updated}

@app.post("/api/caregiver/resolve")
async def resolve_caregiver_alert(alert_id: Optional[str] = None, resolved_by: str = "Caregiver Sarah Vance"):
    active = AlertService.get_active_alert()
    target_id = alert_id or (active.alert_id if active else None)
    if not target_id:
        raise HTTPException(status_code=404, detail="No active alert to resolve")
    AlertService.resolve_alert(target_id, resolved_by=resolved_by)
    care_agent.reset_escalation("Caregiver marked alert resolved")
    return {"status": "success", "resolved_id": target_id}
