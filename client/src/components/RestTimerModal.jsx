import React from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { Timer, X, Plus, Minus, FastForward } from 'lucide-react';

export default function RestTimerModal() {
  const {
    restSecondsLeft,
    isRestActive,
    initialRestDuration,
    cancelRestTimer,
    adjustRestTime,
    formatTime
  } = useWorkout();

  if (!isRestActive || restSecondsLeft <= 0) return null;

  const percent = initialRestDuration > 0 ? (restSecondsLeft / initialRestDuration) * 100 : 0;

  return (
    <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50 animate-bounce-in">
      <div className="bg-gray-900/95 dark:bg-black/95 text-white border border-cyan-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl w-72 sm:w-80 glow-accent">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-bold tracking-wider uppercase text-cyan-400 flex items-center gap-1">
              <Timer className="w-4 h-4" /> Rest Interval
            </span>
          </div>
          <button
            onClick={cancelRestTimer}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
            title="Dismiss rest timer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Circular / Large timer readout */}
        <div className="flex flex-col items-center my-2">
          <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
            {formatTime(restSecondsLeft)}
          </span>
          <span className="text-xs text-gray-400 mt-1">Catch your breath & prepare next set</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden my-3">
          <div
            className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-1">
          <button
            onClick={() => adjustRestTime(-15)}
            className="flex-1 py-1.5 px-2 bg-gray-800 hover:bg-gray-700 text-xs font-semibold rounded-lg text-gray-300 flex items-center justify-center gap-1 transition-colors"
          >
            <Minus className="w-3 h-3" /> 15s
          </button>
          <button
            onClick={() => adjustRestTime(30)}
            className="flex-1 py-1.5 px-2 bg-gray-800 hover:bg-gray-700 text-xs font-semibold rounded-lg text-cyan-300 flex items-center justify-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3" /> 30s
          </button>
          <button
            onClick={cancelRestTimer}
            className="flex-1 py-1.5 px-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1 transition-colors shadow-sm"
          >
            <FastForward className="w-3 h-3" /> Skip
          </button>
        </div>
      </div>
    </div>
  );
}
