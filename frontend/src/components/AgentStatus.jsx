import React from 'react';
import { CheckCircle2, Loader2, Circle, Eye } from 'lucide-react';

export default function AgentStatus({ agentStatus, onNavigateInvestigation }) {
  const agents = [
    {
      key: 'sensor_agent',
      name: 'SENSOR AGENT',
      defaultDesc: 'Collecting and validating sensor data...',
      fallbackTime: '14:42:01',
    },
    {
      key: 'baseline_agent',
      name: 'BASELINE AGENT',
      defaultDesc: 'Calculating personal baseline...',
      fallbackTime: '14:42:02',
    },
    {
      key: 'reasoning_agent',
      name: 'REASONING AGENT',
      defaultDesc: 'Analyzing patterns and risk level...',
      fallbackTime: '14:42:03',
    },
    {
      key: 'verification_agent',
      name: 'VERIFICATION AGENT',
      defaultDesc: 'Attempting voice check-in...',
      fallbackTime: '14:42:04',
    },
    {
      key: 'care_agent',
      name: 'CARE AGENT',
      defaultDesc: 'Waiting for verification result...',
      fallbackTime: '14:42:05',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-150 shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Investigation</h2>
            <p className="text-xs text-slate-500">Multi-agent analysis in progress</p>
          </div>
          {onNavigateInvestigation && (
            <button
              onClick={onNavigateInvestigation}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1.5 rounded-lg transition-all flex items-center space-x-1"
            >
              <span>View Details</span>
            </button>
          )}
        </div>

        <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {agents.map((ag) => {
            const data = agentStatus?.[ag.key] || {};
            const status = data.status || 'COMPLETED';
            const details = data.details || ag.defaultDesc;
            const time = data.last_run || ag.fallbackTime;

            const isDone = status === 'COMPLETED';
            const isActive = status === 'ACTIVE';
            const isIdle = status === 'IDLE';

            return (
              <div key={ag.key} className="flex items-start justify-between relative pl-8">
                {/* Node icon */}
                <div className="absolute left-1.5 top-0.5 transform -translate-x-1/2 bg-white ring-4 ring-white">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                </div>

                <div className="pr-2">
                  <div className="text-xs font-bold text-slate-800 tracking-wide">
                    {ag.name}
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-1">
                    {details}
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                  {time}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
