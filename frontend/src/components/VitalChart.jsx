import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Heart, Droplets, Footprints, Moon } from 'lucide-react';

export default function VitalChart({ currentTelemetry }) {
  const [timeframe, setTimeframe] = useState('1H');

  // Generate responsive chart data points based on current telemetry
  const hrBase = currentTelemetry?.heart_rate || 68;
  const spo2Base = currentTelemetry?.spo2 || 98;
  const stepsBase = currentTelemetry?.steps || 5820;
  const sleepBase = currentTelemetry?.sleep_hours || 7.4;

  const chartData = [
    { time: '13:30', hr: Math.round(hrBase * 0.98), spo2: spo2Base, steps: Math.round(stepsBase * 0.12), sleep: 0 },
    { time: '13:45', hr: Math.round(hrBase * 1.01), spo2: Math.min(99, spo2Base + 0.5), steps: Math.round(stepsBase * 0.25), sleep: 0 },
    { time: '14:00', hr: Math.round(hrBase * 0.99), spo2: spo2Base, steps: Math.round(stepsBase * 0.45), sleep: 0 },
    { time: '14:15', hr: Math.round(hrBase * 1.02), spo2: Math.max(94, spo2Base - 0.2), steps: Math.round(stepsBase * 0.7), sleep: 0 },
    { time: '14:30', hr: hrBase, spo2: spo2Base, steps: stepsBase, sleep: sleepBase },
  ];

  const sleepBarData = [
    { day: 'Mon', hours: 7.2 },
    { day: 'Tue', hours: 7.5 },
    { day: 'Wed', hours: 7.8 },
    { day: 'Thu', hours: 7.1 },
    { day: 'Fri', hours: 7.6 },
    { day: 'Sat', hours: 8.0 },
    { day: 'Today', hours: sleepBase },
  ];

  const stepsBarData = [
    { time: '08:00', steps: 650 },
    { time: '10:00', steps: 1200 },
    { time: '12:00', steps: 2100 },
    { time: '14:00', steps: 1400 },
    { time: 'Current', steps: stepsBase > 3000 ? 1100 : 450 },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-150 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Live Telemetry</h2>
          <p className="text-xs text-slate-500">Real-time health and activity data</p>
        </div>
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
          {['1H', '6H', '24H'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeframe === tf
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Heart Rate Chart */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-semibold text-slate-700">Heart Rate (BPM)</span>
            </div>
            <span className="text-xs font-bold text-slate-800">{hrBase} BPM</span>
          </div>
          <div className="h-28 sm:h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                <YAxis domain={[40, 130]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} width={25} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="hr"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#ef4444' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SpO2 Chart */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Droplets className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-semibold text-slate-700">SpO₂ (%)</span>
            </div>
            <span className="text-xs font-bold text-slate-800">{spo2Base}%</span>
          </div>
          <div className="h-28 sm:h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                <YAxis domain={[85, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} width={25} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="spo2"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#0284c7' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Steps / Activity Bar Chart */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Footprints className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold text-slate-700">Steps (Activity)</span>
            </div>
            <span className="text-xs font-bold text-slate-800">{stepsBase.toLocaleString()}</span>
          </div>
          <div className="h-28 sm:h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stepsBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} width={30} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="steps" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sleep Chart */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Moon className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-semibold text-slate-700">Sleep (hours)</span>
            </div>
            <span className="text-xs font-bold text-slate-800">{sleepBase} h</span>
          </div>
          <div className="h-28 sm:h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sleepBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} width={25} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
