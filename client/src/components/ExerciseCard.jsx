import React, { useState } from 'react';
import { Info, RefreshCw, CheckCircle, RotateCcw, Timer, MessageSquare } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';
import SetRow from './SetRow';
import { useWorkout } from '../context/WorkoutContext';

export default function ExerciseCard({
  item,
  session,
  isCompleted,
  setLogs = [],
  onUpdateSet,
  onToggleExerciseComplete,
  onOpenDetails,
  onOpenSubstitution
}) {
  const { exercise, targetSets, targetReps, restSeconds, id: templateExerciseId } = item;
  const { startRestTimer } = useWorkout();
  const [showNotes, setShowNotes] = useState(false);
  const [exerciseNotes, setExerciseNotes] = useState('');

  // Map sets 1..targetSets
  const setsArray = Array.from({ length: targetSets }, (_, i) => i + 1);

  return (
    <div className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
      isCompleted
        ? 'bg-emerald-500/5 dark:bg-emerald-950/10 border-emerald-500/30 shadow-md'
        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm hover:border-gray-300 dark:hover:border-gray-700'
    }`}>
      {/* Exercise Header */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-gray-100 dark:border-gray-800/80">
        
        <div className="flex items-center gap-3.5 min-w-0">
          <ImageWithFallback
            src={exercise.photoUrl}
            alt={exercise.name}
            muscle={exercise.primaryMuscle}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shrink-0 cursor-pointer shadow-sm"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                {exercise.primaryMuscle}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {exercise.equipment}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white mt-0.5 truncate">
              {exercise.name}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2 mt-0.5">
              <span>Target: <strong className="text-gray-800 dark:text-gray-100 font-bold">{targetSets} sets × {targetReps} reps</strong></span>
              <span>•</span>
              <button
                onClick={() => startRestTimer(restSeconds)}
                className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                title="Start rest timer"
              >
                <Timer className="w-3.5 h-3.5" /> {restSeconds}s rest
              </button>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
          <button
            onClick={() => onOpenDetails(exercise)}
            className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
            title="View Exercise Details & Form Cues"
          >
            <Info className="w-4 h-4 text-cyan-500" />
            <span className="hidden md:inline">Details</span>
          </button>
          
          <button
            onClick={() => onOpenSubstitution(exercise, templateExerciseId)}
            className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
            title="Replace Exercise with an Alternative"
          >
            <RefreshCw className="w-4 h-4 text-amber-500" />
            <span className="hidden md:inline">Replace</span>
          </button>
        </div>

      </div>

      {/* Sets Input List */}
      <div className="p-4 sm:p-5 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 px-1 pb-1">
          <span className="w-12">Set</span>
          <span className="hidden sm:block w-20">Prescription</span>
          <span className="flex-1 max-w-[85px] sm:max-w-[100px] text-center">Weight</span>
          <span className="flex-1 max-w-[75px] sm:max-w-[90px] text-center">Reps</span>
          <span className="w-16 text-center hidden md:block">RIR</span>
          <span className="w-9 text-center">Done</span>
        </div>

        {setsArray.map((setNum) => {
          const loggedSet = setLogs.find(s => s.exerciseId === exercise.id && s.setNumber === setNum) || {};
          return (
            <SetRow
              key={setNum}
              setNumber={setNum}
              targetReps={targetReps}
              defaultRest={restSeconds}
              actualWeight={loggedSet.actualWeightKg !== undefined ? loggedSet.actualWeightKg : ''}
              actualReps={loggedSet.actualReps !== undefined ? loggedSet.actualReps : ''}
              rir={loggedSet.rir !== undefined ? loggedSet.rir : 2}
              completed={Boolean(loggedSet.completed)}
              isPr={Boolean(loggedSet.isPr)}
              onUpdateSet={(data) => onUpdateSet({
                exerciseId: exercise.id,
                setNumber: setNum,
                ...data
              })}
            />
          );
        })}
      </div>

      {/* Exercise Footer: Notes & Confirm Completion */}
      <div className="p-4 sm:p-5 bg-gray-50/70 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Notes Toggle / Input */}
        <div className="flex-1">
          {showNotes ? (
            <input
              type="text"
              value={exerciseNotes}
              onChange={(e) => setExerciseNotes(e.target.value)}
              placeholder="Add personal note (e.g., used pin 4, grip felt strong)..."
              className="w-full text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500"
            />
          ) : (
            <button
              onClick={() => setShowNotes(true)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{exerciseNotes ? exerciseNotes : "Add workout note for this exercise..."}</span>
            </button>
          )}
        </div>

        {/* Explicit Exercise Completion Toggle */}
        <button
          onClick={() => onToggleExerciseComplete(exercise.id, !isCompleted)}
          className={`py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            isCompleted
              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30'
              : 'bg-cyan-500 hover:bg-cyan-400 text-gray-950 shadow-md shadow-cyan-500/20'
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Exercise Completed (Click to Undo)</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Mark Exercise Complete</span>
            </>
          )}
        </button>

      </div>

    </div>
  );
}
