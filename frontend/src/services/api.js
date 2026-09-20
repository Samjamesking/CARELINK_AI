import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Health
  checkHealth: async () => {
    const res = await client.get('/api/health');
    return res.data;
  },

  // Dashboard Aggregated State
  getDashboard: async () => {
    const res = await client.get('/api/dashboard');
    return res.data;
  },

  // Analyze Current State
  analyzeCurrent: async () => {
    const res = await client.post('/api/analyze');
    return res.data;
  },

  // Ingest Sensor Telemetry
  sendSensorData: async (telemetry) => {
    const res = await client.post('/api/sensor-data', telemetry);
    return res.data;
  },

  // Preset Scenario Simulation
  simulateScenario: async (scenario) => {
    const res = await client.post(`/api/simulate/${scenario.toLowerCase()}`);
    return res.data;
  },

  // Custom What-If Multi-variable Simulation
  simulateCustom: async (conditions) => {
    const res = await client.post('/api/simulate/custom', conditions);
    return res.data;
  },

  // Trigger Autonomous Verification
  triggerVerification: async (prompt = "Are you feeling okay?", timeout = 20) => {
    const res = await client.post(`/api/verify?prompt=${encodeURIComponent(prompt)}&timeout=${timeout}`);
    return res.data;
  },

  // Submit Verification Response
  respondVerification: async (sessionId, response, comment = null) => {
    const res = await client.post('/api/verify/response', {
      session_id: sessionId,
      response,
      comment
    });
    return res.data;
  },

  // Advance Escalation Ladder
  advanceEscalation: async () => {
    const res = await client.post('/api/escalate');
    return res.data;
  },

  // Event Log
  getEvents: async (limit = 20) => {
    const res = await client.get(`/api/events?limit=${limit}`);
    return res.data;
  },

  // Caregiver Alert Actions
  acknowledgeAlert: async (alertId = null) => {
    const res = await client.post('/api/caregiver/acknowledge', null, {
      params: alertId ? { alert_id: alertId } : {}
    });
    return res.data;
  },

  resolveAlert: async (alertId = null, resolvedBy = "Caregiver Sarah Vance") => {
    const res = await client.post('/api/caregiver/resolve', null, {
      params: { alert_id: alertId, resolved_by: resolvedBy }
    });
    return res.data;
  }
};

export default api;
