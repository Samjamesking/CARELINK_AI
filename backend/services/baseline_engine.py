from typing import Dict, Any, Tuple
from models.schemas import BaselineProfile, TelemetryInput, EvidenceItem

class BaselineEngine:
    def __init__(self, profile: BaselineProfile = None):
        self.profile = profile or BaselineProfile()

    def calculate_deviations(self, telemetry: TelemetryInput) -> Dict[str, Any]:
        """
        Calculates signal-by-signal deviations against personal baseline.
        Returns percentage deviations, direction, and evidence items.
        """
        evidence: list[EvidenceItem] = []
        deviations = {}

        # 1. Heart Rate (BPM)
        hr = telemetry.heart_rate
        if hr < self.profile.hr_min:
            dev = ((self.profile.hr_min - hr) / self.profile.hr_min) * 100.0
            direction = "below"
            severity = "warning" if dev > 15 else "info"
            desc = f"HR is {dev:.1f}% below personal minimum ({self.profile.hr_min} BPM)"
        elif hr > self.profile.hr_max:
            dev = ((hr - self.profile.hr_max) / self.profile.hr_max) * 100.0
            direction = "above"
            severity = "critical" if dev > 25 else ("warning" if dev > 10 else "info")
            desc = f"HR is {dev:.1f}% above personal maximum ({self.profile.hr_max} BPM)"
        else:
            dev = 0.0
            direction = "normal"
            severity = "info"
            desc = f"Within normal baseline ({self.profile.hr_min}–{self.profile.hr_max} BPM)"
        
        deviations["heart_rate"] = {
            "value": hr,
            "baseline": f"{self.profile.hr_min:.0f}–{self.profile.hr_max:.0f} BPM",
            "deviation_pct": round(dev, 1),
            "direction": direction,
            "status": "normal" if dev == 0 else ("critical" if severity == "critical" else "warning")
        }
        if dev > 5:
            evidence.append(EvidenceItem(
                signal="Heart Rate",
                baseline=f"{self.profile.hr_min:.0f}–{self.profile.hr_max:.0f} BPM",
                current=f"{hr:.0f} BPM",
                deviation_percent=round(dev, 1),
                direction=direction,
                severity=severity,
                description=desc
            ))

        # 2. SpO2 (%)
        spo2 = telemetry.spo2
        if spo2 < self.profile.spo2_min:
            dev = ((self.profile.spo2_min - spo2) / self.profile.spo2_min) * 100.0
            direction = "below"
            severity = "critical" if dev > 4 else "warning"
            desc = f"SpO₂ is {dev:.1f}% below baseline floor ({self.profile.spo2_min}%)"
        else:
            dev = 0.0
            direction = "normal"
            severity = "info"
            desc = f"SpO₂ within normal baseline ({self.profile.spo2_min}–{self.profile.spo2_max}%)"

        deviations["spo2"] = {
            "value": spo2,
            "baseline": f"{self.profile.spo2_min:.0f}–{self.profile.spo2_max:.0f}%",
            "deviation_pct": round(dev, 1),
            "direction": direction,
            "status": "normal" if dev == 0 else ("critical" if severity == "critical" else "warning")
        }
        if dev > 1:
            evidence.append(EvidenceItem(
                signal="SpO2",
                baseline=f"{self.profile.spo2_min:.0f}–{self.profile.spo2_max:.0f}%",
                current=f"{spo2:.1f}%",
                deviation_percent=round(dev, 1),
                direction=direction,
                severity=severity,
                description=desc
            ))

        # 3. Daily Activity / Steps
        steps = telemetry.steps
        if steps < self.profile.steps_min:
            dev = ((self.profile.steps_min - steps) / self.profile.steps_min) * 100.0
            direction = "below"
            severity = "critical" if dev > 60 else ("warning" if dev > 30 else "info")
            desc = f"Activity is {dev:.1f}% below normal minimum ({self.profile.steps_min:,} steps)"
        elif steps > self.profile.steps_max:
            dev = ((steps - self.profile.steps_max) / self.profile.steps_max) * 100.0
            direction = "above"
            severity = "info"
            desc = f"Activity is {dev:.1f}% above typical range ({self.profile.steps_max:,} steps)"
        else:
            dev = 0.0
            direction = "normal"
            severity = "info"
            desc = f"Activity within normal baseline ({self.profile.steps_min:,}–{self.profile.steps_max:,} steps)"

        deviations["steps"] = {
            "value": steps,
            "baseline": f"{self.profile.steps_min:,}–{self.profile.steps_max:,}",
            "deviation_pct": round(dev, 1),
            "direction": direction,
            "status": "normal" if dev == 0 else ("critical" if severity == "critical" else "warning")
        }
        if dev > 15:
            evidence.append(EvidenceItem(
                signal="Activity",
                baseline=f"{self.profile.steps_min:,}–{self.profile.steps_max:,}",
                current=f"{steps:,} steps",
                deviation_percent=round(dev, 1),
                direction=direction,
                severity=severity,
                description=desc
            ))

        # 4. Sleep (Hours)
        sleep = telemetry.sleep_hours
        if sleep < self.profile.sleep_min:
            dev = ((self.profile.sleep_min - sleep) / self.profile.sleep_min) * 100.0
            direction = "below"
            severity = "critical" if dev > 40 else ("warning" if dev > 20 else "info")
            desc = f"Sleep is {dev:.1f}% below baseline requirement ({self.profile.sleep_min:.1f}h)"
        elif sleep > self.profile.sleep_max:
            dev = ((sleep - self.profile.sleep_max) / self.profile.sleep_max) * 100.0
            direction = "above"
            severity = "warning" if dev > 30 else "info"
            desc = f"Sleep is {dev:.1f}% above typical duration ({self.profile.sleep_max:.1f}h)"
        else:
            dev = 0.0
            direction = "normal"
            severity = "info"
            desc = f"Sleep within normal range ({self.profile.sleep_min:.1f}–{self.profile.sleep_max:.1f}h)"

        deviations["sleep"] = {
            "value": sleep,
            "baseline": f"{self.profile.sleep_min:.1f}–{self.profile.sleep_max:.1f}h",
            "deviation_pct": round(dev, 1),
            "direction": direction,
            "status": "normal" if dev == 0 else ("critical" if severity == "critical" else "warning")
        }
        if dev > 15:
            evidence.append(EvidenceItem(
                signal="Sleep",
                baseline=f"{self.profile.sleep_min:.1f}–{self.profile.sleep_max:.1f}h",
                current=f"{sleep:.1f}h",
                deviation_percent=round(dev, 1),
                direction=direction,
                severity=severity,
                description=desc
            ))

        # 5. Wake-up time & Meal status
        wake_dev = 0.0
        try:
            wake_h, wake_m = map(int, telemetry.wake_time.split(":"))
            expected_h, expected_m = map(int, self.profile.wake_window_end.split(":"))
            wake_minutes = wake_h * 60 + wake_m
            expected_minutes = expected_h * 60 + expected_m
            if wake_minutes > expected_minutes:
                diff = wake_minutes - expected_minutes
                wake_dev = min(100.0, (diff / 60.0) * 35.0)
                evidence.append(EvidenceItem(
                    signal="Wake Time",
                    baseline=f"{self.profile.wake_window_start}–{self.profile.wake_window_end}",
                    current=telemetry.wake_time,
                    deviation_percent=round(wake_dev, 1),
                    direction="late",
                    severity="warning" if diff > 60 else "info",
                    description=f"Wake-up time is {diff} minutes later than baseline window"
                ))
        except Exception:
            pass

        if telemetry.meal_status in ["missed", "delayed"]:
            meal_dev = 80.0 if telemetry.meal_status == "missed" else 30.0
            evidence.append(EvidenceItem(
                signal="Breakfast",
                baseline=f"{self.profile.breakfast_window_start}–{self.profile.breakfast_window_end}",
                current=telemetry.meal_status.capitalize(),
                deviation_percent=meal_dev,
                direction="abnormal",
                severity="warning" if telemetry.meal_status == "missed" else "info",
                description=f"Morning routine disrupted: Breakfast was {telemetry.meal_status}"
            ))

        # 6. Response status
        if telemetry.response_status in ["delayed", "none"]:
            resp_dev = 95.0 if telemetry.response_status == "none" else 50.0
            evidence.append(EvidenceItem(
                signal="Responsiveness",
                baseline="Active prompt reply (<2 min)",
                current=telemetry.response_status.capitalize(),
                deviation_percent=resp_dev,
                direction="delayed" if telemetry.response_status == "delayed" else "unresponsive",
                severity="critical" if telemetry.response_status == "none" else "warning",
                description="No response received to routine interaction check" if telemetry.response_status == "none" else "Significant latency in routine interaction response"
            ))

        return {
            "deviations": deviations,
            "evidence": evidence
        }
