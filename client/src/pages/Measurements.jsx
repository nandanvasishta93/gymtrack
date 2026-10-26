import React, { useState, useEffect } from 'react';
import { Ruler, Plus, ShieldCheck, TrendingDown, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { api } from '../services/api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function Measurements() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form
  const [weightKg, setWeightKg] = useState('62.0');
  const [waistCm, setWaistCm] = useState('76.0');
  const [chestCm, setChestCm] = useState('94.0');
  const [armCm, setArmCm] = useState('32.5');
  const [thighCm, setThighCm] = useState('53.0');
  const [hipCm, setHipCm] = useState('90.0');
  const [bodyFatPercent, setBodyFatPercent] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMeasurements();
  }, []);

  const loadMeasurements = async () => {
    try {
      setLoading(true);
      const res = await api.getMeasurements();
      setData(res);
      if (res.latest) {
        setWeightKg(res.latest.weightKg?.toString() || '62.0');
        if (res.latest.waistCm) setWaistCm(res.latest.waistCm.toString());
        if (res.latest.chestCm) setChestCm(res.latest.chestCm.toString());
        if (res.latest.armCm) setArmCm(res.latest.armCm.toString());
        if (res.latest.thighCm) setThighCm(res.latest.thighCm.toString());
        if (res.latest.hipCm) setHipCm(res.latest.hipCm.toString());
      }
    } catch (err) {
      console.error('Failed to load measurements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!weightKg) return;

    try {
      setSaving(true);
      await api.logMeasurement({
        weightKg: parseFloat(weightKg),
        waistCm: waistCm ? parseFloat(waistCm) : null,
        chestCm: chestCm ? parseFloat(chestCm) : null,
        armCm: armCm ? parseFloat(armCm) : null,
        thighCm: thighCm ? parseFloat(thighCm) : null,
        hipCm: hipCm ? parseFloat(hipCm) : null,
        bodyFatPercent: bodyFatPercent ? parseFloat(bodyFatPercent) : null,
        notes
      });
      setShowAddForm(false);
      setNotes('');
      await loadMeasurements();
    } catch (err) {
      alert(err.message || 'Failed to record measurement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const measurements = data?.measurements || [];
  const latest = data?.latest || {};
  const first = measurements.length > 0 ? measurements[0] : null;

  // Compute weight delta
  const weightDelta = (first && latest) ? (latest.weightKg - first.weightKg).toFixed(1) : 0;
  const waistDelta = (first?.waistCm && latest?.waistCm) ? (latest.waistCm - first.waistCm).toFixed(1) : 0;

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-fade-in max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-500 flex items-center gap-1.5">
            <Ruler className="w-4 h-4" /> Physical Composition
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-0.5">
            Body Measurements
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Track weight and circumference changes over your 90-day transformation.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-cyan-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Log Measurements
        </button>
      </div>

      {/* Baseline vs Current Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Current Weight</span>
          <p className="text-2xl font-black text-gray-900 dark:text-white font-mono mt-1">
            {latest.weightKg || 62} <span className="text-xs font-normal text-gray-400">kg</span>
          </p>
          <span className={`text-[11px] font-bold mt-1 flex items-center gap-0.5 ${
            parseFloat(weightDelta) > 0 ? 'text-emerald-500' : 'text-cyan-500'
          }`}>
            {parseFloat(weightDelta) >= 0 ? `+${weightDelta}` : weightDelta} kg since start
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Waistline</span>
          <p className="text-2xl font-black text-gray-900 dark:text-white font-mono mt-1">
            {latest.waistCm || 76} <span className="text-xs font-normal text-gray-400">cm</span>
          </p>
          <span className="text-[11px] font-bold text-gray-400 mt-1 block">
            {waistDelta !== 0 ? `${waistDelta} cm change` : 'Baseline stable'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Chest</span>
          <p className="text-2xl font-black text-gray-900 dark:text-white font-mono mt-1">
            {latest.chestCm || 94} <span className="text-xs font-normal text-gray-400">cm</span>
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">Upper torso</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Flexed Arm</span>
          <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono mt-1">
            {latest.armCm || 32.5} <span className="text-xs font-normal text-gray-400">cm</span>
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">Arm circumference</span>
        </div>

      </div>

      {/* Chart: Weight & Waist Progression */}
      {measurements.length > 1 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Timeline Comparison</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Weight & Waist Changes</h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={measurements}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="weightKg" stroke="#06b6d4" strokeWidth={2.5} name="Weight (kg)" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="waistCm" stroke="#10b981" strokeWidth={2} name="Waist (cm)" strokeDasharray="4 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Add Measurement Form */}
      {showAddForm && (
        <form onSubmit={handleSave} className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-md space-y-4 animate-scale-up">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Record Measurement Check-In</h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Weight (kg) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Waist (cm)</label>
              <input
                type="number"
                step="0.1"
                value={waistCm}
                onChange={(e) => setWaistCm(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Chest (cm)</label>
              <input
                type="number"
                step="0.1"
                value={chestCm}
                onChange={(e) => setChestCm(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Arm (cm)</label>
              <input
                type="number"
                step="0.1"
                value={armCm}
                onChange={(e) => setArmCm(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Thigh (cm)</label>
              <input
                type="number"
                step="0.1"
                value={thighCm}
                onChange={(e) => setThighCm(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Hip (cm)</label>
              <input
                type="number"
                step="0.1"
                value={hipCm}
                onChange={(e) => setHipCm(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Check-in Notes / Reflections</label>
            <input
              type="text"
              placeholder="e.g. Measured first thing morning before breakfast"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 text-gray-950 font-bold text-xs sm:text-sm"
            >
              {saving ? 'Saving...' : 'Save Check-In'}
            </button>
          </div>
        </form>
      )}

      {/* Measurement History Table */}
      <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 space-y-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Measurement Log Entries</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Weight</th>
                <th className="py-2.5 px-3">Waist</th>
                <th className="py-2.5 px-3">Chest</th>
                <th className="py-2.5 px-3">Arm</th>
                <th className="py-2.5 px-3">Thigh</th>
                <th className="py-2.5 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-medium">
              {measurements.map(m => (
                <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">{m.date}</td>
                  <td className="py-3 px-3 font-mono font-bold text-cyan-600 dark:text-cyan-400">{m.weightKg} kg</td>
                  <td className="py-3 px-3 font-mono">{m.waistCm ? `${m.waistCm} cm` : '—'}</td>
                  <td className="py-3 px-3 font-mono">{m.chestCm ? `${m.chestCm} cm` : '—'}</td>
                  <td className="py-3 px-3 font-mono">{m.armCm ? `${m.armCm} cm` : '—'}</td>
                  <td className="py-3 px-3 font-mono">{m.thighCm ? `${m.thighCm} cm` : '—'}</td>
                  <td className="py-3 px-3 text-gray-400 truncate max-w-xs">{m.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
