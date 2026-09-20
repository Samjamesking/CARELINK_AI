import sys
import os
import asyncio

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from models.schemas import TelemetryInput
from agents.sensor_agent import SensorAgent
from agents.baseline_agent import BaselineAgent
from agents.reasoning_agent import ReasoningAgent
from agents.verification_agent import VerificationAgent
from agents.care_agent import CareAgent
from data.db import init_db

async def test_carelink_pipeline():
    print("=== TESTING CARELINK AI PIPELINE ===")
    init_db()

    sensor_agent = SensorAgent()
    baseline_agent = BaselineAgent()
    reasoning_agent = ReasoningAgent(baseline_agent.profile)
    verification_agent = VerificationAgent()
    care_agent = CareAgent()

    # Test 1: Normal State
    print("\n--- Test 1: Normal Day ---")
    t_normal = TelemetryInput(
        heart_rate=68.0,
        spo2=98.0,
        steps=5820,
        sleep_hours=7.4,
        wake_time="07:05",
        meal_status="eaten",
        motion_level=1.0,
        response_status="active",
        scenario="NORMAL"
    )
    cleaned, _ = sensor_agent.process(t_normal)
    devs, evs, _ = baseline_agent.process(cleaned)
    analysis, _ = await reasoning_agent.process(cleaned, devs, evs)
    print(f"Risk: {analysis.risk}, Personal Deviation: {analysis.personal_deviation_score}%, Rules: {len(analysis.rules_triggered)}")
    assert analysis.risk == "LOW", f"Expected LOW risk, got {analysis.risk}"
    assert analysis.personal_deviation_score < 25.0, "Expected low deviation score"

    # Test 2: Anomaly / Multi-signal deviation
    print("\n--- Test 2: Anomaly / Multi-signal deviation ---")
    t_anom = TelemetryInput(
        heart_rate=86.0,
        spo2=95.5,
        steps=1650,
        sleep_hours=4.2,
        wake_time="09:42",
        meal_status="missed",
        motion_level=0.15,
        response_status="none",
        scenario="ABNORMAL"
    )
    cleaned, _ = sensor_agent.process(t_anom)
    devs, evs, _ = baseline_agent.process(cleaned)
    analysis, _ = await reasoning_agent.process(cleaned, devs, evs)
    print(f"Risk: {analysis.risk}, Personal Deviation: {analysis.personal_deviation_score}%")
    print(f"Rules triggered: {[r.rule_id + ': ' + r.name for r in analysis.rules_triggered]}")
    print(f"Event chain nodes: {len(analysis.event_chain)}")
    print(f"Reasoning: {analysis.reasoning[:120]}...")
    assert analysis.risk == "HIGH", f"Expected HIGH risk, got {analysis.risk}"
    assert analysis.personal_deviation_score > 70.0, "Expected high deviation score"
    assert len(analysis.rules_triggered) >= 1, "Expected symbolic rules triggered"
    assert len(analysis.counterfactuals) >= 2, "Expected counterfactual explanations"

    # Test 3: Verification Loop - "I'm okay"
    print("\n--- Test 3: Verification - 'I\\'m okay' ---")
    session = verification_agent.start_verification(analysis)
    updated_session, action, _ = verification_agent.process_response(session.session_id, "okay")
    print(f"Verification Action: {action}, Status: {updated_session.status}")
    assert action == "CANCEL_ESCALATION"

    # Test 4: Verification Loop - "No Response" -> Escalation Ladder
    print("\n--- Test 4: Verification - 'No Response' -> Escalation ---")
    session2 = verification_agent.start_verification(analysis)
    updated_session2, action2, _ = verification_agent.process_response(session2.session_id, "no_response")
    print(f"Verification Action: {action2}, Status: {updated_session2.status}")
    assert action2 == "ESCALATE_NEXT_STAGE"

    escalation_state, alert = care_agent.advance_escalation(analysis, updated_session2, force_max=True)
    print(f"Escalation Level: {escalation_state.current_level}, Alert ID: {alert.alert_id if alert else 'None'}")
    assert escalation_state.current_level == 5
    assert alert is not None
    assert alert.risk_level == "HIGH"

    print("\n>>> ALL PIPELINE TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    asyncio.run(test_carelink_pipeline())
