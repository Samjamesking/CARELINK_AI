import React, { useState, useEffect } from 'react';
import {
  Heart,
  Droplets,
  Footprints,
  Moon,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Radio,
  User,
  Brain,
  SearchCheck,
  BellRing
} from 'lucide-react';
import TelemetryCard from '../components/TelemetryCard';
import VitalChart from '../components/VitalChart';
import AgentStatus from '../components/AgentStatus';
import CounterfactualPanel from '../components/CounterfactualPanel';
import InvestigationTimeline from '../components/InvestigationTimeline';
import CaregiverAlert from '../components/CaregiverAlert';
import VerificationPanel from '../components/VerificationPanel';
import api from '../services/api';

export default function Dashboard({
  dashboardState,
  onRefresh,
  onNavigate,
  onSimulateScenario,
}) {
  const [quickSimLoading, setQuickSimLoading] = useState(false);

  const telemetry = dashboardState?.current_telemetry || {};
  const baseline = dashboardState?.baseline_profile || {};
  const analysis = dashboardState?.analysis || {};
  const verification = dashboardState?.active_verification;
  const activeAlert = dashboardState?.active_alert;
  const escalation = dashboardState?.escalation;
  const events = dashboardState?.recent_events || [];
  const agentStatus = dashboardState?.agent_status || {};

  const handleQuickSim = async (scenarioKey) => {
    setQuickSimLoading(true);
    try {
      if (onSimulateScenario) {
        await onSimulateScenario(scenarioKey);
      } else {
        await api.simulateScenario(scenarioKey);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Quick simulation failed:', err);
    } finally {
      setQuickSimLoading(false);
    }
  };

  const hrDev = analysis?.signals?.find((s) => s.name === 'Heart Rate')?.deviation ?? 0;
  const hrDir = analysis?.signals?.find((s) => s.name === 'Heart Rate')?.direction ?? 'normal';
  const hrStatus = analysis?.signals?.find((s) => s.name === 'Heart Rate')?.status ?? 'normal';

  const spo2Dev = analysis?.signals?.find((s) => s.name === 'SpO2')?.deviation ?? 0;
  const spo2Dir = analysis?.signals?.find((s) => s.name === 'SpO2')?.direction ?? 'normal';

  const stepsDev = analysis?.signals?.find((s) => s.name === 'Daily Activity')?.deviation ?? 0;
  const stepsDir = analysis?.signals?.find((s) => s.name === 'Daily Activity')?.direction ?? 'normal';

  const sleepDev = analysis?.signals?.find((s) => s.name === 'Sleep')?.deviation ?? 0;
  const sleepDir = analysis?.signals?.find((s) => s.name === 'Sleep')?.direction ?? 'normal';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Good morning,
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Welcome back to CARELINK. Autonomous wellbeing monitoring for independent living.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* System Online Badge */}
          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>System Online</span>
          </div>

          {/* Caregiver View Toggle / Button */}
          <button
            onClick={() => onNavigate('caregiver')}
            className="flex items-center space-x-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <User className="w-4 h-4 text-slate-500" />
            <span>Caregiver View</span>
          </button>
        </div>
      </div>

      {/* Autonomous Verification Banner (if pending) */}
      {verification && verification.status === 'PENDING' && (
        <VerificationPanel
          verificationSession={verification}
          onResponseSubmitted={onRefresh}
        />
      )}

      {/* Top 6 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <TelemetryCard
          title="Heart Rate"
          value={telemetry.heart_rate ?? 68}
          unit="BPM"
          baseline={`${baseline.hr_min ?? 66} – ${baseline.hr_max ?? 72}`}
          deviation={hrDev}
          direction={hrDir}
          status={hrStatus}
          icon={Heart}
          iconColor="text-rose-500"
          bgColor="bg-rose-50"
        />

        <TelemetryCard
          title="SpO₂"
          value={telemetry.spo2 ?? 98}
          unit="%"
          baseline={`${baseline.spo2_min ?? 96} – ${baseline.spo2_max ?? 99}`}
          deviation={spo2Dev}
          direction={spo2Dir}
          status={spo2Dev > 2 ? 'warning' : 'normal'}
          icon={Droplets}
          iconColor="text-sky-500"
          bgColor="bg-sky-50"
        />

        <TelemetryCard
          title="Activity"
          value={telemetry.steps ?? 5820}
          unit="steps"
          baseline={`${(baseline.steps_min ?? 5200).toLocaleString()} – ${(baseline.steps_max ?? 7000).toLocaleString()}`}
          deviation={stepsDev}
          direction={stepsDir}
          status={stepsDev > 40 ? 'critical' : stepsDev > 20 ? 'warning' : 'normal'}
          icon={Footprints}
          iconColor="text-emerald-500"
          bgColor="bg-emerald-50"
        />

        <TelemetryCard
          title="Sleep"
          value={telemetry.sleep_hours ?? 7.4}
          unit="h"
          baseline={`${baseline.sleep_min ?? 7} – ${baseline.sleep_max ?? 8}`}
          deviation={sleepDev}
          direction={sleepDir}
          status={sleepDev > 30 ? 'critical' : 'normal'}
          icon={Moon}
          iconColor="text-purple-500"
          bgColor="bg-purple-50"
        />

        {/* Risk Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-150 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Risk
            </span>
            <div className={`p-2 rounded-xl ${
              analysis.risk === 'HIGH' ? 'bg-rose-50' : analysis.risk === 'MEDIUM' ? 'bg-amber-50' : 'bg-emerald-50'
            }`}>
              <ShieldCheck className={`w-4 h-4 ${
                analysis.risk === 'HIGH' ? 'text-rose-600' : analysis.risk === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'
              }`} />
            </div>
          </div>
          <div>
            <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              analysis.risk === 'HIGH' ? 'text-rose-600' : analysis.risk === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-700'
            }`}>
              {analysis.risk || 'LOW'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {analysis.risk === 'LOW' ? 'All parameters normal' : `${analysis.personal_deviation_score}% Personal Deviation`}
            </div>
          </div>
        </div>

        {/* System Status Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-150 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              System Status
            </span>
            <div className="p-2 rounded-xl bg-emerald-50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>All systems operational</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Last updated: {telemetry.timestamp ? telemetry.timestamp.split(' ').pop() : '14:28'}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Live Telemetry + AI Investigation Pipeline + Autonomous Loop Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Live Telemetry & Quick Simulation buttons */}
        <div className="lg:col-span-6 space-y-4">
          <VitalChart currentTelemetry={telemetry} />

          {/* Quick Simulation Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-150 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-800">Quick Simulation</span>
                <p className="text-[11px] text-slate-500">Trigger scenarios to test the system</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleQuickSim('NORMAL')}
                  disabled={quickSimLoading}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-all"
                >
                  SIMULATE NORMAL
                </button>
                <button
                  onClick={() => handleQuickSim('ABNORMAL')}
                  disabled={quickSimLoading}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition-all"
                >
                  SIMULATE ANOMALY
                </button>
                <button
                  onClick={() => handleQuickSim('FALL')}
                  disabled={quickSimLoading}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200 transition-all"
                >
                  SIMULATE FALL
                </button>
                <button
                  onClick={() => handleQuickSim('RECOVERY')}
                  disabled={quickSimLoading}
                  className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200 transition-all"
                >
                  SIMULATE RECOVERY
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Center: AI Investigation Multi-Agent Panel */}
        <div className="lg:col-span-3">
          <AgentStatus
            agentStatus={agentStatus}
            onNavigateInvestigation={() => onNavigate('investigation')}
          />
        </div>

        {/* Right: Autonomous Verification Loop Card */}
        <div className="lg:col-span-3">
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-brand-950 text-white rounded-2xl p-5 shadow-sm border border-slate-800 h-full flex flex-col justify-between relative overflow-hidden">
            {/* Background subtle pattern */}
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-brand-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div>
              <div className="flex items-center space-x-2.5 mb-4">
                <Brain className="w-6 h-6 text-brand-400" />
                <div>
                  <h3 className="text-xs font-mono font-bold tracking-widest text-brand-300 uppercase">
                    AUTONOMOUS
                  </h3>
                  <div className="text-sm font-extrabold text-white">
                    VERIFICATION LOOP
                  </div>
                </div>
              </div>

              {/* Loop Sequence Diagram */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 mb-4 text-center">
                <div>
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 mx-auto mb-1">
                    1
                  </div>
                  <span className="text-[10px] font-semibold text-slate-300 uppercase">OBSERVE</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                <div>
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 mx-auto mb-1">
                    2
                  </div>
                  <span className="text-[10px] font-semibold text-slate-300 uppercase">REASON</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                <div>
                  <div className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] font-bold mx-auto mb-1 shadow-sm">
                    ✓
                  </div>
                  <span className="text-[10px] font-semibold text-brand-300 uppercase">VERIFY</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                <div>
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 mx-auto mb-1">
                    !
                  </div>
                  <span className="text-[10px] font-semibold text-slate-300 uppercase">ESCALATE</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                CARELINK uses multiple signals, personal baselines, and AI reasoning to verify before escalating.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 text-[11px] text-brand-400 font-medium">
              "The AI that knows when to check before it calls for help."
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Counterfactual Panel + Investigation Timeline + Caregiver Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Why Did CARELINK Flag This? (6 cols) */}
        <div className="lg:col-span-6">
          <CounterfactualPanel analysis={analysis} />
        </div>

        {/* Center: Investigation Timeline (3 cols) */}
        <div className="lg:col-span-3">
          <InvestigationTimeline events={events} />
        </div>

        {/* Right: Caregiver Center Active Alert (3 cols) */}
        <div className="lg:col-span-3">
          <CaregiverAlert
            activeAlert={activeAlert}
            onRefresh={onRefresh}
            onViewInvestigation={() => onNavigate('investigation')}
          />
        </div>
      </div>
    </div>
  );
}
