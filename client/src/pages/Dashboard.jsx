import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  Calendar,
  Flame,
  Clock,
  Weight,
  Trophy,
  ArrowRight,
  ShieldAlert,
  Play,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useWorkout } from '../context/WorkoutContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isWorkoutTimerRunning, workoutSeconds, formatTime } = useWorkout();

  const [loading, setLoading] = useState(true);
  const [todayData, setTodayData] = useState(null);
  const [progressSummary, setProgressSummary] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [todayRes, progressRes] = await Promise.all([
        api.getTodayWorkout(),
        api.getProgressSummary()
      ]);
      setTodayData(todayRes);
      setProgressSummary(progressRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs sm:text-sm text-gray-500 font-medium">Loading your 90-Day Tracker...</p>
        </div>
      </div>
    );
  }

  const programDay = todayData?.programDay;
  const template = programDay?.workoutTemplate;
  const session = programDay?.session;
  const isRestDay = todayData?.isRestDay;

  // Completed vs total exercises
  const totalExercises = template?.exercises?.length || 0;
  const completedExercises = session?.exerciseCompletions?.filter(e => e.completed)?.length || 0;
  const completionPercentage = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : (session?.status === 'COMPLETED' ? 100 : 0);

  // Status check
  const isCompleted = session?.status === 'COMPLETED' || programDay?.status === 'COMPLETED';
  const isInProgress = session?.status === 'IN_PROGRESS' || isWorkoutTimerRunning;

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-fade-in max-w-7xl mx-auto">
      
      {/* Hero Welcome / Program Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-gray-900 to-[#101b2b] text-white p-6 sm:p-8 border border-gray-800 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-500 text-gray-950">
                Day {todayData?.dayNumber || 1} of 90
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-300 border border-gray-700">
                Week {programDay?.weekNumber || 1}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {programDay?.phaseName || "Phase 1: Baseline"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Welcome back, {user?.name || 'Athlete'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
              Target: <span className="text-cyan-400 font-semibold">{user?.goal || 'Build muscle and gradually reduce body fat'}</span> • 6 days/wk split with Sunday rest.
            </p>
          </div>

          {/* Quick Metrics Header Pill */}
          <div className="flex items-center gap-3 bg-gray-800/80 backdrop-blur-md p-3.5 rounded-2xl border border-gray-700 self-start md:self-auto shrink-0">
            <div className="text-center px-2">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Overall Plan</span>
              <span className="text-lg font-black text-cyan-400 font-mono">
                {progressSummary?.completionPercentage || 0}%
              </span>
            </div>
            <div className="w-px h-8 bg-gray-700" />
            <div className="text-center px-2">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Done</span>
              <span className="text-lg font-black text-white font-mono">
                {progressSummary?.completedWorkouts || 0} / {progressSummary?.scheduledWorkouts || 77}
              </span>
            </div>
            <div className="w-px h-8 bg-gray-700" />
            <div className="text-center px-2">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Streak</span>
              <span className="text-lg font-black text-amber-400 flex items-center justify-center gap-0.5">
                <Flame className="w-4 h-4 fill-amber-400" /> {progressSummary?.streak || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Workout Card & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Workout Primary Card (2 Columns on Desktop) */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Today's Training Plan • {todayData?.todayDate}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                    {isRestDay ? "Scheduled Rest & Recovery Day" : (template?.name || "Push A")}
                  </h2>
                </div>
              </div>

              {isCompleted ? (
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Completed
                </span>
              ) : isInProgress ? (
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 animate-pulse">
                  <RotateCcw className="w-4 h-4 animate-spin" /> In Progress
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                  {isRestDay ? "Rest" : "Ready to Train"}
                </span>
              )}
            </div>

            {/* Description / Rest Info */}
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-6">
              {isRestDay
                ? "Sundays are dedicated to muscle tissue repair, nervous system replenishment, and joint recovery. Gentle stretching and hydration recommended."
                : (template?.description || "Push split targeting chest, anterior/lateral deltoids, and triceps with progressive loading.")}
            </p>

            {/* Exercises List Preview */}
            {!isRestDay && template?.exercises && (
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                  <span>Planned Exercises ({totalExercises})</span>
                  <span>{completedExercises} / {totalExercises} Completed ({completionPercentage}%)</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>

                {/* Mini exercise pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {template.exercises.map((item, idx) => {
                    const isExCompleted = session?.exerciseCompletions?.some(
                      c => c.exerciseId === item.exercise.id && c.completed
                    );
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                          isExCompleted
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                            : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 text-[10px] flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-semibold truncate">{item.exercise.name}</span>
                        </div>
                        <span className="text-[11px] font-bold text-gray-500 shrink-0 ml-2">
                          {item.targetSets}×{item.targetReps}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action CTA Button */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
            {isRestDay ? (
              <Link
                to="/core"
                className="w-full py-3.5 px-6 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 font-bold text-xs sm:text-sm text-center text-gray-800 dark:text-gray-200 transition-colors"
              >
                View Sunday Gentle Mobility & Abs
              </Link>
            ) : isCompleted ? (
              <button
                onClick={() => navigate('/today')}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" /> Review Completed Workout
              </button>
            ) : isInProgress ? (
              <button
                onClick={() => navigate('/today')}
                className="w-full py-3.5 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
              >
                <Play className="w-4 h-4 fill-current" /> Resume Active Workout ({formatTime(workoutSeconds)})
              </button>
            ) : (
              <button
                onClick={() => navigate('/today')}
                className="w-full py-3.5 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
              >
                <Play className="w-4 h-4 fill-current" /> Start Today's Workout
              </button>
            )}
          </div>

        </div>

        {/* Right Column: Abs & Core Card + Key Stats */}
        <div className="space-y-6">
          
          {/* Dedicated Daily Abs & Core Banner */}
          <div className="rounded-3xl bg-gradient-to-br from-purple-900/30 to-indigo-950/40 border border-purple-500/30 p-5 text-gray-900 dark:text-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Separate Core Module
                </span>
                <span className="text-xs font-bold text-purple-300">
                  {todayData?.coreRoutineName || "Core A"}
                </span>
              </div>
              <h3 className="text-base font-bold">
                Today's Core Routine: {todayData?.coreRoutineName}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {todayData?.coreRoutineName === "Recovery"
                  ? "Sunday core rest. Allow your midsection to recuperate."
                  : "Daily rotating abdominal endurance & anti-rotational stability."}
              </p>
            </div>

            <Link
              to="/core"
              className="mt-4 py-2.5 px-4 rounded-xl bg-purple-500 hover:bg-purple-400 text-gray-950 text-xs font-bold flex items-center justify-between transition-colors shadow-sm"
            >
              <span>{todayData?.coreSession?.completed ? "Core Done (View)" : "Launch Abs & Core Workout"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Training Overview Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            
            <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Training Time</span>
              <p className="text-xl font-black font-mono text-gray-900 dark:text-white mt-1">
                {progressSummary?.totalTrainingMinutes || 0} <span className="text-xs font-normal text-gray-400">mins</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Current Weight</span>
              <p className="text-xl font-black font-mono text-cyan-600 dark:text-cyan-400 mt-1">
                {progressSummary?.currentWeight || user?.weight || 62} <span className="text-xs font-normal text-gray-400">kg</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Core Sessions</span>
              <p className="text-xl font-black font-mono text-purple-600 dark:text-purple-400 mt-1">
                {progressSummary?.coreSessionsCompleted || 0}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Next Rest Day</span>
              <p className="text-xl font-black text-amber-500 mt-1 text-sm sm:text-base">
                Sunday
              </p>
            </div>

          </div>

          {/* Quick Links */}
          <div className="flex gap-2">
            <Link
              to="/exercises"
              className="flex-1 p-3 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-center text-xs font-bold text-gray-800 dark:text-gray-200 transition-colors"
            >
              Exercise Library
            </Link>
            <Link
              to="/nutrition"
              className="flex-1 p-3 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-center text-xs font-bold text-gray-800 dark:text-gray-200 transition-colors"
            >
              Diet & Protein
            </Link>
          </div>

        </div>

      </div>

      {/* Weight Trend Preview Chart if data exists */}
      {progressSummary?.weightTrend && progressSummary.weightTrend.length > 1 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Body Weight Trend</span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Transformation Trajectory</h3>
            </div>
            <Link to="/measurements" className="text-xs font-bold text-cyan-500 hover:underline flex items-center gap-1">
              Log Measurement <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressSummary.weightTrend}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#6b7280" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="weight" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#weightGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
}
