import React, { useState } from 'react';
import { Radio, Activity, BatteryCharging, Wifi, RefreshCw, Heart, Droplets, Footprints, Moon, Play } from 'lucide-react';
import VitalChart from '../components/VitalChart';
import TelemetryCard from '../components/TelemetryCard';
import api from '../services/api';

export default function LiveMonitor({ dashboardState, onRefresh }) {
  const [simulating, setSimulating] = useState(false);
  const telemetry = dashboardState?.current_telemetry || {};
  const baseline = dashboardState?.baseline_profile || {};
  const analysis = dashboardState?.analysis || {};

  const handleSimulate = async (scenario) => {
    setSimulating(true);
    try {
      await api.simulateScenario(scenario);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Live Telemetry Monitor</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time biometric streams and ambient kinetic sensor monitoring
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Streaming (1 Hz)</span>
          </div>

          <button
            onClick={onRefresh}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl shadow-sm transition-all"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sensor Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Sensor Network Status</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">Continuous Monitoring</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">✓ 8 Active Data Channels</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <Wifi className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Wearable Battery</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">94% — Good for 38h</div>
            <div className="text-[11px] text-slate-500 mt-1">Last charged: Yesterday 21:00</div>
          </div>
          <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
            <BatteryCharging className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Telemetry Data Quality</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">99.8% Valid Packets</div>
            <div className="text-[11px] text-slate-500 mt-1">Sensor Agent Range Validated</div>
          </div>
          <div className="p-3 rounded-xl bg-brand-50 text-brand-600">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Telemetry Charts */}
      <VitalChart currentTelemetry={telemetry} />

      {/* Stream Simulation Control Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
          Simulate Telemetry Stream Scenarios
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => handleSimulate('NORMAL')}
            disabled={simulating}
            className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition-all"
          >
            Stream Normal Telemetry
          </button>
          <button
            onClick={() => handleSimulate('ABNORMAL')}
            disabled={simulating}
            className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all"
          >
            Stream Multi-Signal Anomaly
          </button>
          <button
            onClick={() => handleSimulate('FALL')}
            disabled={simulating}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 text-xs font-bold transition-all"
          >
            Stream Fall-like Impact
          </button>
          <button
            onClick={() => handleSimulate('RECOVERY')}
            disabled={simulating}
            className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 text-xs font-bold transition-all"
          >
            Stream Recovery Telemetry
          </button>
        </div>
      </div>
    </div>
  );
}
