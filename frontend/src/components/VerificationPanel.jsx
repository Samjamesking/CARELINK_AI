import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, AlertOctagon, Clock, Volume2, UserCheck } from 'lucide-react';
import api from '../services/api';

export default function VerificationPanel({
  verificationSession,
  onResponseSubmitted,
}) {
  const [timeLeft, setTimeLeft] = useState(20);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!verificationSession || verificationSession.status !== 'PENDING') {
      setTimeLeft(20);
      return;
    }

    setTimeLeft(20);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [verificationSession?.session_id, verificationSession?.status]);

  const handleAutoTimeout = async () => {
    if (verificationSession?.status === 'PENDING') {
      await handleResponse('no_response');
    }
  };

  const handleResponse = async (resp) => {
    setSubmitting(true);
    try {
      const res = await api.respondVerification(verificationSession?.session_id, resp);
      if (resp === 'okay') {
        setFeedback({
          type: 'success',
          title: '✓ Verified — User Confirmed Wellbeing',
          text: 'Escalation cancelled. Monitoring resumed.',
        });
      } else if (resp === 'help') {
        setFeedback({
          type: 'danger',
          title: '⚠ Help Requested by User',
          text: 'Immediate caregiver alert dispatched.',
        });
      } else {
        setFeedback({
          type: 'warning',
          title: '⚠ No Response Received',
          text: 'Advancing to next stage of escalation ladder.',
        });
      }

      if (onResponseSubmitted) {
        onResponseSubmitted(res);
      }
    } catch (err) {
      console.error('Error submitting verification response:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!verificationSession && !feedback) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-brand-950 text-white rounded-2xl p-6 shadow-xl border border-brand-500/30 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
            <Volume2 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-brand-300">
              Autonomous Verification Loop
            </div>
            <h3 className="text-lg font-bold text-white">
              {verificationSession?.prompt || 'Are you feeling okay?'}
            </h3>
          </div>
        </div>

        {/* Countdown Timer */}
        {verificationSession?.status === 'PENDING' && (
          <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl">
            <Clock className="w-4 h-4 text-brand-400" />
            <span className="text-xs text-slate-300">Window:</span>
            <span className="text-sm font-mono font-bold text-brand-300">
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </span>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-300 mb-6 max-w-xl">
        CARELINK detected deviations from Eleanor’s personal baseline. Before alarming family or
        caregivers, the system conducts an autonomous check-in.
      </p>

      {/* Result feedback message if submitted */}
      {feedback && (
        <div
          className={`p-4 rounded-xl mb-4 border ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : feedback.type === 'danger'
              ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
              : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
          }`}
        >
          <div className="font-bold text-sm mb-1">{feedback.title}</div>
          <div className="text-xs opacity-90">{feedback.text}</div>
        </div>
      )}

      {/* Response Action Buttons */}
      {(!feedback || verificationSession?.status === 'PENDING') && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleResponse('okay')}
            disabled={submitting}
            className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center space-x-2 border border-emerald-400/30"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>I'M OKAY</span>
          </button>

          <button
            onClick={() => handleResponse('help')}
            disabled={submitting}
            className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-900/30 transition-all flex items-center justify-center space-x-2 border border-rose-400/30"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>I NEED HELP</span>
          </button>

          <button
            onClick={() => handleResponse('no_response')}
            disabled={submitting}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all flex items-center justify-center space-x-2"
          >
            <Clock className="w-4 h-4 text-slate-400" />
            <span>NO RESPONSE</span>
          </button>
        </div>
      )}
    </div>
  );
}
