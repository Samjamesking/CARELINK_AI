import React from 'react';
import { Heart, Activity, Moon, ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function TelemetryCard({
  title,
  value,
  unit,
  baseline,
  deviation,
  direction = 'normal',
  status = 'normal',
  icon: IconComponent,
  iconColor = 'text-blue-500',
  bgColor = 'bg-blue-50',
}) {
  const isPositive = direction === 'above';
  const isNegative = direction === 'below';
  const isNormal = status === 'normal' || deviation === 0;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-150 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2 rounded-xl ${bgColor}`}>
          {IconComponent && <IconComponent className={`w-4 h-4 ${iconColor}`} />}
        </div>
      </div>

      <div className="flex items-baseline space-x-1.5 mb-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {unit && <span className="text-xs font-semibold text-slate-500">{unit}</span>}
      </div>

      {baseline && (
        <div className="text-xs text-slate-500 mb-2.5">
          Baseline: <span className="font-medium text-slate-700">{baseline}</span>
        </div>
      )}

      {/* Deviation Pill */}
      {deviation !== undefined && (
        <div className="flex items-center">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
              isNormal
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : status === 'critical'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {isNormal ? (
              '↓ 0% Deviation'
            ) : isPositive ? (
              `↑ ${deviation}% Deviation`
            ) : (
              `↓ ${deviation}% Deviation`
            )}
          </span>
        </div>
      )}
    </div>
  );
}
