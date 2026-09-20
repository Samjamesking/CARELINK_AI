from typing import List, Dict, Any, Tuple, Optional
from models.schemas import CaregiverAlert, EscalationState, AnalysisResult, VerificationSession
from services.alert_service import AlertService
from data.db import log_event

class CareAgent:
    """
    Agent 5 — Care Agent
    Responsibilities:
    - Manage the 5-stage adaptive escalation ladder
    - Synthesize evidence package for caregivers
    - Dispatch and monitor Caregiver Alerts
    - Log escalation lifecycle events
    """
    def __init__(self):
        self.name = "Care Agent"
        self.escalation_state = EscalationState()

    def advance_escalation(
        self,
        analysis: AnalysisResult,
        verification_session: Optional[VerificationSession] = None,
        force_max: bool = False
    ) -> Tuple[EscalationState, Optional[CaregiverAlert]]:
        """
        Advances escalation ladder from 1 through 5.
        If force_max or level 5 reached, creates an active Caregiver Alert.
        """
        if force_max:
            new_level = 5
        else:
            new_level = min(5, self.escalation_state.current_level + 1)

        self.escalation_state.current_level = new_level
        self.escalation_state.is_escalating = new_level > 1

        active_alert = None
        if new_level >= 4:
            # Prepare evidence summary strings
            evidence_strings = [
                f"{e.signal}: {e.current} ({e.deviation_percent:.0f}% deviation from baseline)"
                for e in analysis.evidence
            ]
            if not evidence_strings:
                evidence_strings = [
                    f"Activity: {analysis.personal_deviation_score:.0f}% deviation from baseline",
                    "Routine interaction check-in unanswered"
                ]

            verif_status = verification_session.status if verification_session else "NO_RESPONSE"
            reason = (
                f"Multiple correlated deviations from personal baseline (Score: {analysis.personal_deviation_score}%). "
                f"Autonomous verification check-in: {verif_status}."
            )

            active_alert = AlertService.create_alert(
                risk_level=analysis.risk,
                reason=reason,
                evidence=evidence_strings,
                verification_status=verif_status,
                recommended_action="Contact user directly or dispatch designated caregiver for immediate wellbeing check.",
                escalation_stage=new_level
            )
            self.escalation_state.active_alert_id = active_alert.alert_id

        log_event(
            title=f"Escalation Stage {new_level}: {self.escalation_state.level_descriptions.get(new_level, '')}",
            description=f"Risk: {analysis.risk}. Current stage: Level {new_level}.",
            severity="critical" if new_level >= 4 else "warning",
            event_type="ESCALATION_UPDATE",
            metadata={"level": new_level}
        )

        return self.escalation_state, active_alert

    def reset_escalation(self, reason: str = "User confirmed wellbeing") -> EscalationState:
        """
        Resets escalation ladder to Level 1 and halts active alerts.
        """
        self.escalation_state.current_level = 1
        self.escalation_state.is_escalating = False
        self.escalation_state.active_alert_id = None

        log_event(
            title="Escalation Reset",
            description=f"Escalation halted: {reason}. Returned to Level 1 passive monitoring.",
            severity="normal",
            event_type="ESCALATION_RESET"
        )
        return self.escalation_state
