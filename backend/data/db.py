import sqlite3
import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "carelink.db")

def get_db_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        age INTEGER,
        living_arrangement TEXT,
        caregiver_name TEXT,
        caregiver_phone TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Baseline Profiles table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS baseline_profiles (
        user_id TEXT PRIMARY KEY,
        hr_min REAL,
        hr_max REAL,
        hr_mean REAL,
        spo2_min REAL,
        spo2_max REAL,
        steps_min INTEGER,
        steps_max INTEGER,
        steps_mean INTEGER,
        sleep_min REAL,
        sleep_max REAL,
        sleep_mean REAL,
        wake_window_start TEXT,
        wake_window_end TEXT,
        breakfast_window_start TEXT,
        breakfast_window_end TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    )
    """)

    # Sensor Readings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sensor_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        timestamp TIMESTAMP,
        heart_rate REAL,
        spo2 REAL,
        temperature REAL,
        steps INTEGER,
        activity_level REAL,
        sleep_hours REAL,
        wake_time TEXT,
        meal_status TEXT,
        motion_level REAL,
        response_status TEXT,
        scenario TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Events table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TIMESTAMP,
        event_type TEXT,
        severity TEXT,
        title TEXT,
        description TEXT,
        metadata_json TEXT
    )
    """)

    # Verification Sessions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS verification_sessions (
        session_id TEXT PRIMARY KEY,
        timestamp TIMESTAMP,
        prompt TEXT,
        status TEXT,
        timeout_seconds INTEGER,
        user_response TEXT,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Caregiver Alerts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS caregiver_alerts (
        alert_id TEXT PRIMARY KEY,
        timestamp TIMESTAMP,
        risk_level TEXT,
        reason TEXT,
        evidence_json TEXT,
        verification_status TEXT,
        recommended_action TEXT,
        escalation_stage INTEGER,
        status TEXT,
        contact_attempted INTEGER DEFAULT 0,
        resolved_at TIMESTAMP,
        resolved_by TEXT
    )
    """)

    # Insert default user and baseline if not exists
    cursor.execute("SELECT user_id FROM users WHERE user_id = 'user_default_01'")
    if not cursor.fetchone():
        cursor.execute("""
        INSERT INTO users (user_id, full_name, age, living_arrangement, caregiver_name, caregiver_phone)
        VALUES ('user_default_01', 'Eleanor Vance', 76, 'Living Alone', 'Sarah Vance (Daughter)', '+1-555-019-2834')
        """)
        cursor.execute("""
        INSERT INTO baseline_profiles (
            user_id, hr_min, hr_max, hr_mean, spo2_min, spo2_max,
            steps_min, steps_max, steps_mean, sleep_min, sleep_max, sleep_mean,
            wake_window_start, wake_window_end, breakfast_window_start, breakfast_window_end
        ) VALUES (
            'user_default_01', 65.0, 73.0, 68.0, 96.0, 99.0,
            5500, 7000, 6200, 7.0, 8.0, 7.4,
            '06:50', '07:20', '08:00', '08:45'
        )
        """)
        # Insert initial events
        cursor.execute("""
        INSERT INTO events (timestamp, event_type, severity, title, description, metadata_json)
        VALUES 
        (datetime('now', '-2 hours'), 'SYSTEM', 'normal', 'Routine Stable', 'Normal morning patterns observed. Telemetry within personal baseline.', '{}'),
        (datetime('now', '-1 hour'), 'ACTIVITY', 'normal', 'Activity Normalized', '5,820 steps recorded. Normal movement cadence.', '{}'),
        (datetime('now', '-30 minutes'), 'BASELINE', 'normal', 'Baseline Profile Verified', 'Personal digital twin baseline confirmed for user Eleanor Vance.', '{}')
        """)

    conn.commit()
    conn.close()

def log_event(title: str, description: str, severity: str = "normal", event_type: str = "SYSTEM", metadata: Optional[Dict] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO events (timestamp, event_type, severity, title, description, metadata_json)
    VALUES (datetime('now'), ?, ?, ?, ?, ?)
    """, (event_type, severity, title, description, json.dumps(metadata or {})))
    conn.commit()
    conn.close()

def get_recent_events(limit: int = 10) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "id": row["id"],
            "timestamp": row["timestamp"],
            "event_type": row["event_type"],
            "severity": row["severity"],
            "title": row["title"],
            "description": row["description"],
            "metadata": json.loads(row["metadata_json"]) if row["metadata_json"] else {}
        }
        for row in rows
    ]
