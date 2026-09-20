import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Activity,
  Brain,
  FlaskConical,
  UserCheck,
  ShieldCheck,
  Heart,
  Sparkles,
  ExternalLink,
  Cpu,
  Menu,
  X,
  AlertCircle
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import LiveMonitor from './pages/LiveMonitor';
import Investigation from './pages/Investigation';
import Simulator from './pages/Simulator';
import CaregiverCenter from './pages/CaregiverCenter';
import api from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardState, setDashboardState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchState = async () => {
    try {
      const data = await api.getDashboard();
      setDashboardState(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch dashboard state:', err);
      // If backend is momentarily starting, show friendly notice
      setError('Connecting to CARELINK AI Guardian engine...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateScenario = async (scenarioKey) => {
    try {
      const res = await api.simulateScenario(scenarioKey);
      await fetchState();
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live', label: 'Live Monitor', icon: Activity },
    { id: 'investigation', label: 'AI Investigation', icon: Brain },
    { id: 'simulator', label: 'Scenario Simulator', icon: FlaskConical },
    { id: 'caregiver', label: 'Caregiver Center', icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-slate-900 tracking-tight">CARELINK</div>
            <div className="text-[9px] text-slate-500 font-medium">Autonomous Guardian</div>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-100 text-slate-700"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:flex flex-col justify-between w-full md:w-64 lg:w-72 bg-white border-r border-slate-200/80 p-5 md:min-h-screen shrink-0 z-20`}
      >
        <div>
          {/* Brand Logo & Tagline */}
          <div className="hidden md:flex items-start space-x-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-600/20 shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 tracking-tight leading-none">
                CARELINK
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                The AI that knows when to check before it calls for help.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 mb-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-200/60 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-brand-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Differentiating Feature Callout Card (Matching Reference UI) */}
          <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-100 text-slate-800 space-y-3">
            <div className="w-7 h-7 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-snug">
                CARELINK doesn't just detect anomalies.
              </div>
              <div className="text-xs font-bold text-brand-700 mt-0.5">
                It verifies before escalating.
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-brand-200/60 text-[11px] text-slate-600">
              <div className="flex items-center space-x-2">
                <Cpu className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span>Personal Baseline Intelligence</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span>Autonomous Verification Loop</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span>Neuro-Symbolic Risk Reasoning</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer Tags */}
        <div className="pt-6 mt-6 border-t border-slate-100 text-[11px] text-slate-400">
          <div className="font-semibold text-slate-600 mb-1">
            Early warning • Caregiver support
          </div>
          <div>• Independent living</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col justify-between">
        <div>
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              dashboardState={dashboardState}
              onRefresh={fetchState}
              onNavigate={setActiveTab}
              onSimulateScenario={handleSimulateScenario}
            />
          )}

          {activeTab === 'live' && (
            <LiveMonitor
              dashboardState={dashboardState}
              onRefresh={fetchState}
            />
          )}

          {activeTab === 'investigation' && (
            <Investigation
              dashboardState={dashboardState}
              onRefresh={fetchState}
            />
          )}

          {activeTab === 'simulator' && (
            <Simulator
              dashboardState={dashboardState}
              onRefresh={fetchState}
            />
          )}

          {activeTab === 'caregiver' && (
            <CaregiverCenter
              dashboardState={dashboardState}
              onRefresh={fetchState}
              onNavigate={setActiveTab}
            />
          )}
        </div>

        {/* Footer (Matching Reference UI and Non-Diagnostic Safety Standard) */}
        <footer className="mt-12 pt-6 border-t border-slate-200/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-center sm:text-left">
            <span className="font-bold text-slate-700">CARELINK AI</span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span>HealthTech & Wellness Hackathon Project</span>
          </div>

          <div className="text-[11px] text-slate-400 text-center max-w-xl">
            CARELINK AI is a prototype for wellbeing monitoring and caregiver support. It is not a medical diagnostic or emergency-response system.
          </div>

          <div className="flex items-center space-x-1.5 text-brand-600 font-semibold text-xs">
            <Heart className="w-3.5 h-3.5 text-brand-500" />
            <span>Better care. Brighter tomorrows.</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
