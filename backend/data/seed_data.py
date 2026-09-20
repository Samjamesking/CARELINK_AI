import csv
import os
import random
from datetime import datetime, timedelta

def generate_sensor_data_csv():
    csv_path = os.path.join(os.path.dirname(__file__), "sensor_data.csv")
    os.makedirs(os.path.dirname(csv_path), exist_ok=True)
    
    headers = [
        "timestamp",
        "user_id",
        "heart_rate",
        "spo2",
        "temperature",
        "steps",
        "activity_level",
        "sleep_hours",
        "wake_time",
        "meal_status",
        "motion_level",
        "response_status",
        "scenario"
    ]
    
    rows = []
    base_time = datetime.now() - timedelta(days=3)
    
    # 1. Normal baseline days (72 hourly data points)
    for i in range(72):
        t = base_time + timedelta(hours=i)
        hour = t.hour
        
        # Diurnal pattern
        is_sleeping = hour >= 23 or hour < 7
        if is_sleeping:
            hr = round(random.uniform(62.0, 68.0), 1)
            spo2 = round(random.uniform(96.5, 98.5), 1)
            steps = 0
            activity = 0.1
            motion = round(random.uniform(0.05, 0.2), 2)
        elif 7 <= hour < 9:
            hr = round(random.uniform(68.0, 74.0), 1)
            spo2 = round(random.uniform(97.0, 99.0), 1)
            steps = random.randint(400, 800)
            activity = 1.1
            motion = round(random.uniform(0.8, 1.4), 2)
        elif 9 <= hour < 18:
            hr = round(random.uniform(66.0, 72.0), 1)
            spo2 = round(random.uniform(97.0, 99.0), 1)
            steps = random.randint(300, 650)
            activity = 1.0
            motion = round(random.uniform(0.7, 1.2), 2)
        else:
            hr = round(random.uniform(64.0, 70.0), 1)
            spo2 = round(random.uniform(97.0, 98.5), 1)
            steps = random.randint(150, 350)
            activity = 0.6
            motion = round(random.uniform(0.4, 0.8), 2)
            
        rows.append({
            "timestamp": t.strftime("%Y-%m-%d %H:%M:%S"),
            "user_id": "user_default_01",
            "heart_rate": hr,
            "spo2": spo2,
            "temperature": round(random.uniform(36.4, 36.8), 1),
            "steps": steps,
            "activity_level": activity,
            "sleep_hours": 7.4 if hour == 8 else 0.0,
            "wake_time": "07:05",
            "meal_status": "eaten" if hour in [8, 13, 19] else "none",
            "motion_level": motion,
            "response_status": "active",
            "scenario": "NORMAL"
        })
        
    # 2. Key Scenario Templates for instant evaluation
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    scenario_templates = [
        # Normal
        {
            "timestamp": now_str,
            "user_id": "user_default_01",
            "heart_rate": 68.0,
            "spo2": 98.0,
            "temperature": 36.6,
            "steps": 5820,
            "activity_level": 1.02,
            "sleep_hours": 7.4,
            "wake_time": "07:05",
            "meal_status": "eaten",
            "motion_level": 1.0,
            "response_status": "active",
            "scenario": "NORMAL"
        },
        # Abnormal (multi-signal deviation: poor sleep, late wake, low steps, elevated HR, missed breakfast)
        {
            "timestamp": now_str,
            "user_id": "user_default_01",
            "heart_rate": 86.0,
            "spo2": 95.5,
            "temperature": 36.8,
            "steps": 1650,
            "activity_level": 0.28,
            "sleep_hours": 4.2,
            "wake_time": "09:42",
            "meal_status": "missed",
            "motion_level": 0.15,
            "response_status": "delayed",
            "scenario": "ABNORMAL"
        },
        # Fall-like event (impact spike followed by zero movement, elevated tachycardia)
        {
            "timestamp": now_str,
            "user_id": "user_default_01",
            "heart_rate": 108.0,
            "spo2": 95.0,
            "temperature": 36.7,
            "steps": 1100,
            "activity_level": 0.05,
            "sleep_hours": 5.8,
            "wake_time": "08:15",
            "meal_status": "delayed",
            "motion_level": 0.02,
            "response_status": "none",
            "scenario": "FALL"
        },
        # Recovery (vitals returning to baseline, confirmed awake, steps increasing)
        {
            "timestamp": now_str,
            "user_id": "user_default_01",
            "heart_rate": 71.0,
            "spo2": 98.0,
            "temperature": 36.6,
            "steps": 5300,
            "activity_level": 0.95,
            "sleep_hours": 7.1,
            "wake_time": "07:15",
            "meal_status": "eaten",
            "motion_level": 0.9,
            "response_status": "active",
            "scenario": "RECOVERY"
        },
        # Poor sleep only
        {
            "timestamp": now_str,
            "user_id": "user_default_01",
            "heart_rate": 74.0,
            "spo2": 97.0,
            "temperature": 36.6,
            "steps": 5100,
            "activity_level": 0.88,
            "sleep_hours": 4.5,
            "wake_time": "07:50",
            "meal_status": "eaten",
            "motion_level": 0.85,
            "response_status": "active",
            "scenario": "POOR_SLEEP"
        },
        # Low activity only
        {
            "timestamp": now_str,
            "user_id": "user_default_01",
            "heart_rate": 67.0,
            "spo2": 98.0,
            "temperature": 36.5,
            "steps": 2100,
            "activity_level": 0.35,
            "sleep_hours": 7.5,
            "wake_time": "07:10",
            "meal_status": "eaten",
            "motion_level": 0.4,
            "response_status": "active",
            "scenario": "LOW_ACTIVITY"
        },
        # No response with moderate deviation
        {
            "timestamp": now_str,
            "user_id": "user_default_01",
            "heart_rate": 82.0,
            "spo2": 96.0,
            "temperature": 36.7,
            "steps": 2400,
            "activity_level": 0.38,
            "sleep_hours": 5.2,
            "wake_time": "09:10",
            "meal_status": "missed",
            "motion_level": 0.1,
            "response_status": "none",
            "scenario": "NO_RESPONSE"
        }
    ]
    
    rows.extend(scenario_templates)
    
    with open(csv_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)
        
    print(f"Generated {len(rows)} synthetic sensor data records at {csv_path}")

if __name__ == "__main__":
    generate_sensor_data_csv()
