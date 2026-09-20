import React from 'react';
import { UserCheck, Activity, Check, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function BaselinePanel({ baselineProfile, analysis, currentTelemetry }) {
  const profile = baselineProfile || {};
  const devScore = analysis?.personal_deviation_score ?? 12.0;
  const baselineScore = analysis?.personal_baseline_score ?? 92.0;

  const metrics = [
    {
      name: 'Heart Rate',
      baseline: `${profile.hr_min ?? 65}–${profile.hr_max ?? 73} BPM`,
      today: `${currentTelemetry?.heart_rate ?? 68} BPM`,
      isNormal: (currentTelemetry?.heart_rate ?? 68) <= (profile.hr_max ?? 73) && (currentTelemetry?.heart_rate ?? 68) >= (profile.hr_min ?? 65),
    },
    {
      name: 'Daily Activity',
      baseline: `${(profile.steps_min ?? 5500).toLocaleString()}–${(profile.steps_max ?? 7000).toLocaleString()}`,
      today: `${(currentTelemetry?.steps ?? 5820).toLocaleString()} steps`,
      isNormal: (currentTelemetry?.steps ?? 5820) >= (profile.steps_min ?? 5500),
    },
    {
      name: 'Sleep',
      baseline: `${profile.sleep_min ?? 7}–${profile.sleep_max ?? 8}h`,
      today: `${currentTelemetry?.sleep_hours ?? 7.4}h`,
      isNormal: (currentTelemetry?.sleep_hours ?? 7.4) >= (profile.sleep_min ?? 7),
    },
    {
      name: 'SpO₂',
      baseline: `${profile.spo2_min ?? 96}–${profile.spo2_max ?? 99}%`,
      today: `${currentTelemetry?.spo2 ?? 98}%`,
      isNormal: (currentTelemetry?.spo2 ?? 98) >= (profile.spo2_min ?? 96),
    },
    {
      name: 'Wake Time',
      baseline: `${profile.wake_window_start ?? '06:50'}–${profile.wake_window_end ?? '07:20'}`,
      today: currentTelemetry?.wake_time ?? '07:05',
      isNormal: (currentTelemetry?.wake_time ?? '07:05') <= (profile.wake_window_end ?? '07:20'),
    },
    {
      name: 'Breakfast',
      baseline: `${profile.breakfast_window_start ?? '08:00'}–${profile.breakfast_window_end ?? '08:45'}`,
      today: currentTelemetry?.meal_status ? currentTelemetry.meal_status.toUpperCase() : 'EATEN',
      isNormal: currentTelemetry?.meal_status !== 'missed',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-150 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-bold text-slate-900">Personal Digital Twin</h2>
          </div>
          <p className="text-xs text-slate-500">Learned individual behavioral baseline for Eleanor</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700">
          User Baseline Profile
        </span>
      </div>

      {/* Baseline vs Deviation Progress Bars */}
      <div className="space-y-3 mb-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
        <div>
          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
            <span>PERSONAL BASELINE MATCH</span>
            <span className="text-brand-600">{baselineScore}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-brand-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${baselineScore}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
            <span>TODAY'S DEVIATION SCORE</span>
            <span className={devScore > 50 ? 'text-rose-600' : 'text-slate-600'}>
              {devScore}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                devScore > 60 ? 'bg-rose-500' : devScore > 30 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${devScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Signals Checklist */}
      <div className="space-y-2">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 text-xs"
          >
            <div>
              <span className="font-bold text-slate-800">{m.name}: </span>
              <span className="text-slate-500">{m.baseline}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`font-semibold ${m.isNormal ? 'text-slate-700' : 'text-rose-600 font-bold'}`}>
                {m.today}
              </span>
              {m.isNormal ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
