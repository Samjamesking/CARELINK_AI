import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, PhoneCall, ShieldCheck, ArrowUpRight } from 'lucide-react';
import api from '../services/api';

export default function CaregiverAlert({
  activeAlert,
  onRefresh,
  onViewInvestigation,
}) {
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const handleContactCaregiver = async () => {
    setLoading(true);
    try {
      await api.acknowledgeAlert(activeAlert?.alert_id);
      setActionMessage('Dispatched SMS/Call notification to Sarah Vance (+1-555-019-2834).');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async () => {
    setLoading(true);
    try {
      await api.resolveAlert(activeAlert?.alert_id, 'Caregiver Sarah Vance');
      setActionMessage('Alert marked resolved. Monitoring returned to normal.');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!activeAlert || activeAlert.status === 'RESOLVED') {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-150 shadow-sm h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-bold text-slate-900">Caregiver Center</h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              ALL CLEAR
            </span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-center py-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-800">No Active Caregiver Alerts</div>
            <p className="text-xs text-slate-500 mt-1">
              Eleanor is within her personal baseline. Autonomous monitoring is active.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isHighRisk = activeAlert.risk_level === 'HIGH';

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-150 shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <h2 className="text-base font-bold text-slate-900">Caregiver Center</h2>
          </div>
          <button
            onClick={onViewInvestigation}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            View All
          </button>
        </div>

        {/* Alert Card Header */}
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wide">
                ACTIVE ALERT
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 uppercase">
              {activeAlert.risk_level}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-rose-200/60 text-center">
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Detected</div>
              <div className="text-xs font-bold text-slate-800">
                {activeAlert.timestamp?.split(' ').pop() || '14:42'}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Verification</div>
              <div className="text-xs font-bold text-rose-700 uppercase">
                {activeAlert.verification_status}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Risk Level</div>
              <div className="text-xs font-bold text-rose-700 uppercase">
                {activeAlert.risk_level}
              </div>
            </div>
          </div>
        </div>

        {/* Evidence bullet points */}
        <div className="mb-3">
          <div className="text-xs font-bold text-slate-700 mb-1.5">Evidence:</div>
          <ul className="space-y-1">
            {activeAlert.evidence?.slice(0, 3).map((ev, i) => (
              <li key={i} className="text-xs text-slate-600 flex items-start space-x-1.5">
                <span className="text-rose-500 mt-0.5">•</span>
                <span>{ev}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Action */}
        <div className="mb-4">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Recommended Action:</div>
          <div className="text-xs text-slate-800 font-medium mt-0.5">
            {activeAlert.recommended_action || 'Check on user'}
          </div>
        </div>

        {actionMessage && (
          <div className="p-2 mb-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
            {actionMessage}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <button
          onClick={handleContactCaregiver}
          disabled={loading}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-2"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Contact Caregiver</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleResolveAlert}
            disabled={loading}
            className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
          >
            Mark Resolved
          </button>
          <button
            onClick={onViewInvestigation}
            className="py-1.5 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center space-x-1"
          >
            <span>View Investigation</span>
            <ArrowUpRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
