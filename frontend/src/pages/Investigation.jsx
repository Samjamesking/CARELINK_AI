import React from 'react';
import { Brain, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import AgentStatus from '../components/AgentStatus';
import EventChain from '../components/EventChain';
import CounterfactualPanel from '../components/CounterfactualPanel';
import BaselinePanel from '../components/BaselinePanel';
import InvestigationTimeline from '../components/InvestigationTimeline';

export default function Investigation({ dashboardState, onRefresh }) {
  const analysis = dashboardState?.analysis || {};
  const baseline = dashboardState?.baseline_profile || {};
  const telemetry = dashboardState?.current_telemetry || {};
  const agentStatus = dashboardState?.agent_status || {};
  const events = dashboardState?.recent_events || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-brand-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              AI Investigation Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Neuro-symbolic multi-agent reasoning, causal event chain analysis, and counterfactual transparency
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              analysis.risk === 'HIGH'
                ? 'bg-rose-100 text-rose-800'
                : analysis.risk === 'MEDIUM'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            Current Assessment: {analysis.risk || 'LOW'} Risk
          </span>
        </div>
      </div>

      {/* Top Row: 5-Agent Pipeline & Baseline Digital Twin */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <AgentStatus agentStatus={agentStatus} />
        </div>
        <div className="lg:col-span-7">
          <BaselinePanel
            baselineProfile={baseline}
            analysis={analysis}
            currentTelemetry={telemetry}
          />
        </div>
      </div>

      {/* Middle Row: AI Event Chain & Why Did CARELINK Flag This? */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <EventChain eventChain={analysis?.event_chain} />
        </div>
        <div className="lg:col-span-7">
          <CounterfactualPanel analysis={analysis} />
        </div>
      </div>

      {/* Bottom Row: Chronological Investigation Timeline */}
      <div className="w-full">
        <InvestigationTimeline events={events} />
      </div>
    </div>
  );
}
