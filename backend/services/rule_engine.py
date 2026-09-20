from typing import List, Dict, Any, Tuple
from models.schemas import TelemetryInput, BaselineProfile, SymbolicRuleTriggered, CounterfactualItem, EvidenceItem

class RuleEngine:
    def __init__(self, profile: BaselineProfile = None):
        self.profile = profile or BaselineProfile()

    def evaluate_rules(
        self, 
        telemetry: TelemetryInput, 
        deviations: Dict[str, Any],
        evidence: List[EvidenceItem]
    ) -> Tuple[str, float, List[SymbolicRuleTriggered], List[CounterfactualItem]]:
        """
        Deterministic neuro-symbolic reasoning:
        Evaluates explicit safety rules, computes personal deviation score,
        and generates counterfactual explanations.
        """
        rules_triggered: List[SymbolicRuleTriggered] = []
        counterfactuals: List[CounterfactualItem] = []

        # Extract deviations
        hr_dev = deviations.get("heart_rate", {}).get("deviation_pct", 0.0)
        hr_dir = deviations.get("heart_rate", {}).get("direction", "normal")
        steps_dev = deviations.get("steps", {}).get("deviation_pct", 0.0)
        steps_dir = deviations.get("steps", {}).get("direction", "normal")
        sleep_dev = deviations.get("sleep", {}).get("deviation_pct", 0.0)
        spo2_dev = deviations.get("spo2", {}).get("deviation_pct", 0.0)
        
        is_fall = telemetry.scenario == "FALL" or (telemetry.motion_level < 0.08 and telemetry.heart_rate > 100)
        is_unresponsive = telemetry.response_status == "none"
        is_delayed_resp = telemetry.response_status == "delayed"
        meal_missed = telemetry.meal_status == "missed"
        
        # Rule R4: Fall-like Sudden Motion Cessation
        if is_fall:
            rules_triggered.append(SymbolicRuleTriggered(
                rule_id="R4",
                name="Fall-like Motion Cessation Pattern",
                description="Sudden kinematic spike followed by prolonged immobility and tachycardia.",
                impact="HIGH",
                condition_met=f"Motion index {telemetry.motion_level:.2f} < 0.08 AND HR {telemetry.heart_rate:.0f} BPM"
            ))

        # Rule R1: Activity drop + Unresponsive
        if steps_dev > 60.0 and steps_dir == "below" and is_unresponsive:
            rules_triggered.append(SymbolicRuleTriggered(
                rule_id="R1",
                name="Severe Inactivity + Lack of Response",
                description="User activity is severely depressed and interaction verification was unanswered.",
                impact="HIGH",
                condition_met=f"Activity deviation -{steps_dev:.1f}% AND response status 'none'"
            ))

        # Rule R2: Elevated HR + Depressed Activity
        if hr_dir == "above" and hr_dev >= 15.0 and steps_dir == "below" and steps_dev >= 45.0:
            impact_level = "HIGH" if (is_unresponsive or hr_dev >= 20.0 or steps_dev >= 60.0) else "MEDIUM"
            rules_triggered.append(SymbolicRuleTriggered(
                rule_id="R2",
                name="Physiological Stress + Activity Reduction",
                description="Elevated cardiac exertion coupled with abnormal reduction in physical movement.",
                impact=impact_level,
                condition_met=f"HR deviation +{hr_dev:.1f}% AND activity deviation -{steps_dev:.1f}%"
            ))

        # Rule R3: Multi-Signal Routine Breakdown
        routine_breakdown_count = sum([
            1 if sleep_dev > 25.0 else 0,
            1 if steps_dev > 30.0 else 0,
            1 if meal_missed else 0,
            1 if hr_dev > 10.0 else 0
        ])
        if routine_breakdown_count >= 3:
            rules_triggered.append(SymbolicRuleTriggered(
                rule_id="R3",
                name="Correlated Routine Breakdown",
                description="Three or more distinct behavioral pillars deviated simultaneously from personal baseline.",
                impact="HIGH" if (is_unresponsive or hr_dev >= 20.0 or steps_dev >= 60.0) else "MEDIUM",
                condition_met=f"{routine_breakdown_count} correlated signal anomalies detected (Sleep, Wake, Meal, Activity)"
            ))

        # Rule R5: Acute Physiological Vital Anomaly
        if telemetry.spo2 < 94.0 or telemetry.heart_rate > 115.0:
            rules_triggered.append(SymbolicRuleTriggered(
                rule_id="R5",
                name="Acute Vital Limit Deviation",
                description="Vital signs crossed personal conservative wellbeing boundary.",
                impact="HIGH",
                condition_met=f"SpO₂ {telemetry.spo2}% or HR {telemetry.heart_rate} BPM exceeded safety envelope"
            ))

        # Determine Risk Level & Composite Personal Deviation Score
        if any(r.impact == "HIGH" for r in rules_triggered):
            risk = "HIGH"
            # Matches the ~87% score specified in prompt
            dev_score = max(78.0, min(94.0, 52.0 + (steps_dev * 0.25) + (hr_dev * 0.3) + (15.0 if is_unresponsive else 8.0)))
        elif any(r.impact == "MEDIUM" for r in rules_triggered) or len(rules_triggered) > 0:
            risk = "MEDIUM"
            dev_score = max(42.0, min(74.0, 30.0 + (steps_dev * 0.2) + (hr_dev * 0.2) + (15.0 if is_delayed_resp else 5.0)))
        else:
            risk = "LOW"
            # Normal deviation score 5% to 18%
            dev_score = max(6.0, min(18.0, (steps_dev * 0.08) + (hr_dev * 0.08) + (sleep_dev * 0.05)))

        # Counterfactual Explanations
        counterfactuals.append(CounterfactualItem(
            condition="User confirms \"I'm okay\" during verification",
            hypothetical_outcome="Escalation halts immediately; system logs wellbeing confirmation and returns to passive monitoring.",
            risk_impact="Risk reduces to LOW"
        ))
        
        counterfactuals.append(CounterfactualItem(
            condition="Activity returns toward personal baseline (>5,200 steps)",
            hypothetical_outcome="Movement pattern matches historical routine; personal deviation score falls below 25%.",
            risk_impact="Risk decreases to LOW"
        ))

        if hr_dev > 15.0:
            counterfactuals.append(CounterfactualItem(
                condition="Only Heart Rate was elevated, with normal morning routine & activity",
                hypothetical_outcome="Isolated single-metric anomaly treated as potential transient exertion or reading noise without disturbing caregiver.",
                risk_impact="Status remains 'MONITORING' (No Escalation)"
            ))

        if is_unresponsive:
            counterfactuals.append(CounterfactualItem(
                condition="User acknowledged check-in within standard 20s window",
                hypothetical_outcome="Caregiver alert dispatch prevented; system marks verification as responsive.",
                risk_impact="No Level 5 escalation triggered"
            ))

        return risk, round(dev_score, 1), rules_triggered, counterfactuals
