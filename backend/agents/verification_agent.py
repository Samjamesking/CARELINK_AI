import uuid
from datetime import datetime
from typing import Optional, Dict, Any, Tuple
from models.schemas import VerificationSession, AnalysisResult
from data.db import get_db_connection, log_event

class VerificationAgent:
    """
    Agent 4 — Verification Agent
    Responsibilities:
    - Determine if autonomous check-in verification is needed
    - Spawn and manage Verification Sessions ("Are you feeling okay?")
    - Process user responses:
        - "okay" -> Verification successful, cancel escalation, resume monitoring
        - "help" -> Immediate escalation to caregiver
        - "no_response" -> Progress to next escalation stage
    """
    def __init__(self):
        self.name = "Verification Agent"
        self.current_session: Optional[VerificationSession] = None

    def start_verification(
        self,
        analysis: AnalysisResult,
        timeout_seconds: int = 20,
        prompt: str = "Are you feeling okay?"
    ) -> VerificationSession:
        session_id = f"VER-{uuid.uuid4().hex[:8].upper()}"
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        session = VerificationSession(
            session_id=session_id,
            timestamp=now_str,
            prompt=prompt,
            status="PENDING",
            timeout_seconds=timeout_seconds,
            elapsed_seconds=0,
            user_response=None,
            verification_method="autonomous_voice_and_screen_prompt",
            details=f"Initiated due to {analysis.risk} risk state (Personal Deviation: {analysis.personal_deviation_score}%)."
        )

        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO verification_sessions (
                session_id, timestamp, prompt, status, timeout_seconds, user_response, details
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                session.session_id, session.timestamp, session.prompt,
                session.status, session.timeout_seconds, session.user_response, session.details
            ))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"[VerificationAgent] DB insert error: {e}")

        log_event(
            title=f"Verification Prompt Dispatched ({session_id})",
            description=f"Autonomous check-in: '{prompt}'. Window: {timeout_seconds}s.",
            severity="warning",
            event_type="VERIFICATION_START",
            metadata={"session_id": session_id, "risk": analysis.risk}
        )

        self.current_session = session
        return session

    def process_response(
        self,
        session_id: Optional[str],
        response: str,
        comment: Optional[str] = None
    ) -> Tuple[VerificationSession, str, Dict[str, Any]]:
        """
        Processes user response:
        - "okay": Escalation cancelled
        - "help": Urgent caregiver alert
        - "no_response": Advance escalation ladder
        """
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        target_id = session_id or (self.current_session.session_id if self.current_session else f"VER-{uuid.uuid4().hex[:8].upper()}")

        if response == "okay":
            status = "VERIFIED"
            action = "CANCEL_ESCALATION"
            desc = "User confirmed wellbeing ('I\\'m okay'). Escalation cancelled. Monitoring resumed."
            severity = "normal"
        elif response == "help":
            status = "HELP_REQUESTED"
            action = "ESCALATE_IMMEDIATE"
            desc = "User explicitly requested assistance ('I need help'). Triggering immediate caregiver alert."
            severity = "critical"
        else:  # "no_response" or timeout
            status = "TIMEOUT"
            action = "ESCALATE_NEXT_STAGE"
            desc = "No response received within verification window (20s). Advancing escalation ladder."
            severity = "critical"

        # Update in database
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
            UPDATE verification_sessions 
            SET status = ?, user_response = ?, details = ? 
            WHERE session_id = ?
            """, (status, response, desc, target_id))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"[VerificationAgent] DB update error: {e}")

        log_event(
            title=f"Verification Result: {status}",
            description=desc,
            severity=severity,
            event_type="VERIFICATION_RESULT",
            metadata={"session_id": target_id, "action": action}
        )

        updated_session = VerificationSession(
            session_id=target_id,
            timestamp=now_str,
            prompt="Are you feeling okay?",
            status=status,
            timeout_seconds=20,
            elapsed_seconds=20 if response == "no_response" else 4,
            user_response=response,
            details=desc
        )
        self.current_session = updated_session

        metadata = {
            "agent": self.name,
            "status": "COMPLETED",
            "verification_status": status,
            "action": action
        }

        return updated_session, action, metadata
