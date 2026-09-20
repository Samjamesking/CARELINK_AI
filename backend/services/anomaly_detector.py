import numpy as np
from sklearn.ensemble import IsolationForest
from typing import List, Dict, Any
from models.schemas import TelemetryInput

class AnomalyDetector:
    def __init__(self):
        # Initialize an Isolation Forest trained on typical senior living baseline distribution
        # Features: [heart_rate, spo2, steps, activity_level, sleep_hours, motion_level]
        self.model = IsolationForest(
            n_estimators=30,
            contamination=0.08,
            random_state=42,
            n_jobs=1
        )
        self._train_synthetic_baseline()

    def _train_synthetic_baseline(self):
        # Generate 300 normal baseline points
        np.random.seed(42)
        n_samples = 300
        hr = np.random.normal(68.0, 3.0, n_samples)
        spo2 = np.random.normal(97.5, 0.8, n_samples)
        steps = np.random.normal(6200, 500, n_samples)
        activity = np.random.normal(1.0, 0.15, n_samples)
        sleep = np.random.normal(7.4, 0.4, n_samples)
        motion = np.random.normal(1.0, 0.15, n_samples)
        
        X_train = np.column_stack([hr, spo2, steps, activity, sleep, motion])
        self.model.fit(X_train)

    def compute_anomaly_score(self, telemetry: TelemetryInput) -> float:
        """
        Returns an anomaly score normalized between 0.0 (perfectly normal) and 1.0 (extreme anomaly).
        """
        features = np.array([[
            telemetry.heart_rate,
            telemetry.spo2,
            float(telemetry.steps),
            telemetry.activity_level,
            telemetry.sleep_hours,
            telemetry.motion_level
        ]])
        
        # decision_function returns negative values for anomalies, positive for normal
        raw_score = self.model.decision_function(features)[0]
        
        # Transform raw score into a 0.0 - 1.0 scale
        # Normal samples have raw_score around 0.10 to 0.25; anomalies around -0.15 to -0.35
        normalized_score = 1.0 / (1.0 + np.exp(raw_score * 8.0))
        return float(np.clip(normalized_score, 0.0, 1.0))
