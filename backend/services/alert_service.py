import uuid
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from data.db import get_db_connection, log_event
from models.schemas import CaregiverAlert

class AlertService:
    @staticmethod
    def create_alert(
        risk_level: str,
        reason: str,
        evidence: List[str],
        verification_status: str,
        recommended_action: str,
        escalation_stage: int = 5
    ) -> CaregiverAlert:
        alert_id = f"ALT-{uuid.uuid4().hex[:8].upper()}"
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO caregiver_alerts (
            alert_id, timestamp, risk_level, reason, evidence_json,
            verification_status, recommended_action, escalation_stage, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
        """, (
            alert_id, now_str, risk_level, reason,
            json.dumps(evidence), verification_status, recommended_action, escalation_stage
        ))
        conn.commit()
        conn.close()

        log_event(
            title=f"Caregiver Alert Created ({alert_id})",
            description=f"Level {escalation_stage} alert: {reason}. Verification: {verification_status}",
            severity="critical",
            event_type="CAREGIVER_ALERT",
            metadata={"alert_id": alert_id, "risk_level": risk_level}
        )

        return CaregiverAlert(
            alert_id=alert_id,
            timestamp=now_str,
            risk_level=risk_level,
            reason=reason,
            evidence=evidence,
            verification_status=verification_status,
            recommended_action=recommended_action,
            escalation_stage=escalation_stage,
            status="ACTIVE",
            contact_attempted=False
        )

    @staticmethod
    def get_active_alert() -> Optional[CaregiverAlert]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        SELECT * FROM caregiver_alerts 
        WHERE status IN ('ACTIVE', 'ACKNOWLEDGED') 
        ORDER BY timestamp DESC LIMIT 1
        """)
        row = cursor.fetchone()
        conn.close()

        if not row:
            return None

        return CaregiverAlert(
            alert_id=row["alert_id"],
            timestamp=str(row["timestamp"]),
            risk_level=row["risk_level"],
            reason=row["reason"],
            evidence=json.loads(row["evidence_json"]) if row["evidence_json"] else [],
            verification_status=row["verification_status"],
            recommended_action=row["recommended_action"],
            escalation_stage=row["escalation_stage"],
            status=row["status"],
            contact_attempted=bool(row["contact_attempted"]),
            resolved_at=str(row["resolved_at"]) if row["resolved_at"] else None,
            resolved_by=row["resolved_by"]
        )

    @staticmethod
    def get_alert_by_id(alert_id: str) -> Optional[CaregiverAlert]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM caregiver_alerts WHERE alert_id = ?", (alert_id,))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        return CaregiverAlert(
            alert_id=row["alert_id"],
            timestamp=str(row["timestamp"]),
            risk_level=row["risk_level"],
            reason=row["reason"],
            evidence=json.loads(row["evidence_json"]) if row["evidence_json"] else [],
            verification_status=row["verification_status"],
            recommended_action=row["recommended_action"],
            escalation_stage=row["escalation_stage"],
            status=row["status"],
            contact_attempted=bool(row["contact_attempted"]),
            resolved_at=str(row["resolved_at"]) if row["resolved_at"] else None,
            resolved_by=row["resolved_by"]
        )

    @staticmethod
    def acknowledge_alert(alert_id: str) -> Optional[CaregiverAlert]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE caregiver_alerts 
        SET status = 'ACKNOWLEDGED', contact_attempted = 1 
        WHERE alert_id = ?
        """, (alert_id,))
        conn.commit()
        conn.close()

        log_event(
            title=f"Caregiver Alert Acknowledged ({alert_id})",
            description="Caregiver Sarah Vance acknowledged receipt of alert and initiated contact.",
            severity="warning",
            event_type="CAREGIVER_ACK"
        )
        return AlertService.get_alert_by_id(alert_id)

    @staticmethod
    def resolve_alert(alert_id: str, resolved_by: str = "Caregiver") -> bool:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE caregiver_alerts 
        SET status = 'RESOLVED', resolved_at = ?, resolved_by = ? 
        WHERE alert_id = ?
        """, (now_str, resolved_by, alert_id))
        conn.commit()
        conn.close()

        log_event(
            title=f"Caregiver Alert Resolved ({alert_id})",
            description=f"Alert marked resolved by {resolved_by}. Monitoring returned to baseline.",
            severity="normal",
            event_type="ALERT_RESOLVED"
        )
        return True
