import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Trophy,
  Dumbbell,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { useWorkout } from '../context/WorkoutContext';
import ExerciseCard from '../components/ExerciseCard';
import ExerciseDetailsModal from '../components/ExerciseDetailsModal';
import SubstitutionModal from '../components/SubstitutionModal';
import WorkoutSummaryModal from '../components/WorkoutSummaryModal';

export default function TodayWorkout() {
  const {
    workoutSeconds,
    isWorkoutTimerRunning,
    startWorkoutTimer,
    pauseWorkoutTimer,
    resetWorkoutTimer,
    formatTime
  } = useWorkout();

  const [loading, setLoading] = useState(true);
  const [todayData, setTodayData] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [selectedDetailsExercise, setSelectedDetailsExercise] = useState(null);
  const [substitutionTarget, setSubstitutionTarget] = useState(null);
  const [workoutSummary, setWorkoutSummary] = useState(null);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      setLoading(true);
      const data = await api.getTodayWorkout();
      setTodayData(data);

      if (data.programDay?.session) {
        setActiveSession(data.programDay.session);
        if (data.programDay.session.status === 'IN_PROGRESS') {
          startWorkoutTimer();
        }
      }
    } catch (err) {
      console.error('Failed to load today workout:', err);
    } finally {
      setLoading(false);
    }
  };

  // Ensure session is started before logging sets
  const ensureSessionStarted = async () => {
    if (activeSession) return activeSession;
    if (!todayData?.programDay?.id) return null;

    try {
      const session = await api.startSession(todayData.programDay.id);
      setActiveSession(session);
      startWorkoutTimer();
      return session;
    } catch (err) {
      console.error('Failed to initialize session:', err);
      return null;
    }
  };

  // Handle set log update
  const handleUpdateSet = async (setData) => {
    try {
      const session = await ensureSessionStarted();
      if (!session) return;

      const updatedSet = await api.logSet({
        sessionId: session.id,
        ...setData
      });

      // Optimistic local update
      setActiveSession(prev => {
        if (!prev) return prev;
        const existingLogs = prev.setLogs || [];
        const filtered = existingLogs.filter(
          s => !(s.exerciseId === updatedSet.exerciseId && s.setNumber === updatedSet.setNumber)
        );
        return {
          ...prev,
          setLogs: [...filtered, updatedSet]
        };
      });
    } catch (err) {
      console.error('Failed to log set:', err);
    }
  };

  // Handle exercise completion toggle
  const handleToggleExerciseComplete = async (exerciseId, completed) => {
    try {
      const session = await ensureSessionStarted();
      if (!session) return;

      const completion = await api.toggleExerciseComplete({
        sessionId: session.id,
        exerciseId,
        completed
      });

      setActiveSession(prev => {
        if (!prev) return prev;
        const existingCompletions = prev.exerciseCompletions || [];
        const filtered = existingCompletions.filter(c => c.exerciseId !== exerciseId);
        return {
          ...prev,
          exerciseCompletions: [...filtered, completion]
        };
      });
    } catch (err) {
      console.error('Failed to toggle exercise completion:', err);
    }
  };

  // Finish Workout
  const handleFinishWorkout = async () => {
    if (!activeSession) return;
    try {
      setFinishing(true);
      const res = await api.finishWorkout({
        sessionId: activeSession.id,
        durationSeconds: workoutSeconds
      });

      pauseWorkoutTimer();
      setWorkoutSummary(res.summary);
      await loadTodayData();
    } catch (err) {
      alert(err.message || 'Failed to finish workout');
    } finally {
      setFinishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const programDay = todayData?.programDay;
  const template = programDay?.workoutTemplate;
  const isRestDay = todayData?.isRestDay;
  const exercises = template?.exercises || [];
  const setLogs = activeSession?.setLogs || [];
  const exerciseCompletions = activeSession?.exerciseCompletions || [];

  const completedExercisesCount = exerciseCompletions.filter(e => e.completed).length;
  const totalExercisesCount = exercises.length;
  const progressPercent = totalExercisesCount > 0 ? Math.round((completedExercisesCount / totalExercisesCount) * 100) : 0;
  const isAlreadyFinished = activeSession?.status === 'COMPLETED' || programDay?.status === 'COMPLETED';

  if (isRestDay) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-3xl mx-auto flex items-center justify-center border border-amber-500/20">
          <Dumbbell className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">
          Sunday Rest & Recovery
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          No strength workout scheduled for today. Rest is an essential pillar of the 90-day hypertrophy cycle.
        </p>
        <div className="pt-4">
          <a
            href="/core"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-purple-500 text-gray-950 font-bold text-sm shadow-md"
          >
            <ShieldAlert className="w-4 h-4" /> Check Optional Core & Mobility
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-12 animate-fade-in max-w-5xl mx-auto">
      
      {/* Sticky Workout Progress Bar & Timer Control */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-[#0b0f17]/95 backdrop-blur-md border border-gray-200 dark:border-gray-800 p-4 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Workout Info */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-cyan-500">Day {todayData?.dayNumber || 1} of 90</span>
              <span className="text-[10px] text-gray-400">• Week {programDay?.weekNumber || 1}</span>
            </div>
            <h1 className="text-lg font-black text-gray-900 dark:text-white truncate">
              {template?.name || "Push A"}
            </h1>
          </div>
        </div>

        {/* Live Stopwatch & Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800/80 px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
            <span className="text-xs font-bold text-gray-500 uppercase">Timer</span>
            <span className="text-base font-black font-mono text-gray-900 dark:text-white">
              {formatTime(workoutSeconds)}
            </span>
            <button
              onClick={() => {
                if (isWorkoutTimerRunning) pauseWorkoutTimer();
                else startWorkoutTimer();
              }}
              className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors ml-1"
              title={isWorkoutTimerRunning ? "Pause timer" : "Start timer"}
            >
              {isWorkoutTimerRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
          </div>

          {/* Finish Button */}
          {!isAlreadyFinished ? (
            <button
              disabled={finishing}
              onClick={handleFinishWorkout}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{finishing ? "Saving..." : "Finish Workout"}</span>
            </button>
          ) : (
            <span className="px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Completed
            </span>
          )}

        </div>

      </div>

      {/* Progressive Overload Directive Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/30 to-blue-950/20 border border-cyan-500/20 flex items-start gap-3 text-xs">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-cyan-400 uppercase tracking-wider block">Double Progression Rule</span>
          <p className="text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">
            Aim to hit the top end of the rep range on all sets first with 1–2 reps in reserve (RIR). Once you achieve target reps across all sets, increase load by a small increment in your next session.
          </p>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-6">
        {exercises.map((item) => {
          const isCompleted = exerciseCompletions.some(
            c => c.exerciseId === item.exercise.id && c.completed
          );

          return (
            <ExerciseCard
              key={item.id}
              item={item}
              session={activeSession}
              isCompleted={isCompleted}
              setLogs={setLogs}
              onUpdateSet={handleUpdateSet}
              onToggleExerciseComplete={handleToggleExerciseComplete}
              onOpenDetails={(ex) => setSelectedDetailsExercise(ex)}
              onOpenSubstitution={(ex, templateExerciseId) => {
                setSubstitutionTarget({ exercise: ex, templateExerciseId });
              }}
            />
          );
        })}
      </div>

      {/* Bottom Summary Callout */}
      {!isAlreadyFinished && (
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center space-y-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {completedExercisesCount} of {totalExercisesCount} exercises marked complete ({progressPercent}%). All set logs are automatically saved in real-time.
          </p>
          <button
            onClick={handleFinishWorkout}
            disabled={finishing}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition-all inline-flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Complete & Finalize Today's Workout</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <ExerciseDetailsModal
        isOpen={Boolean(selectedDetailsExercise)}
        exercise={selectedDetailsExercise}
        onClose={() => setSelectedDetailsExercise(null)}
      />

      <SubstitutionModal
        isOpen={Boolean(substitutionTarget)}
        currentExercise={substitutionTarget?.exercise}
        templateExerciseId={substitutionTarget?.templateExerciseId}
        onClose={() => setSubstitutionTarget(null)}
        onSubstituted={() => loadTodayData()}
      />

      <WorkoutSummaryModal
        isOpen={Boolean(workoutSummary)}
        summary={workoutSummary}
        onClose={() => setWorkoutSummary(null)}
      />

    </div>
  );
}
