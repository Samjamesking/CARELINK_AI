import React from 'react';
import { Bell, Phone, ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react';

export default function EscalationLadder({ currentLevel = 1 }) {
  const levels = [
    {
      level: 1,
      title: 'Gentle Notification',
      desc: 'Ambient audio chime & smart screen wellbeing check',
      icon: Bell,
    },
    {
      level: 2,
      title: 'Voice Check-in',
      desc: 'Automated interactive speech prompt ("Are you feeling okay?")',
      icon: Phone,
    },
    {
      level: 3,
      title: 'Second Verification',
      desc: 'Repeat high-priority sensory verification window (20s)',
      icon: ShieldCheck,
    },
    {
      level: 4,
      title: 'Trusted Contact Alert',
      desc: 'Automated SMS warning to designated secondary contact',
      icon: UserCheck,
    },
    {
      level: 5,
      title: 'Caregiver Notification',
      desc: 'Direct emergency caregiver alert with evidence package',
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-150 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Adaptive Escalation Ladder</h2>
          <p className="text-xs text-slate-500">Autonomous multi-stage response protocol</p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          Stage {currentLevel} of 5
        </span>
      </div>

      <div className="space-y-3 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {levels.map((lvl) => {
          const isCurrent = currentLevel === lvl.level;
          const isPassed = currentLevel > lvl.level;
          const Icon = lvl.icon;

          return (
            <div
              key={lvl.level}
              className={`relative flex items-center justify-between p-3 rounded-xl transition-all pl-11 border ${
                isCurrent
                  ? 'bg-rose-50 border-rose-200 shadow-sm'
                  : isPassed
                  ? 'bg-emerald-50/60 border-emerald-100 opacity-90'
                  : 'bg-slate-50/50 border-slate-100 opacity-60'
              }`}
            >
              {/* Step indicator node */}
              <div
                className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  isCurrent
                    ? 'bg-rose-500 border-white text-white shadow-md animate-pulse'
                    : isPassed
                    ? 'bg-emerald-500 border-white text-white'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {lvl.level}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-bold ${
                      isCurrent
                        ? 'text-rose-900'
                        : isPassed
                        ? 'text-emerald-900'
                        : 'text-slate-700'
                    }`}
                  >
                    LEVEL {lvl.level}: {lvl.title}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{lvl.desc}</div>
              </div>

              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isCurrent
                    ? 'text-rose-600'
                    : isPassed
                    ? 'text-emerald-600'
                    : 'text-slate-400'
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
