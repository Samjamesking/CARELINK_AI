import React from 'react';
import { ArrowDown, AlertTriangle, Moon, Sunrise, Footprints, Utensils, Heart, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function EventChain({ eventChain = [] }) {
  const getIcon = (signalType) => {
    switch (signalType) {
      case 'sleep':
        return Moon;
      case 'wake':
        return Sunrise;
      case 'activity':
        return Footprints;
      case 'meal':
        return Utensils;
      case 'heart_rate':
        return Heart;
      case 'motion':
        return AlertTriangle;
      case 'response':
        return ShieldAlert;
      default:
        return CheckCircle2;
    }
  };

  if (!eventChain || eventChain.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-150 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-2">AI Event Chain</h3>
        <p className="text-xs text-slate-500">No active anomaly chain. All events within baseline.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-150 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">AI Event Chain</h2>
          <p className="text-xs text-slate-500">
            Multi-signal chronological causal sequence
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
          {eventChain.length} Correlated Events
        </span>
      </div>

      <div className="space-y-3">
        {eventChain.map((node, index) => {
          const Icon = getIcon(node.signal_type);
          const isCritical = node.severity === 'critical';
          const isWarning = node.severity === 'warning';

          return (
            <React.Fragment key={node.id || index}>
              <div
                className={`p-3.5 rounded-xl border transition-all flex items-start space-x-3 ${
                  isCritical
                    ? 'bg-rose-50/70 border-rose-200'
                    : isWarning
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    isCritical
                      ? 'bg-rose-100 text-rose-600'
                      : isWarning
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{node.title}</span>
                    <span className="text-[11px] font-mono font-semibold text-slate-500">
                      {node.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {node.description}
                  </p>
                </div>
              </div>

              {index < eventChain.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowDown className="w-4 h-4 text-slate-400 animate-bounce" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
