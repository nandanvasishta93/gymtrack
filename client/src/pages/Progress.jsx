import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Trophy,
  Flame,
  Clock,
  Weight,
  BarChart2,
  Calendar,
  Info,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { api } from '../services/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';

export default function Progress() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const data = await api.getProgressSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load progress summary:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const volumeByMuscle = summary?.volumeByMuscle || [];
  const weeklyConsistency = summary?.weeklyConsistency || [];
  const recentPrs = summary?.recentPrs || [];
  const weightTrend = summary?.weightTrend || [];

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-fade-in max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-500 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" /> Analytics & History
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-0.5">
            Progress & Performance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Visualizing volume, weekly consistency, strength progression, and personal records.
          </p>
        </div>

        {/* Milestone Pill */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 px-4 py-2 rounded-2xl shrink-0">
          <Trophy className="w-5 h-5 text-amber-400" />
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold block">Personal Records</span>
            <span className="text-sm font-black text-gray-900 dark:text-white">{recentPrs.length} Milestones</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">90-Day Plan</span>
          <p className="text-2xl font-black text-cyan-500 font-mono mt-1">
            {summary?.completionPercentage || 0}%
          </p>
          <span className="text-[11px] text-gray-400 mt-0.5 block">{summary?.completedWorkouts || 0} workouts logged</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Total Volume</span>
          <p className="text-2xl font-black text-emerald-500 font-mono mt-1">
            {Math.round(summary?.totalVolumeKg || 0)} <span className="text-xs font-normal text-gray-400">kg</span>
          </p>
          <span className="text-[11px] text-gray-400 mt-0.5 block">Accumulated tonnage</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Active Streak</span>
          <p className="text-2xl font-black text-amber-500 font-mono mt-1 flex items-center gap-1">
            <Flame className="w-5 h-5 fill-amber-500" /> {summary?.streak || 0} <span className="text-xs font-normal text-gray-400">days</span>
          </p>
          <span className="text-[11px] text-gray-400 mt-0.5 block">Consecutive adherence</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Cardio Workload</span>
          <p className="text-2xl font-black text-indigo-500 font-mono mt-1">
            {summary?.totalCardioMinutes || 0} <span className="text-xs font-normal text-gray-400">mins</span>
          </p>
          <span className="text-[11px] text-gray-400 mt-0.5 block">Aerobic duration</span>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Adherence Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Weekly Consistency</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Training Sessions Completed</h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyConsistency}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="week" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} domain={[0, 6]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="completed" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Completed Workouts" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volume by Muscle Group Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Hypertrophy Loading</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Total Volume by Primary Muscle (kg)</h3>
          </div>

          <div className="h-64 w-full">
            {volumeByMuscle.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-500">
                Log completed workout sets to generate your muscle volume breakdown!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeByMuscle} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis type="number" stroke="#9ca3af" fontSize={11} />
                  <YAxis type="category" dataKey="muscle" stroke="#9ca3af" fontSize={11} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Bar dataKey="volume" fill="#10b981" radius={[0, 6, 6, 0]} name="Volume (kg)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Scientific Disclaimer */}
      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 text-xs text-gray-500 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
        <span>
          Scientific note: Estimated training volume (sets × reps × weight) is a tracking proxy for progressive workload. It does not correlate 1:1 with muscle hypertrophy due to differing fatigue profiles between compound and isolation movements.
        </span>
      </div>

      {/* Personal Records Table */}
      <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> Recent Personal Records (PRs)
          </h3>
          <span className="text-xs text-gray-500">Calculated via Brzycki formula</span>
        </div>

        {recentPrs.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-8">
            Complete strength sets in your daily workouts to automatically unlock Personal Records.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-2.5 px-3">Exercise</th>
                  <th className="py-2.5 px-3">Weight</th>
                  <th className="py-2.5 px-3">Reps</th>
                  <th className="py-2.5 px-3">Est. 1-Rep Max</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-medium">
                {recentPrs.map(pr => (
                  <tr key={pr.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">{pr.exercise?.name}</td>
                    <td className="py-3 px-3 font-mono font-bold text-cyan-600 dark:text-cyan-400">{pr.weightKg} kg</td>
                    <td className="py-3 px-3 font-mono">{pr.reps} reps</td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-500">~{Math.round(pr.estimated1Rm)} kg</td>
                    <td className="py-3 px-3 text-gray-400">{new Date(pr.achievedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
