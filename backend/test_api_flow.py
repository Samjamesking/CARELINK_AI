import httpx
import json

BASE_URL = "http://127.0.0.1:8000"

def test_full_flow():
    print("=== RUNNING FULL API END-TO-END DEMO TEST ===")
    client = httpx.Client(base_url=BASE_URL, timeout=10.0)

    # 1. Health check
    res = client.get("/api/health")
    print("\n1. Health Check:", res.status_code, res.json())
    assert res.status_code == 200

    # 2. Initial Dashboard State (NORMAL)
    res = client.get("/api/dashboard")
    print("\n2. Initial Dashboard (NORMAL):", res.status_code)
    data = res.json()
    print("   Risk:", data["analysis"]["risk"])
    print("   Deviation Score:", data["analysis"]["personal_deviation_score"])
    print("   System Status:", data["system_status"])
    assert data["analysis"]["risk"] == "LOW"

    # 3. Simulate Anomaly
    res = client.post("/api/simulate/abnormal")
    print("\n3. Simulate ABNORMAL:", res.status_code)
    data = res.json()
    print("   Risk:", data["analysis"]["risk"])
    print("   Deviation Score:", data["analysis"]["personal_deviation_score"])
    print("   Verification Required:", data["analysis"]["verification_required"])
    print("   Rules Triggered:", [r["rule_id"] for r in data["analysis"]["rules_triggered"]])
    print("   Event Chain Length:", len(data["analysis"]["event_chain"]))
    assert data["analysis"]["risk"] == "HIGH"
    assert data["analysis"]["verification_required"] is True

    # 4. Check Verification Session
    verif = data.get("verification_session")
    print("\n4. Active Verification Session:", verif["session_id"], verif["prompt"], verif["status"])
    assert verif["status"] == "PENDING"

    # 5. User responds "okay"
    res = client.post("/api/verify/response", json={
        "session_id": verif["session_id"],
        "response": "okay"
    })
    print("\n5. User Response 'okay':", res.status_code)
    data = res.json()
    print("   Action:", data["action"])
    print("   Escalation Level:", data["escalation_state"]["current_level"])
    print("   Is Escalating:", data["escalation_state"]["is_escalating"])
    assert data["action"] == "CANCEL_ESCALATION"
    assert data["escalation_state"]["is_escalating"] is False

    # 6. Re-trigger Anomaly and test "no_response" -> Caregiver Alert
    res = client.post("/api/simulate/abnormal")
    verif2 = res.json()["verification_session"]
    res = client.post("/api/verify/response", json={
        "session_id": verif2["session_id"],
        "response": "no_response"
    })
    print("\n6. User Response 'no_response' (Timeout):", res.status_code)
    data = res.json()
    print("   Action:", data["action"])
    print("   Escalation Level:", data["escalation_state"]["current_level"])

    # Advance to Level 5 Caregiver Alert
    res = client.post("/api/escalate")
    res = client.post("/api/escalate")
    res = client.post("/api/escalate")
    data = res.json()
    alert = data.get("active_alert")
    print("\n7. Caregiver Alert Created:", alert["alert_id"] if alert else "None")
    print("   Risk Level:", alert["risk_level"] if alert else "None")
    print("   Reason:", alert["reason"][:80] if alert else "None")
    print("   Escalation Stage:", alert["escalation_stage"] if alert else "None")
    assert alert is not None
    assert alert["risk_level"] == "HIGH"

    # 8. Caregiver acknowledges alert
    res = client.post("/api/caregiver/acknowledge", params={"alert_id": alert["alert_id"]})
    print("\n8. Caregiver Acknowledge:", res.status_code, res.json()["alert"]["status"])
    assert res.json()["alert"]["status"] == "ACKNOWLEDGED"

    # 9. Caregiver resolves alert
    res = client.post("/api/caregiver/resolve", params={"alert_id": alert["alert_id"], "resolved_by": "Sarah Vance"})
    print("\n9. Caregiver Resolve:", res.status_code, res.json()["status"])
    assert res.json()["status"] == "success"

    # 10. Simulate Custom What-If Scenario
    res = client.post("/api/simulate/custom", json={
        "poor_sleep": True,
        "low_activity": True,
        "elevated_hr": True,
        "missed_meal": True,
        "fall_motion": False,
        "no_response": False
    })
    print("\n10. Custom What-If Simulation:", res.status_code)
    data = res.json()
    print("    Risk:", data["analysis"]["risk"])
    print("    Personal Deviation:", data["analysis"]["personal_deviation_score"])
    print("    Counterfactuals Count:", len(data["analysis"]["counterfactuals"]))
    assert len(data["analysis"]["counterfactuals"]) >= 2

    # 11. Final Dashboard check
    res = client.get("/api/dashboard")
    print("\n11. Final Dashboard Check:", res.status_code)
    d = res.json()
    print("    Signals Count:", len(d["analysis"]["signals"]))
    print("    Recent Events Count:", len(d["recent_events"]))
    assert len(d["analysis"]["signals"]) == 4

    print("\n>>> ALL API DEMO FLOW TESTS COMPLETED WITH 100% SUCCESS! <<<")

if __name__ == "__main__":
    test_full_flow()
