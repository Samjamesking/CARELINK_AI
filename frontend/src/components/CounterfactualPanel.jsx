import React from 'react';
import { AlertTriangle, Sparkles, Code2, CheckCircle2, ArrowRight, HelpCircle } from 'lucide-react';

export default function CounterfactualPanel({ analysis }) {
  const isNormal = !analysis || analysis.risk === 'LOW';
  const evidence = analysis?.evidence || [];
  const rules = analysis?.rules_triggered || [];
  const counterfactuals = analysis?.counterfactuals || [];
  const reasoning = analysis?.reasoning || 'All parameters normal within personal baseline.';

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-150 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {isNormal ? (
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          )}
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isNormal ? 'Personal Baseline Alignment' : 'Why Did CARELINK Flag This?'}
            </h2>
            <p className="text-xs text-slate-500">
              {isNormal
                ? 'Behavioral patterns match Eleanor’s baseline'
                : 'Correlated sensor deviations & neuro-symbolic rule evaluation'}
            </p>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
            isNormal
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : analysis?.risk === 'HIGH'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {analysis?.risk || 'LOW'} RISK
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Sensor Deviations */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>Sensor Deviations</span>
          </h3>

          {evidence.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
              No significant deviations detected from personal baseline.
            </div>
          ) : (
            <div className="space-y-2">
              {evidence.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span className="text-xs font-semibold text-slate-800">{item.signal}</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold ${
                        item.direction === 'above'
                          ? 'text-rose-600'
                          : item.direction === 'below'
                          ? 'text-rose-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {item.direction === 'below'
                        ? `${item.deviation_percent}% below baseline`
                        : item.direction === 'above'
                        ? `${item.deviation_percent}% above baseline`
                        : item.current}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Reasoning Text */}
          <div className="mt-4 p-3.5 rounded-xl bg-brand-50/60 border border-brand-100">
            <div className="flex items-center space-x-1.5 mb-1.5 text-brand-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs font-bold uppercase tracking-wider">AI Reasoning</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{reasoning}</p>
          </div>
        </div>

        {/* Right: Symbolic Rules & Counterfactual Explanations */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
            <Code2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Symbolic Rules Triggered</span>
          </h3>

          {rules.length === 0 ? (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 mb-4">
              <div className="flex items-center space-x-2 text-emerald-600 font-semibold mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>R0: Baseline Consistency Rule</span>
              </div>
              Telemetry matches personal baseline bounds. No safety alerts triggered.
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              {rules.map((r) => (
                <div key={r.rule_id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800">
                      <span className="text-brand-600 font-mono mr-1.5">[{r.rule_id}]</span>
                      {r.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.impact === 'HIGH'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {r.impact}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">{r.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Counterfactuals ("What Would Have Changed The Decision?") */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
              <span>What would change this decision?</span>
            </h4>
            <div className="space-y-2">
              {counterfactuals.map((cf, i) => (
                <div key={i} className="text-xs text-slate-600 flex items-start space-x-2">
                  <ArrowRight className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800">{cf.condition}: </span>
                    <span>{cf.hypothetical_outcome} </span>
                    <span className="text-emerald-700 font-medium">({cf.risk_impact})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
