import React, { useState, useEffect } from 'react';
import { Activity, Plus, Trash2, Clock, Flame, Info, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

const ACTIVITIES = [
  'Incline walking',
  'Treadmill walking',
  'Running',
  'Cycling',
  'Stair climber',
  'Elliptical',
  'Rowing machine',
  'Other'
];

const INTENSITIES = ['Low', 'Moderate', 'High', 'HIIT'];

export default function Cardio() {
  const [loading, setLoading] = useState(true);
  const [cardioData, setCardioData] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Cardio Form
  const [activity, setActivity] = useState('Incline walking');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [distanceKm, setDistanceKm] = useState('');
  const [inclinePercent, setInclinePercent] = useState('10');
  const [speedKmh, setSpeedKmh] = useState('4.5');
  const [intensity, setIntensity] = useState('Moderate');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCardio();
  }, []);

  const loadCardio = async () => {
    try {
      setLoading(true);
      const data = await api.getCardio();
      setCardioData(data);
    } catch (err) {
      console.error('Failed to load cardio:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCardio = async (e) => {
    e.preventDefault();
    if (!durationMinutes) return;

    try {
      setSaving(true);
      await api.logCardio({
        activity,
        durationMinutes: parseInt(durationMinutes),
        distanceKm: distanceKm ? parseFloat(distanceKm) : null,
        inclinePercent: inclinePercent ? parseFloat(inclinePercent) : null,
        speedKmh: speedKmh ? parseFloat(speedKmh) : null,
        intensity,
        notes
      });
      setShowAddForm(false);
      // Reset
      setNotes('');
      await loadCardio();
    } catch (err) {
      alert(err.message || 'Failed to log cardio session');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this cardio entry?')) return;
    try {
      await api.deleteCardio(id);
      await loadCardio();
    } catch (err) {
      alert('Failed to delete cardio');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const weeklyMinutes = cardioData?.weeklyMinutes || 0;
  const weeklyTarget = cardioData?.weeklyTarget || 120;
  const progressPercent = Math.min(100, Math.round((weeklyMinutes / weeklyTarget) * 100));
  const sessions = cardioData?.sessions || [];

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-fade-in max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-500 flex items-center gap-1.5">
            <Activity className="w-4 h-4" /> Aerobic Conditioning
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-0.5">
            Cardio Tracker
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Track weekly aerobic workload, incline treadmill walks, and recovery sessions.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-cyan-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Log Cardio Session
        </button>
      </div>

      {/* Weekly Progress Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-gray-900 to-cyan-950 text-white p-6 border border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Weekly Target Progress</span>
            <h3 className="text-xl sm:text-2xl font-black mt-0.5 font-mono">
              {weeklyMinutes} / {weeklyTarget} <span className="text-xs font-normal text-gray-400">minutes</span>
            </h3>
          </div>
          <span className="text-2xl font-black text-cyan-400 font-mono">
            {progressPercent}%
          </span>
        </div>

        <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Note: Cardio calorie monitors vary wildly; tracking duration, speed, and incline is far more accurate for steady progression.</span>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleCreateCardio} className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-md space-y-4 animate-scale-up">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Record Cardio Session</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Activity</label>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
              >
                {ACTIVITIES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Duration (Mins) *</label>
              <input
                type="number"
                required
                min="1"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Intensity</label>
              <select
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
              >
                {INTENSITIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Distance (km)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Optional"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Incline (%)</label>
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 10%"
                value={inclinePercent}
                onChange={(e) => setInclinePercent(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Speed (km/h)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 4.5"
                value={speedKmh}
                onChange={(e) => setSpeedKmh(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Notes / Reflection</label>
            <input
              type="text"
              placeholder="e.g. Incline walk post-leg workout, heart rate steady"
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
              {saving ? 'Saving...' : 'Save Session'}
            </button>
          </div>
        </form>
      )}

      {/* History List */}
      <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 space-y-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Cardio History</h3>

        {sessions.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-8">No cardio logged yet. Click above to log your first session.</p>
        ) : (
          <div className="space-y-2.5">
            {sessions.map(s => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 text-xs sm:text-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{s.activity}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {s.date} • {s.intensity} Intensity {s.inclinePercent ? `• ${s.inclinePercent}% Incline` : ''} {s.distanceKm ? `• ${s.distanceKm} km` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-cyan-600 dark:text-cyan-400 text-base">
                    {s.durationMinutes}m
                  </span>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors"
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
