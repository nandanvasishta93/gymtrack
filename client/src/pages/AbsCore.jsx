import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  Calendar,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import ImageWithFallback from '../components/ImageWithFallback';

export default function AbsCore() {
  const [loading, setLoading] = useState(true);
  const [coreData, setCoreData] = useState(null);
  const [coreHistory, setCoreHistory] = useState(null);
  const [logging, setLogging] = useState(false);

  // Interactive Plank Stopwatch
  const [plankTime, setPlankTime] = useState(0);
  const [isPlankRunning, setIsPlankRunning] = useState(false);

  // Performance inputs for today's routine
  const [setsState, setSetsState] = useState({});

  useEffect(() => {
    loadCoreData();
  }, []);

  useEffect(() => {
    let interval = null;
    if (isPlankRunning) {
      interval = setInterval(() => setPlankTime(prev => prev + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlankRunning]);

  const loadCoreData = async () => {
    try {
      setLoading(true);
      const [todayRes, historyRes] = await Promise.all([
        api.getTodayCore(),
        api.getCoreHistory()
      ]);
      setCoreData(todayRes);
      setCoreHistory(historyRes);

      // Pre-fill existing sets if already logged
      if (todayRes.session?.setLogs?.length > 0) {
        const initial = {};
        todayRes.session.setLogs.forEach(s => {
          initial[`${s.exerciseName}_${s.setNumber}`] = {
            actualReps: s.actualReps,
            completed: s.completed
          };
        });
        setSetsState(initial);
      }
    } catch (err) {
      console.error('Failed to load core data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetChange = (exerciseName, setNum, field, value) => {
    const key = `${exerciseName}_${setNum}`;
    setSetsState(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || { actualReps: 12, completed: false }),
        [field]: value
      }
    }));
  };

  const handleSaveCoreSession = async () => {
    try {
      setLogging(true);
      const exercises = coreData?.template?.exercises || [];
      const setsPayload = [];
      let totalRepsCalculated = 0;

      exercises.forEach(item => {
        const exName = item.exercise.name;
        for (let s = 1; s <= item.targetSets; s++) {
          const state = setsState[`${exName}_${s}`] || {};
          const reps = parseInt(state.actualReps) || 0;
          totalRepsCalculated += reps;
          setsPayload.push({
            exerciseName: exName,
            setNumber: s,
            targetReps: item.targetReps,
            actualReps: reps,
            completed: Boolean(state.completed)
          });
        }
      });

      await api.logCore({
        routineName: coreData.routineName,
        date: coreData.date,
        plankSeconds: plankTime,
        totalReps: totalRepsCalculated,
        sets: setsPayload
      });

      await loadCoreData();
      alert('Abs & Core session recorded successfully!');
    } catch (err) {
      alert(err.message || 'Failed to save core workout');
    } finally {
      setLogging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const routineName = coreData?.routineName || "Core A";
  const template = coreData?.template;
  const isCompleted = Boolean(coreData?.session?.completed);
  const isRecovery = coreData?.isRecovery;

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-fade-in max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-950 via-gray-900 to-[#1e1035] text-white p-6 sm:p-8 border border-purple-800/40 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500 text-gray-950 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Dedicated Abs & Core
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-purple-300 border border-purple-700/50">
                {routineName}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Daily Core & Trunk Stability
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
              Tracked completely independent from your main strength routine. Builds bracing endurance, anti-rotational stiffness, and lower back durability.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 bg-gray-900/80 p-3.5 rounded-2xl border border-gray-800 self-start md:self-auto shrink-0">
            <div className="text-center px-2">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Sessions</span>
              <span className="text-xl font-black text-purple-400 font-mono">
                {coreHistory?.sessionsCompleted || 0}
              </span>
            </div>
            <div className="w-px h-8 bg-gray-800" />
            <div className="text-center px-2">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Plank Time</span>
              <span className="text-xl font-black text-white font-mono">
                {coreHistory?.totalPlankMinutes || 0} <span className="text-xs font-normal text-gray-400">mins</span>
              </span>
            </div>
            <div className="w-px h-8 bg-gray-800" />
            <div className="text-center px-2">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Total Reps</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {coreHistory?.totalReps || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fitness Science & Safety Note Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-gray-700 dark:text-gray-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
            Core Fitness Truth & Autoregulation
          </span>
          <p className="leading-relaxed">
            Abdominal exercises strengthen your deep core and lumbar stabilizers, but they do <strong>not</strong> selectively burn belly fat (spot reduction is a myth). If your core is fatigued or aching, feel free to skip or reduce sets today. Never train through sharp lower back pain.
          </p>
        </div>
      </div>

      {/* Today's Core Routine Card */}
      <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
        
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Today's Prescribed Routine
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-0.5">
              {isRecovery ? "Sunday Gentle Mobility & Rest" : `${routineName} (${template?.description || 'Flexion & Stability'})`}
            </h2>
          </div>

          {isCompleted && (
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Completed Today
            </span>
          )}
        </div>

        {/* Interactive Plank Timer widget */}
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Plank Hold Stopwatch</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Measure isometric anterior and side plank holds</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-black font-mono text-purple-600 dark:text-purple-400 w-24 text-center">
              {Math.floor(plankTime / 60).toString().padStart(2, '0')}:{(plankTime % 60).toString().padStart(2, '0')}
            </span>
            <button
              onClick={() => setIsPlankRunning(!isPlankRunning)}
              className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors ${
                isPlankRunning ? 'bg-amber-500 text-gray-950' : 'bg-purple-500 text-white'
              }`}
            >
              {isPlankRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              onClick={() => {
                setIsPlankRunning(false);
                setPlankTime(0);
              }}
              className="p-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold"
              title="Reset plank stopwatch"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Exercises */}
        {!isRecovery && template?.exercises && (
          <div className="space-y-4">
            {template.exercises.map((item, idx) => {
              const ex = item.exercise;
              const setsCount = item.targetSets;

              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ImageWithFallback
                        src={ex.photoUrl}
                        alt={ex.name}
                        muscle={ex.primaryMuscle}
                        className="w-12 h-12 rounded-xl shrink-0"
                      />
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                          {ex.name}
                        </h4>
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                          Target: {item.targetSets} sets × {item.targetReps} reps
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Set Rows */}
                  <div className="space-y-2 pt-1">
                    {Array.from({ length: setsCount }, (_, i) => i + 1).map((setNum) => {
                      const key = `${ex.name}_${setNum}`;
                      const cur = setsState[key] || {};

                      return (
                        <div
                          key={setNum}
                          className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs"
                        >
                          <span className="font-bold text-gray-500 w-12">Set {setNum}</span>
                          <span className="text-gray-400">Target: {item.targetReps}</span>
                          
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              placeholder="reps"
                              value={cur.actualReps !== undefined ? cur.actualReps : ''}
                              onChange={(e) => handleSetChange(ex.name, setNum, 'actualReps', e.target.value)}
                              className="w-16 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-1 text-center font-bold text-gray-900 dark:text-white focus:outline-none"
                            />
                            <span className="text-gray-400">reps</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSetChange(ex.name, setNum, 'completed', !cur.completed)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                              cur.completed
                                ? 'bg-purple-500 text-white shadow-sm'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Submit button */}
        {!isRecovery && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <button
              onClick={handleSaveCoreSession}
              disabled={logging}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-purple-500 hover:bg-purple-400 text-gray-950 font-black text-xs sm:text-sm shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{logging ? 'Recording...' : 'Mark Core Workout Complete'}</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
