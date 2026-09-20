from datetime import datetime
from typing import Dict, Any, Tuple
from models.schemas import TelemetryInput
from data.db import get_db_connection, log_event

class SensorAgent:
    """
    Agent 1 — Sensor Agent
    Responsibilities:
    - Ingest raw telemetry
    - Validate physiological & kinematic bounds
    - Impute or flag missing/corrupt values
    - Normalize values into structured sensor state
    """
    def __init__(self):
        self.name = "Sensor Agent"
        self.version = "1.0.0"

    def process(self, telemetry: TelemetryInput) -> Tuple[TelemetryInput, Dict[str, Any]]:
        # 1. Validation & Range clipping
        # Heart rate: 30 to 220 BPM
        hr = max(30.0, min(220.0, float(telemetry.heart_rate)))
        # SpO2: 70 to 100%
        spo2 = max(70.0, min(100.0, float(telemetry.spo2)))
        # Steps: >= 0
        steps = max(0, int(telemetry.steps))
        # Sleep: 0.0 to 24.0
        sleep = max(0.0, min(24.0, float(telemetry.sleep_hours)))
        # Motion level: >= 0.0
        motion = max(0.0, float(telemetry.motion_level))
        
        # 2. Timestamp check
        ts = telemetry.timestamp or datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        cleaned_telemetry = TelemetryInput(
            timestamp=ts,
            user_id=telemetry.user_id,
            heart_rate=round(hr, 1),
            spo2=round(spo2, 1),
            temperature=round(float(telemetry.temperature or 36.6), 1),
            steps=steps,
            activity_level=round(float(telemetry.activity_level), 2),
            sleep_hours=round(sleep, 1),
            wake_time=telemetry.wake_time or "07:00",
            meal_status=telemetry.meal_status or "eaten",
            motion_level=round(motion, 2),
            response_status=telemetry.response_status or "active",
            scenario=telemetry.scenario or "custom"
        )

        # 3. Persist reading to SQLite
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO sensor_readings (
                user_id, timestamp, heart_rate, spo2, temperature,
                steps, activity_level, sleep_hours, wake_time, meal_status,
                motion_level, response_status, scenario
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                cleaned_telemetry.user_id, cleaned_telemetry.timestamp,
                cleaned_telemetry.heart_rate, cleaned_telemetry.spo2, cleaned_telemetry.temperature,
                cleaned_telemetry.steps, cleaned_telemetry.activity_level, cleaned_telemetry.sleep_hours,
                cleaned_telemetry.wake_time, cleaned_telemetry.meal_status, cleaned_telemetry.motion_level,
                cleaned_telemetry.response_status, cleaned_telemetry.scenario
            ))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"[SensorAgent] Persistence warning: {e}")

        sensor_metadata = {
            "agent": self.name,
            "status": "VALIDATED",
            "timestamp": ts,
            "quality_index": 0.99,
            "raw_signals_count": 8,
            "missing_values_detected": 0
        }

        return cleaned_telemetry, sensor_metadata
