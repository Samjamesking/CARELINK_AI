# CARELINK AI — Autonomous Personal Wellbeing Guardian

> **"The AI that knows when to check before it calls for help."**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/React-18.x-61DAFB.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)

---

## 1. Problem

Over **36 million older adults and vulnerable individuals live alone** in the United States and hundreds of millions globally. While independent living is empowering, solitary emergencies and gradual health declines pose severe threats:

- **The Fall & Immobility Paradox**: If an individual experiences a fall, acute arrhythmia, or severe exhaustion, they often cannot reach a phone or press a panic pendant.
- **Alarm Fatigue & False Positives**: Traditional monitoring systems rely on rigid, universal medical thresholds (e.g., HR > 100 BPM or no motion for 2 hours) which generate relentless false alarms, leading caregivers to disable alerts.
- **Premature Escalation**: Conventional panic devices notify emergency services or family members immediately without checking the user, creating unnecessary anxiety, embarrassment, and expensive emergency deployments.
- **Lack of Causal Context**: Caregivers receive isolated alerts like "Abnormal sensor event detected" with zero explanation of the underlying behavioral chain leading up to the incident.

---

## 2. Solution

**CARELINK AI** is an autonomous, neuro-symbolic wellbeing guardian that acts as a vigilant companion for individuals living alone:

1. **Learns What Is Normal For You**: Learns individual daily routines, sleep windows, activity levels, and vital signs rather than relying on generic hospital norms.
2. **Connects Multiple Signals**: Correlates subtle deviations across multiple domains (e.g., sleep deficit + late wake-up + missed meal + reduced movement) into a chronological **AI Event Chain**.
3. **Explains Its Decisions**: Generates **Counterfactual Explanations** ("Why did CARELINK escalate?" and "What would change the decision?").
4. **Verifies Before Escalating**: Initiates an **Autonomous Verification Loop** (e.g., voice check-in: *"Are you feeling okay?"*) with an automated countdown before contacting anyone.
5. **Adaptive Multi-Stage Escalation**: Escalates gracefully along a 5-level response ladder, cancelling immediately if the user confirms wellbeing.

> [!IMPORTANT]
> **Safety & Regulatory Disclaimer**: CARELINK AI is a hackathon prototype designed for wellbeing monitoring, routine analysis, and caregiver support. It is **not** a medical diagnostic device, does not diagnose diseases, and does not replace doctors, hospitals, or 911/emergency services.

---

## 3. Innovation: Personal Baseline Intelligence

CARELINK does not evaluate anomalies against one-size-fits-all population standards. An active 78-year-old walking 6,000 steps daily with a resting HR of 68 BPM has a drastically different normal profile than an individual with bradycardia or limited mobility.

### Personal Baseline vs. Today's Deviation Example

| Parameter | Eleanor's Personal Baseline | Today's Telemetry | Deviation | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Wake-Up Time** | `06:50 – 07:20` | `09:42 AM` | `+2h 22m late` | ⚠️ Abnormal |
| **Breakfast Routine** | `08:00 – 08:45` | `Missed` | `No kitchen motion` | ⚠️ Routine Broken |
| **Daily Step Volume** | `5,500 – 7,000 steps` | `1,600 steps` | `-71% below baseline` | 🚨 Critical |
| **Resting Heart Rate** | `65 – 73 BPM` | `88 BPM` | `+24% above baseline` | ⚠️ Elevated |
| **Sleep Duration** | `7.0 – 8.0 hours` | `4.2 hours` | `-43% sleep deficit` | ⚠️ Severe Deficit |
| **Blood Oxygen (SpO₂)** | `96 – 99%` | `95.5%` | `-1.5% from baseline` | ℹ️ Mild Dip |

**Computed Personal Deviation Score**: `89.8% (HIGH RISK)`

---

## 4. Architecture

CARELINK AI employs a modular full-stack architecture combining a reactive modern frontend, an asynchronous FastAPI backend, a multi-agent orchestration layer, a SQLite audit database, and a neuro-symbolic reasoning engine:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CARELINK WEB COMMAND CENTER                      │
│     React 18 + TailwindCSS + Recharts + Lucide Icons + Vite Proxy       │
│  [Dashboard]  [Live Monitor]  [AI Investigation]  [Simulator] [Caregiver]│
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ JSON API (HTTP/REST)
┌────────────────────────────────────▼───────────────────────────────────┐
│                      FASTAPI AGENT ORCHESTRATOR                        │
│                                                                        │
│  ┌──────────────┐     ┌──────────────┐     ┌────────────────────────┐  │
│  │ Sensor Agent │ ──> │Baseline Agent│ ──> │    Reasoning Agent     │  │
│  └──────────────┘     └──────────────┘     │(Neuro-Symbolic Engine) │  │
│                                            └───────────┬────────────┘  │
│                                                        │               │
│  ┌──────────────┐                                      ▼               │
│  │  Care Agent  │ <───────────────────────── ┌──────────────────────┐  │
│  │(Escalation)  │     If timeout / help      │  Verification Agent  │  │
│  └──────┬───────┘                            │ (Autonomous Check-in)│  │
│         │                                    └──────────────────────┘  │
│         ▼                                                              │
│  Alert Service ──> Caregiver Dispatch (SMS / Audio / Dashboard Notification)
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│                   PERSISTENCE & SYNTHETIC DATA LAYER                    │
│   SQLite Database (Vitals, Events, Verifications, Alerts) + CSV Cache   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Five AI Agents

CARELINK AI distributes cognitive responsibilities across five specialized agents:

1. **Sensor Agent** (`backend/agents/sensor_agent.py`):
   - Ingests raw biometric and ambient sensor telemetry.
   - Validates ranges, flags invalid/missing values, and normalizes telemetry into clean structured records.
2. **Baseline Agent** (`backend/agents/baseline_agent.py`):
   - Computes individual historical baselines and tolerance windows.
   - Calculates percentage deviations from personal norms and generates structured evidence packages.
3. **Reasoning Agent** (`backend/agents/reasoning_agent.py`):
   - Executes deterministic symbolic rules (e.g., R1, R2, R3) for safety-critical classification.
   - Constructs causal **Event Chains** and computes **Counterfactual Explanations**.
   - Interfaces with optional LLM service for enriched narrative summaries with safe deterministic fallback.
4. **Verification Agent** (`backend/agents/verification_agent.py`):
   - Evaluates whether verification is warranted based on risk and confidence.
   - Manages interactive check-in sessions with a 20-second countdown window.
   - Processes user responses: `"I'm okay"`, `"I need help"`, or `no_response`.
5. **Care Agent** (`backend/agents/care_agent.py`):
   - Governs the 5-stage adaptive escalation ladder.
   - Packages evidence, telemetry snapshots, and causal reasoning into actionable caregiver alerts.

---

## 6. Personal Baseline Engine

The Personal Baseline Engine calculates adaptive bounds for each individual based on historical moving averages:

- **Continuous Physiological Metrics**: $\mu \pm k \cdot \sigma$ tolerances for resting heart rate, SpO₂, and body temperature.
- **Circadian Routines**: Probabilistic time windows for wake-up time, breakfast preparation, and nightly sleep duration.
- **Weighted Deviation Score**:
  $$D_{\text{personal}} = \sum_{i=1}^{n} w_i \cdot \min\left(100, \frac{|v_i - \text{baseline}_i|}{\text{tolerance}_i} \times 100\right)$$
  Weights prioritize severe physical immobility, acute distress signals, and routine breakdowns.

---

## 7. Event Chain Reasoning

Rather than treating anomalies as isolated alarms, CARELINK AI synthesizes temporal events into a causal event chain:

```
[04:30 AM] Poor Sleep (Restless sleep cycle: 4.2h vs 7.4h baseline)
    ↓
[09:42 AM] Late Wake-Up (2h 22m past usual 07:05 AM window)
    ↓
[10:15 AM] Morning Inactivity (Zero motion detected in living/kitchen areas)
    ↓
[10:45 AM] Missed Breakfast (No appliance usage in kitchen)
    ↓
[11:00 AM] Elevated Heart Rate (88 BPM resting; +24% above normal baseline)
    ↓
[11:02 AM] Verification Triggered ("Are you feeling okay?" check-in initiated)
```

Each event node includes timestamp, severity, and contextual description rendered in the **AI Event Chain** component.

---

## 8. Counterfactual Explanation

A cornerstone of CARELINK's explainability is the **"Why Did CARELINK Escalate?"** and **"What Would Have Changed The Decision?"** panel:

### Why Did CARELINK Escalate?
- ✓ Activity decreased by **71%** below baseline
- ✓ Sleep duration decreased by **43%**
- ✓ Resting Heart Rate increased by **24%**
- ✓ Morning breakfast routine was missed
- ✓ User did not respond to check-in

### What Would Have Changed The Decision?
- **If user confirmed "I'm okay"**: $\rightarrow$ Escalation cancelled, normal monitoring resumed.
- **If activity returned to baseline (>5,200 steps)**: $\rightarrow$ Risk downgraded to LOW.
- **If only heart rate was elevated**: $\rightarrow$ System would continue passive monitoring without alarm.

---

## 9. Adaptive Escalation Ladder

CARELINK AI implements a 5-tier escalation protocol:

```
LEVEL 1: Gentle Ambient Audio & Visual Chime (Non-intrusive)
    ↓ (no response after 20s)
LEVEL 2: Interactive Voice Check-in ("Are you feeling okay?")
    ↓ (no response after 20s)
LEVEL 3: High-Priority Verification Repeat
    ↓ (no response after 20s)
LEVEL 4: Automated SMS / Notification to Designated Secondary Contact
    ↓ (no response after 20s or immediate if "I need help")
LEVEL 5: Caregiver Emergency Notification with Full Evidence Dossier
```

---

## 10. Tech Stack

- **Backend**:
  - Python 3.10+
  - FastAPI (Asynchronous REST API)
  - Uvicorn (High-performance ASGI server)
  - Pydantic v2 (Strict data validation and schemas)
  - Pandas & NumPy (Time-series aggregation)
  - Scikit-learn (Isolation Forest anomaly scoring)
  - SQLite (Local zero-config relational database)
- **Frontend**:
  - React 18 + Vite
  - Tailwind CSS (Custom healthcare design system)
  - Recharts (Interactive biometric telemetry line & bar charts)
  - Lucide React (Visual system icons)
- **AI / Reasoning**:
  - Neuro-symbolic rule evaluation engine
  - Optional Google Gemini / OpenAI LLM integration with safe deterministic fallback

---

## 11. Dataset & Synthetic Telemetry

The system includes realistic synthetic telemetry generated in `backend/data/sensor_data.csv`:
- **79+ synthetic timestamped records** simulating 7 distinct operational states:
  - `NORMAL`: Baseline vitals and regular routine.
  - `ABNORMAL`: Compound multi-signal breakdown (poor sleep + missed meal + low activity + elevated HR).
  - `FALL`: Kinetic acceleration spike followed by zero kinetic motion and tachycardia.
  - `POOR_SLEEP`: Isolated sleep deficit with normal daytime activity.
  - `LOW_ACTIVITY`: Sedentary day without physiological distress.
  - `NO_RESPONSE`: Inactivity paired with missed check-ins.
  - `RECOVERY`: Vitals and kinetics returning to personal baseline bounds.

---

## 12. API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check, agent status, and LLM readiness |
| `GET` | `/api/dashboard` | Aggregated system state (telemetry, baseline, analysis, alert) |
| `POST` | `/api/sensor-data` | Ingest real-time telemetry stream |
| `POST` | `/api/analyze` | Execute Sensor $\rightarrow$ Baseline $\rightarrow$ Reasoning pipeline |
| `POST` | `/api/verify` | Manually initiate autonomous verification session |
| `POST` | `/api/verify/response`| Submit user response (`okay`, `help`, `no_response`) |
| `POST` | `/api/escalate` | Manually advance escalation ladder |
| `GET` | `/api/events` | Retrieve recent chronological event audit log |
| `POST` | `/api/simulate/custom`| What-If simulation with multi-condition flags |
| `POST` | `/api/simulate/{scenario}`| Run preset scenario (`normal`, `abnormal`, `fall`, etc.) |
| `POST` | `/api/caregiver/acknowledge`| Acknowledge active caregiver alert |
| `POST` | `/api/caregiver/resolve` | Mark active alert resolved |

Interactive Swagger UI documentation is available at `http://localhost:8000/docs`.

---

## 13. Installation

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher with npm

### 1. Clone the repository
```bash
git clone https://github.com/your-username/carelink-ai.git
cd "carelink-ai"
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

---

## 14. Running Locally

### Start Backend
In a terminal in the `backend` directory:
```bash
.\venv\Scripts\activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
Backend runs at: `http://127.0.0.1:8000`

### Start Frontend
In a separate terminal in the `frontend` directory:
```bash
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 15. Demo Instructions (Step-by-Step Hackathon Walkthrough)

To present the full power of CARELINK AI in 3 minutes:

1. **Baseline State**:
   - Open `http://localhost:5173`.
   - Observe Eleanor's normal state: `Risk: LOW`, `Personal Deviation: 6%`, all vitals green.
2. **Trigger Anomaly**:
   - In the Quick Simulation bar, click **`SIMULATE ANOMALY`**.
   - Watch the dashboard transform:
     - Risk changes to **HIGH** (`Personal Deviation: 89%`).
     - AI Investigation agent pipeline animates through Sensor $\rightarrow$ Baseline $\rightarrow$ Reasoning.
     - **Verification Panel** triggers with a 20-second countdown: *"Are you feeling okay?"*.
     - **Why Did CARELINK Flag This?** displays the 5 sensor deviations and symbolic rules (R1, R2, R3).
3. **Branch 1: User Confirms Wellbeing**:
   - Click **`[ I'M OKAY ]`**.
   - Observe: Verification succeeds, escalation is cancelled, monitoring resumes.
4. **Branch 2: No Response $\rightarrow$ Caregiver Escalation**:
   - Click **`SIMULATE ANOMALY`** again.
   - Click **`[ NO RESPONSE ]`** (or let the 20s countdown expire).
   - Escalation advances up the ladder.
   - Navigate to **`Caregiver Center`** to view the active **HIGH RISK ALERT** with complete evidence, detection time, and action buttons (`Contact Caregiver`, `Mark Resolved`).
5. **Explore What-If Risk Simulator**:
   - Navigate to **`Scenario Simulator`**.
   - Check arbitrary combinations (e.g., `Poor Sleep` + `Low Activity` + `Elevated HR`).
   - Click **`RUN WHAT-IF SIMULATION`** and inspect the real-time recalculated risk and counterfactuals.

---

## 16. Limitations

- **Prototype Sensors**: Uses synthetic and simulated telemetry; physical wearable Bluetooth Low Energy (BLE) pairing is planned for future iterations.
- **Single Resident Focus**: Designed primarily for individuals living alone; multi-occupant households require spatial beacon tracking to disaggregate resident telemetry.
- **Voice Check-in Simulation**: The voice verification prompt is currently visual/interactive; production deployment will integrate smart speaker and ambient microphone hardware.

---

## 17. Future Scope

1. **Hardware Integration**: Direct API sync with Apple Watch (HealthKit), Withings Sleep Mat, and Fitbit.
2. **Edge AI Processing**: On-device micro-agent execution on a dedicated privacy-first home hub (e.g., Raspberry Pi 5 / Coral TPU) so raw telemetry never leaves the living space.
3. **Multi-Modal Acoustic Fall Detection**: Integrating ambient acoustic classification for glass breaks, thuds, and calls for help.
4. **Long-Term Baseline Evolution**: Continuous online Bayesian updating of personal baselines across seasons and aging milestones.

---

**CARELINK AI** — *Better care. Brighter tomorrows.*
