import React from 'react';
import { FlaskConical, Play, Sparkles } from 'lucide-react';
import ScenarioSimulator from '../components/ScenarioSimulator';
import CounterfactualPanel from '../components/CounterfactualPanel';
import EventChain from '../components/EventChain';
import VerificationPanel from '../components/VerificationPanel';

export default function Simulator({ dashboardState, onRefresh }) {
  const analysis = dashboardState?.analysis || {};
  const verification = dashboardState?.active_verification;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FlaskConical className="w-6 h-6 text-brand-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              CARELINK Scenario Lab
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Test the AI reasoning system without real sensor hardware.
          </p>
        </div>
      </div>

      {/* Verification prompt if pending */}
      {verification && verification.status === 'PENDING' && (
        <VerificationPanel
          verificationSession={verification}
          onResponseSubmitted={onRefresh}
        />
      )}

      {/* Simulator Component */}
      <ScenarioSimulator onSimulationCompleted={onRefresh} />

      {/* Resulting Event Chain & Counterfactuals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <EventChain eventChain={analysis?.event_chain} />
        </div>
        <div className="lg:col-span-7">
          <CounterfactualPanel analysis={analysis} />
        </div>
      </div>
    </div>
  );
}
