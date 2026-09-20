from datetime import datetime
from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field

class TelemetryInput(BaseModel):
    timestamp: Optional[str] = None
    user_id: str = "user_default_01"
    heart_rate: float = Field(..., description="Heart Rate in BPM")
    spo2: float = Field(..., description="Blood oxygen saturation percentage")
    temperature: Optional[float] = Field(36.6, description="Body temperature in Celsius")
    steps: int = Field(..., description="Cumulative daily steps")
    activity_level: float = Field(1.0, description="Normalized activity level 0.0 - 2.0")
    sleep_hours: float = Field(..., description="Hours of sleep in past night")
    wake_time: str = Field("07:05", description="Detected wake-up time HH:MM")
    meal_status: str = Field("eaten", description="Status of morning meal: eaten, delayed, missed")
    motion_level: float = Field(1.0, description="Real-time motion index")
    response_status: Optional[str] = Field("active", description="User responsiveness: active, delayed, none")
    scenario: Optional[str] = Field("custom", description="Scenario tag")

class BaselineProfile(BaseModel):
    user_id: str = "user_default_01"
    hr_min: float = 65.0
    hr_max: float = 73.0
    hr_mean: float = 68.0
    spo2_min: float = 96.0
    spo2_max: float = 99.0
    steps_min: int = 5500
    steps_max: int = 7000
    steps_mean: int = 6200
    sleep_min: float = 7.0
    sleep_max: float = 8.0
    sleep_mean: float = 7.4
    wake_window_start: str = "06:50"
    wake_window_end: str = "07:20"
    breakfast_window_start: str = "08:00"
    breakfast_window_end: str = "08:45"
    morning_movement_expected: str = "high"

class EvidenceItem(BaseModel):
    signal: str
    baseline: str
    current: str
    deviation_percent: float
    direction: str  # "above", "below", "abnormal", "normal"
    severity: str  # "info", "warning", "critical"
    description: str

class EventNode(BaseModel):
    id: str
    time: str
    title: str
    description: str
    severity: str  # "normal", "warning", "critical"
    signal_type: str

class SymbolicRuleTriggered(BaseModel):
    rule_id: str
    name: str
    description: str
    impact: str  # "LOW", "MEDIUM", "HIGH"
    condition_met: str

class CounterfactualItem(BaseModel):
    condition: str
    hypothetical_outcome: str
    risk_impact: str

class AnalysisResult(BaseModel):
    timestamp: str
    risk: str  # "LOW", "MEDIUM", "HIGH"
    personal_deviation_score: float  # 0 to 100%
    personal_baseline_score: float = 92.0  # e.g., 92% adherence
    signals: List[Dict[str, Any]]
    event_chain: List[EventNode]
    evidence: List[EvidenceItem]
    rules_triggered: List[SymbolicRuleTriggered]
    counterfactuals: List[CounterfactualItem]
    reasoning: str
    verification_required: bool
    recommended_action: str

class VerificationSession(BaseModel):
    session_id: str
    timestamp: str
    prompt: str = "Are you feeling okay?"
    status: str = "PENDING"  # PENDING, VERIFIED, TIMEOUT, HELP_REQUESTED, CANCELLED
    timeout_seconds: int = 20
    elapsed_seconds: int = 0
    user_response: Optional[str] = None
    verification_method: str = "gentle_check_in"
    details: Optional[str] = None

class VerificationResponseInput(BaseModel):
    session_id: Optional[str] = None
    response: str  # "okay", "help", "no_response"
    comment: Optional[str] = None

class CaregiverAlert(BaseModel):
    alert_id: str
    timestamp: str
    risk_level: str  # "LOW", "MEDIUM", "HIGH"
    reason: str
    evidence: List[str]
    verification_status: str  # "FAILED", "NO_RESPONSE", "HELP_REQUESTED", "VERIFIED"
    recommended_action: str
    escalation_stage: int  # 1 to 5
    status: str = "ACTIVE"  # "ACTIVE", "ACKNOWLEDGED", "RESOLVED"
    contact_attempted: bool = False
    resolved_at: Optional[str] = None
    resolved_by: Optional[str] = None

class EscalationState(BaseModel):
    current_level: int = 1  # 1: Gentle notification, 2: Voice check-in, 3: Second verification, 4: Trusted contact, 5: Caregiver alert
    max_level: int = 5
    level_descriptions: Dict[int, str] = {
        1: "Gentle Notification",
        2: "Voice / Check-in Prompt",
        3: "Second Verification Request",
        4: "Trusted Contact Alert",
        5: "Caregiver Notification & Action Required"
    }
    is_escalating: bool = False
    active_alert_id: Optional[str] = None

class DashboardState(BaseModel):
    system_status: str = "All systems operational"
    is_online: bool = True
    current_telemetry: TelemetryInput
    baseline_profile: BaselineProfile
    analysis: AnalysisResult
    active_verification: Optional[VerificationSession] = None
    active_alert: Optional[CaregiverAlert] = None
    escalation: EscalationState
    recent_events: List[Dict[str, Any]]
    agent_status: Dict[str, Dict[str, Any]]

class CustomScenarioRequest(BaseModel):
    poor_sleep: bool = False
    low_activity: bool = False
    elevated_hr: bool = False
    missed_meal: bool = False
    fall_motion: bool = False
    no_response: bool = False
    recovery: bool = False
