import uuid
from datetime import datetime
from typing import Dict, Any, List, Tuple
from models.schemas import (
    TelemetryInput, BaselineProfile, EvidenceItem,
    EventNode, SymbolicRuleTriggered, CounterfactualItem, AnalysisResult
)
from services.rule_engine import RuleEngine
from services.anomaly_detector import AnomalyDetector
from services.llm_service import LLMService

class ReasoningAgent:
    """
    Agent 3 — Reasoning Agent
    Responsibilities:
    - Synthesize multi-signal telemetry deviations into structured event chains
    - Apply deterministic neuro-symbolic rules for auditable safety
    - Calculate personal deviation score and risk level (LOW, MEDIUM, HIGH)
    - Generate counterfactual explanations ("What would have changed the decision?")
    - Leverage LLM service for clinical explanation with 100% deterministic fallback
    """
    def __init__(self, profile: BaselineProfile = None):
        self.name = "Reasoning Agent"
        self.profile = profile or BaselineProfile()
        self.rule_engine = RuleEngine(self.profile)
        self.anomaly_detector = AnomalyDetector()
        self.llm_service = LLMService()

    def build_event_chain(
        self,
        telemetry: TelemetryInput,
        deviations: Dict[str, Any],
        evidence: List[EvidenceItem]
    ) -> List[EventNode]:
        """
        Connects multiple signals into an intuitive chronological event chain.
        Example: Poor sleep -> Late wake-up -> Low activity -> Breakfast missed -> Elevated HR -> Verification initiated
        """
        nodes: List[EventNode] = []
        now = datetime.now()

        # 1. Sleep node
        sleep_hrs = telemetry.sleep_hours
        if sleep_hrs < self.profile.sleep_min:
            nodes.append(EventNode(
                id=str(uuid.uuid4())[:8],
                time="06:30",
                title="Poor sleep duration",
                description=f"Recorded {sleep_hrs:.1f}h sleep (baseline requires {self.profile.sleep_min}h). Restless sleep cycles.",
                severity="warning" if sleep_hrs > 4.5 else "critical",
                signal_type="sleep"
            ))
        else:
            nodes.append(EventNode(
                id=str(uuid.uuid4())[:8],
                time="06:50",
                title="Normal sleep cycle",
                description=f"{sleep_hrs:.1f}h restful sleep recorded within expected personal baseline.",
                severity="normal",
                signal_type="sleep"
            ))

        # 2. Wake-up node
        wake_time = telemetry.wake_time
        if wake_time > self.profile.wake_window_end:
            nodes.append(EventNode(
                id=str(uuid.uuid4())[:8],
                time=wake_time,
                title="Late wake-up detected",
                description=f"Wake-up time of {wake_time} is delayed beyond personal window ({self.profile.wake_window_end}).",
                severity="warning",
                signal_type="wake"
            ))
        else:
            nodes.append(EventNode(
                id=str(uuid.uuid4())[:8],
                time=wake_time,
                title="Routine wake-up",
                description=f"Wake-up at {wake_time} matched personal morning window.",
                severity="normal",
                signal_type="wake"
            ))

        # 3. Activity / Movement node
        steps = telemetry.steps
        if steps < self.profile.steps_min:
            nodes.append(EventNode(
                id=str(uuid.uuid4())[:8],
                time="10:15",
                title="Low morning activity",
                description=f"{steps:,} steps recorded (baseline expectation: {self.profile.steps_min:,}–{self.profile.steps_max:,}).",
                severity="critical" if steps < 2000 else "warning",
                signal_type="activity"
            ))
        else:
            nodes.append(EventNode(
                id=str(uuid.uuid4())[:8],
                time="10:15",
                title="Normal activity cadence",
                description=f"{steps:,} steps recorded. Active movement across living spaces.",
                severity="normal",
                signal_type="activity"
            ))

        # 4. Meal node
        if telemetry.meal_status in ["missed", "delayed"]:
            nodes.append(EventNode(
                id=str(uuid.uuid4())[:8],
                time="10:45",
                title="Breakfast routine missed",
                description="Kitchen sensor detected no food preparation or meal interaction within the morning window.",
                severity="warning",
                signal_type="meal"
            ))

        # 5. Heart Rate node
        hr = telemetry.heart_rate
        if hr > self.profile.hr_max:
            nodes.append(EventNode(
                id=str(uuid.uuid4())[:8],
                time="11:00",
                title="Heart rate elevated",
                description=f"Resting HR measured at {hr:.0f} BPM (+{((hr-self.profile.hr_max)/self.profile.hr_max)*100:.0f}% above baseline).",
                severity="critical" if hr > 90 else "warning",
                signal_type="heart_rate"
            ))

        # 6. Response / Fall / Verification node
        if telemetry.scenario == "FALL":
            nodes.append(EventNode(
                id=str(uuid.uuid4())[:8],
                time="11:01",
                title="Kinematic impact spike",
                description="Sudden gravitational vector change followed by prolonged cessation of movement.",
                severity="critical",
                signal_type="motion"
            ))

        if telemetry.response_status == "none":
            nodes.append(EventNode(
                id=str(uuid.uuid4())[:8],
                time="11:02",
                title="No response to prompt",
                description="Autonomous check-in audio prompt unanswered by user.",
                severity="critical",
                signal_type="response"
            ))

        return nodes

    async def process(
        self,
        telemetry: TelemetryInput,
        deviations: Dict[str, Any],
        evidence: List[EvidenceItem]
    ) -> Tuple[AnalysisResult, Dict[str, Any]]:
        # 1. Symbolic Rules & Risk Evaluation
        risk, dev_score, rules_triggered, counterfactuals = self.rule_engine.evaluate_rules(
            telemetry, deviations, evidence
        )

        # 2. Build Event Chain
        event_chain = self.build_event_chain(telemetry, deviations, evidence)

        # 3. Clinical explanation via LLM or deterministic fallback
        reasoning = await self.llm_service.generate_reasoning_explanation(
            risk, dev_score, evidence, rules_triggered, event_chain
        )

        # 4. Check if verification or escalation is required
        verification_required = risk in ["MEDIUM", "HIGH"]
        if risk == "HIGH":
            recommended_action = "Initiate autonomous check-in immediately. Escalate to caregiver if unverified."
        elif risk == "MEDIUM":
            recommended_action = "Perform gentle check-in and continue passive monitoring."
        else:
            recommended_action = "Maintain normal autonomous monitoring; no intervention required."

        # Assemble signals list for frontend
        signals_list = [
            {
                "name": "Heart Rate",
                "current": f"{telemetry.heart_rate:.0f} BPM",
                "baseline": f"{self.profile.hr_min:.0f}–{self.profile.hr_max:.0f}",
                "deviation": deviations.get("heart_rate", {}).get("deviation_pct", 0.0),
                "direction": deviations.get("heart_rate", {}).get("direction", "normal"),
                "status": deviations.get("heart_rate", {}).get("status", "normal")
            },
            {
                "name": "SpO2",
                "current": f"{telemetry.spo2:.1f}%",
                "baseline": f"{self.profile.spo2_min:.0f}–{self.profile.spo2_max:.0f}%",
                "deviation": deviations.get("spo2", {}).get("deviation_pct", 0.0),
                "direction": deviations.get("spo2", {}).get("direction", "normal"),
                "status": deviations.get("spo2", {}).get("status", "normal")
            },
            {
                "name": "Daily Activity",
                "current": f"{telemetry.steps:,} steps",
                "baseline": f"{self.profile.steps_min:,}–{self.profile.steps_max:,}",
                "deviation": deviations.get("steps", {}).get("deviation_pct", 0.0),
                "direction": deviations.get("steps", {}).get("direction", "normal"),
                "status": deviations.get("steps", {}).get("status", "normal")
            },
            {
                "name": "Sleep",
                "current": f"{telemetry.sleep_hours:.1f} hrs",
                "baseline": f"{self.profile.sleep_min:.1f}–{self.profile.sleep_max:.1f}h",
                "deviation": deviations.get("sleep", {}).get("deviation_pct", 0.0),
                "direction": deviations.get("sleep", {}).get("direction", "normal"),
                "status": deviations.get("sleep", {}).get("status", "normal")
            }
        ]

        result = AnalysisResult(
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            risk=risk,
            personal_deviation_score=dev_score,
            personal_baseline_score=round(max(0.0, 100.0 - dev_score), 1),
            signals=signals_list,
            event_chain=event_chain,
            evidence=evidence,
            rules_triggered=rules_triggered,
            counterfactuals=counterfactuals,
            reasoning=reasoning,
            verification_required=verification_required,
            recommended_action=recommended_action
        )

        agent_metadata = {
            "agent": self.name,
            "status": "COMPLETED",
            "risk_assigned": risk,
            "rules_count": len(rules_triggered),
            "event_nodes_count": len(event_chain)
        }

        return result, agent_metadata
