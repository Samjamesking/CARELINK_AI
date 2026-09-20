import React from 'react';
import { UserCheck, ShieldAlert, Phone, Mail, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import CaregiverAlert from '../components/CaregiverAlert';
import EscalationLadder from '../components/EscalationLadder';
import InvestigationTimeline from '../components/InvestigationTimeline';

export default function CaregiverCenter({ dashboardState, onRefresh, onNavigate }) {
  const activeAlert = dashboardState?.active_alert;
  const escalation = dashboardState?.escalation || {};
  const events = dashboardState?.recent_events || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <UserCheck className="w-6 h-6 text-brand-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Caregiver Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Guardian management portal, adaptive escalation control, and contact protocols
          </p>
        </div>

        {/* Primary Contact Profile */}
        <div className="flex items-center space-x-3 p-2 bg-white rounded-2xl border border-slate-200 shadow-sm pr-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
            SV
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Sarah Vance (Daughter)</div>
            <div className="text-[11px] text-slate-500">+1-555-019-2834 • Primary Caregiver</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Alert & Escalation Ladder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <CaregiverAlert
            activeAlert={activeAlert}
            onRefresh={onRefresh}
            onViewInvestigation={() => onNavigate('investigation')}
          />
        </div>

        <div className="lg:col-span-6">
          <EscalationLadder currentLevel={escalation.current_level || 1} />
        </div>
      </div>

      {/* Incident and Notification History */}
      <div className="w-full">
        <InvestigationTimeline events={events} />
      </div>
    </div>
  );
}
