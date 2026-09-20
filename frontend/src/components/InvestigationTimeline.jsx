import React from 'react';
import { Clock, CheckCircle2, AlertCircle, AlertTriangle, Bell, ShieldAlert } from 'lucide-react';

export default function InvestigationTimeline({ events }) {
  // If no events provided, use illustrative realistic items
  const timelineItems = events && events.length > 0 ? events : [
    { id: 1, timestamp: '14:42:01', title: 'Sensor anomaly detected', severity: 'warning' },
    { id: 2, timestamp: '14:42:02', title: 'Baseline deviation calculated', severity: 'warning' },
    { id: 3, timestamp: '14:42:03', title: 'Reasoning completed', severity: 'warning' },
    { id: 4, timestamp: '14:42:04', title: 'Verification initiated', severity: 'critical' },
    { id: 5, timestamp: '14:42:14', title: 'No response to check-in', severity: 'critical' },
    { id: 6, timestamp: '14:42:15', title: 'Caregiver attention recommended', severity: 'critical' }
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-150 shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h2 className="text-base font-bold text-slate-900">Investigation Timeline</h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Live Log</span>
        </div>

        <div className="relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {timelineItems.slice(0, 6).map((item) => {
            const isCritical = item.severity === 'critical';
            const isWarning = item.severity === 'warning';
            const isNormal = !isCritical && !isWarning;

            return (
              <div key={item.id} className="relative flex items-center justify-between">
                {/* Node icon */}
                <div className="absolute -left-6 top-1 transform -translate-x-1/2 bg-white ring-2 ring-white">
                  {isCritical ? (
                    <div className="w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white"></div>
                  ) : isWarning ? (
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white"></div>
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"></div>
                  )}
                </div>

                <div className="pr-3">
                  <div className="text-xs font-semibold text-slate-800 line-clamp-1">
                    {item.title}
                  </div>
                  {item.description && (
                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      {item.description}
                    </div>
                  )}
                </div>

                <div className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                  {item.timestamp ? item.timestamp.split(' ').pop() : '14:42'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
