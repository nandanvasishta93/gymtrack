import React from 'react';
import { Check, Flame, Trophy } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

export default function SetRow({
  setNumber,
  targetWeight = 0,
  targetReps = "8-12",
  defaultRest = 90,
  actualWeight,
  actualReps,
  rir = 2,
  completed = false,
  isPr = false,
  onUpdateSet,
  disabled = false
}) {
  const { startRestTimer } = useWorkout();

  const handleToggleComplete = () => {
    const nextCompleted = !completed;
    onUpdateSet({
      completed: nextCompleted,
      actualWeightKg: parseFloat(actualWeight) || 0,
      actualReps: parseInt(actualReps) || (parseInt(targetReps) || 10),
      rir: parseInt(rir)
    });

    // If marked completed, automatically trigger rest countdown
    if (nextCompleted) {
      startRestTimer(defaultRest);
    }
  };

  const handleWeightChange = (e) => {
    onUpdateSet({
      actualWeightKg: parseFloat(e.target.value) || 0,
      actualReps: parseInt(actualReps) || 0,
      rir: parseInt(rir),
      completed
    });
  };

  const handleRepsChange = (e) => {
    onUpdateSet({
      actualWeightKg: parseFloat(actualWeight) || 0,
      actualReps: parseInt(e.target.value) || 0,
      rir: parseInt(rir),
      completed
    });
  };

  const handleRirChange = (e) => {
    onUpdateSet({
      actualWeightKg: parseFloat(actualWeight) || 0,
      actualReps: parseInt(actualReps) || 0,
      rir: parseInt(e.target.value),
      completed
    });
  };

  return (
    <div className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-all duration-200 ${
      completed
        ? 'bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-950/20 dark:border-emerald-500/40'
        : 'bg-white dark:bg-gray-800/60 border-gray-200 dark:border-gray-700/60 hover:border-cyan-500/40'
    }`}>
      {/* Set Badge */}
      <div className="flex items-center gap-1.5 w-12 shrink-0">
        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
          completed
            ? 'bg-emerald-500 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        }`}>
          {setNumber}
        </span>
        {isPr && (
          <span title="New Personal Record!">
            <Trophy className="w-4 h-4 text-amber-400 animate-pulse" />
          </span>
        )}
      </div>

      {/* Target hint */}
      <div className="hidden sm:block text-[11px] text-gray-600 dark:text-gray-300 w-20 shrink-0">
        Target: <span className="font-semibold text-gray-800 dark:text-gray-100">{targetReps} reps</span>
      </div>

      {/* Actual Weight input */}
      <div className="flex-1 max-w-[85px] sm:max-w-[100px]">
        <div className="relative">
          <input
            type="number"
            step="0.5"
            min="0"
            value={actualWeight === 0 ? '' : actualWeight}
            onChange={handleWeightChange}
            placeholder="kg"
            disabled={disabled}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-1.5 px-2 text-sm font-semibold text-center text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
          <span className="absolute right-1.5 top-2 text-[10px] text-gray-400 pointer-events-none">kg</span>
        </div>
      </div>

      {/* Actual Reps input */}
      <div className="flex-1 max-w-[75px] sm:max-w-[90px]">
        <div className="relative">
          <input
            type="number"
            min="0"
            max="100"
            value={actualReps === 0 ? '' : actualReps}
            onChange={handleRepsChange}
            placeholder="reps"
            disabled={disabled}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-1.5 px-2 text-sm font-semibold text-center text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
          <span className="absolute right-1.5 top-2 text-[10px] text-gray-400 pointer-events-none">reps</span>
        </div>
      </div>

      {/* RIR (Reps in Reserve) select */}
      <div className="w-16 shrink-0 hidden md:block">
        <select
          value={rir}
          onChange={handleRirChange}
          disabled={disabled}
          title="Reps In Reserve (How many more reps could you have done?)"
          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-1.5 px-1 text-xs font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="0">0 RIR (Max)</option>
          <option value="1">1 RIR</option>
          <option value="2">2 RIR</option>
          <option value="3">3+ RIR</option>
        </select>
      </div>

      {/* Complete Checkbox Button */}
      <button
        type="button"
        onClick={handleToggleComplete}
        disabled={disabled}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 ${
          completed
            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400/50 scale-105'
            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/60 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600'
        }`}
        title={completed ? "Mark set incomplete" : "Mark set complete"}
      >
        <Check className={`w-5 h-5 transition-transform ${completed ? 'scale-110 stroke-[3]' : 'opacity-40'}`} />
      </button>
    </div>
  );
}
