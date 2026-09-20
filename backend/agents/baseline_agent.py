from typing import Dict, Any, Tuple, List
from models.schemas import TelemetryInput, BaselineProfile, EvidenceItem
from services.baseline_engine import BaselineEngine
from data.db import get_db_connection

class BaselineAgent:
    """
    Agent 2 — Baseline Agent
    Responsibilities:
    - Maintain and retrieve the user's personal digital twin baseline
    - Compare current telemetry against personal baseline ranges
    - Calculate percentage deviations for each signal
    - Identify subtle or compounding routine changes
    """
    def __init__(self, user_id: str = "user_default_01"):
        self.name = "Baseline Agent"
        self.user_id = user_id
        self.profile = self._load_profile()
        self.engine = BaselineEngine(self.profile)

    def _load_profile(self) -> BaselineProfile:
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM baseline_profiles WHERE user_id = ?", (self.user_id,))
            row = cursor.fetchone()
            conn.close()
            if row:
                return BaselineProfile(
                    user_id=row["user_id"],
                    hr_min=row["hr_min"],
                    hr_max=row["hr_max"],
                    hr_mean=row["hr_mean"],
                    spo2_min=row["spo2_min"],
                    spo2_max=row["spo2_max"],
                    steps_min=row["steps_min"],
                    steps_max=row["steps_max"],
                    steps_mean=row["steps_mean"],
                    sleep_min=row["sleep_min"],
                    sleep_max=row["sleep_max"],
                    sleep_mean=row["sleep_mean"],
                    wake_window_start=row["wake_window_start"],
                    wake_window_end=row["wake_window_end"],
                    breakfast_window_start=row["breakfast_window_start"],
                    breakfast_window_end=row["breakfast_window_end"]
                )
        except Exception as e:
            print(f"[BaselineAgent] Fallback to default baseline: {e}")
        return BaselineProfile()

    def process(self, telemetry: TelemetryInput) -> Tuple[Dict[str, Any], List[EvidenceItem], Dict[str, Any]]:
        result = self.engine.calculate_deviations(telemetry)
        deviations = result["deviations"]
        evidence = result["evidence"]

        # Calculate overall baseline adherence score (e.g. 92% baseline match)
        total_signals = len(deviations)
        normal_signals = sum(1 for d in deviations.values() if d["status"] == "normal")
        adherence_score = round((normal_signals / max(1, total_signals)) * 100.0, 1)

        baseline_metadata = {
            "agent": self.name,
            "status": "COMPLETED",
            "adherence_score": adherence_score,
            "deviating_signals_count": len(evidence),
            "profile_user": self.user_id
        }

        return deviations, evidence, baseline_metadata
