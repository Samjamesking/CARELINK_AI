import React, { useState } from 'react';
import { Play, RotateCcw, AlertTriangle, ShieldCheck, Flame, UserX, Moon, Footprints, Heart, Utensils } from 'lucide-react';
import api from '../services/api';

export default function ScenarioSimulator({ onSimulationCompleted }) {
  const [loading, setLoading] = useState(false);
  const [conditions, setConditions] = useState({
    poor_sleep: false,
    low_activity: false,
    elevated_hr: false,
    missed_meal: false,
    fall_motion: false,
    no_response: false,
    recovery: false,
  });
  const [lastResult, setLastResult] = useState(null);

  const presets = [
    { key: 'NORMAL', label: 'NORMAL DAY', desc: 'Baseline vitals, regular routine' },
    { key: 'POOR_SLEEP', label: 'POOR SLEEP', desc: '4.2h sleep, late wake-up' },
    { key: 'LOW_ACTIVITY', label: 'LOW ACTIVITY', desc: '-71% daily step volume' },
    { key: 'ABNORMAL', label: 'COMPOUND ANOMALY', desc: 'Poor sleep + missed meal + low steps + HR +24%' },
    { key: 'FALL', label: 'FALL-LIKE EVENT', desc: 'Kinematic impact followed by zero motion' },
    { key: 'NO_RESPONSE', label: 'NO RESPONSE', desc: 'Unanswered verification prompt' },
    { key: 'RECOVERY', label: 'RECOVERY', desc: 'Signals returning to baseline' },
  ];

  const handleToggle = (key) => {
    setConditions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePresetClick = async (scenarioKey) => {
    setLoading(true);
    try {
      const res = await api.simulateScenario(scenarioKey);
      setLastResult(res.analysis);
      if (onSimulationCompleted) onSimulationCompleted(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomRun = async () => {
    setLoading(true);
    try {
      const res = await api.simulateCustom(conditions);
      setLastResult(res.analysis);
      if (onSimulationCompleted) onSimulationCompleted(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-150 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">CARELINK Scenario Lab</h2>
          <p className="text-xs text-slate-500">
            What-If Risk Simulator — Test autonomous AI reasoning without hardware sensors
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-slate-500">Preset Scenarios:</span>
        </div>
      </div>

      {/* Preset Scenario Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
        {presets.map((p) => (
          <button
            key={p.key}
            onClick={() => handlePresetClick(p.key)}
            disabled={loading}
            className={`p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] ${
              p.key === 'NORMAL' || p.key === 'RECOVERY'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                : p.key === 'FALL' || p.key === 'ABNORMAL'
                ? 'bg-rose-50/70 border-rose-200 text-rose-900 hover:bg-rose-100'
                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
            }`}
          >
            <div className="text-[11px] font-bold tracking-tight">{p.label}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{p.desc}</div>
          </button>
        ))}
      </div>

      {/* Interactive Custom Multi-condition What-If controls */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4">
          Custom Multi-Variable Scenario Builder
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-5">
          <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-brand-50/40 transition-colors">
            <input
              type="checkbox"
              checked={conditions.poor_sleep}
              onChange={() => handleToggle('poor_sleep')}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
            />
            <Moon className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-semibold text-slate-800">Poor Sleep (4.2h)</span>
          </label>

          <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-brand-50/40 transition-colors">
            <input
              type="checkbox"
              checked={conditions.low_activity}
              onChange={() => handleToggle('low_activity')}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
            />
            <Footprints className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-800">Low Activity (-71%)</span>
          </label>

          <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-brand-50/40 transition-colors">
            <input
              type="checkbox"
              checked={conditions.elevated_hr}
              onChange={() => handleToggle('elevated_hr')}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
            />
            <Heart className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-semibold text-slate-800">Elevated HR (+24%)</span>
          </label>

          <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-brand-50/40 transition-colors">
            <input
              type="checkbox"
              checked={conditions.missed_meal}
              onChange={() => handleToggle('missed_meal')}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
            />
            <Utensils className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-slate-800">Missed Breakfast</span>
          </label>

          <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-brand-50/40 transition-colors">
            <input
              type="checkbox"
              checked={conditions.fall_motion}
              onChange={() => handleToggle('fall_motion')}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
            />
            <Flame className="w-4 h-4 text-rose-600" />
            <span className="text-xs font-semibold text-slate-800">Fall-like Impact</span>
          </label>

          <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-brand-50/40 transition-colors">
            <input
              type="checkbox"
              checked={conditions.no_response}
              onChange={() => handleToggle('no_response')}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
            />
            <UserX className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-semibold text-slate-800">No Response</span>
          </label>

          <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-brand-50/40 transition-colors">
            <input
              type="checkbox"
              checked={conditions.recovery}
              onChange={() => handleToggle('recovery')}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
            />
            <RotateCcw className="w-4 h-4 text-brand-600" />
            <span className="text-xs font-semibold text-slate-800">Recovery Pattern</span>
          </label>
        </div>

        <button
          onClick={handleCustomRun}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>{loading ? 'Evaluating AI Pipeline...' : 'RUN WHAT-IF SIMULATION'}</span>
        </button>
      </div>

      {/* Scenario Execution Result Display */}
      {lastResult && (
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Last Simulation Result
            </div>
            <div className="flex items-center space-x-3 mt-1">
              <span className="text-sm font-bold text-slate-900">
                Personal Deviation: {lastResult.personal_deviation_score}%
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                  lastResult.risk === 'HIGH'
                    ? 'bg-rose-100 text-rose-800'
                    : lastResult.risk === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                Risk: {lastResult.risk}
              </span>
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Action: <span className="font-semibold text-slate-800">{lastResult.recommended_action}</span>
            </div>
          </div>

          <div className="text-xs text-brand-700 bg-brand-50 px-3 py-2 rounded-lg border border-brand-100 max-w-sm">
            ✓ Dashboard state updated dynamically across all modules.
          </div>
        </div>
      )}
    </div>
  );
}
