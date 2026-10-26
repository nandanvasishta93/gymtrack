import React from 'react';
import { X, AlertTriangle, ShieldCheck, CheckCircle2, RefreshCw, Layers, Plus } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

export default function ExerciseDetailsModal({ exercise, isOpen, onClose, onSelectSubstitution, onAddToPlan }) {
  if (!isOpen || !exercise) return null;

  const secondaryMuscles = (() => {
    try {
      return JSON.parse(exercise.secondaryMuscles || '[]');
    } catch {
      return [];
    }
  })();

  const formCues = (() => {
    try {
      return JSON.parse(exercise.formCues || '[]');
    } catch {
      return [];
    }
  })();

  const commonMistakes = (() => {
    try {
      return JSON.parse(exercise.commonMistakes || '[]');
    } catch {
      return [];
    }
  })();

  const variations = (() => {
    try {
      return JSON.parse(exercise.variations || '[]');
    } catch {
      return [];
    }
  })();

  const substitutions = (() => {
    try {
      return JSON.parse(exercise.substitutions || '[]');
    } catch {
      return [];
    }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in text-gray-900 dark:text-gray-100">
        
        {/* Header with image */}
        <div className="relative h-56 sm:h-64 w-full">
          <ImageWithFallback
            src={exercise.photoUrl}
            alt={exercise.name}
            muscle={exercise.primaryMuscle}
            className="w-full h-full rounded-t-3xl"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <span className="bg-cyan-500/90 text-gray-950 text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                {exercise.primaryMuscle}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1 drop-shadow-md">
                {exercise.name}
              </h2>
            </div>
            <span className="bg-gray-900/80 text-gray-200 border border-gray-700 text-xs px-2.5 py-1 rounded-lg">
              {exercise.difficulty}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 uppercase font-semibold">Equipment</span>
              <p className="text-xs sm:text-sm font-bold mt-0.5 line-clamp-1">{exercise.equipment}</p>
            </div>
            <div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 uppercase font-semibold">Target</span>
              <p className="text-xs sm:text-sm font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">{exercise.setsRepsTarget}</p>
            </div>
            <div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 uppercase font-semibold">Rest</span>
              <p className="text-xs sm:text-sm font-bold mt-0.5">{exercise.restSeconds} seconds</p>
            </div>
            <div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 uppercase font-semibold">Category</span>
              <p className="text-xs sm:text-sm font-bold mt-0.5">{exercise.category}</p>
            </div>
          </div>

          {/* Secondary Muscles */}
          {secondaryMuscles.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Secondary Muscles Recruited
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {secondaryMuscles.map((muscle, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-cyan-500" /> Execution Instructions
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/30 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800/60">
              {exercise.instructions}
            </p>
          </div>

          {/* Form Cues */}
          {formCues.length > 0 && (
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4" /> Form & Technique Cues
              </h4>
              <ul className="space-y-1.5">
                {formCues.map((cue, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Common Mistakes */}
          {commonMistakes.length > 0 && (
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" /> Common Mistakes to Avoid
              </h4>
              <ul className="space-y-1.5">
                {commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Safety Notes */}
          {exercise.safetyNotes && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Safety Note</span>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 mt-0.5">{exercise.safetyNotes}</p>
              </div>
            </div>
          )}

          {/* Recommended Substitutions */}
          {substitutions.length > 0 && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 block">
                Recommended Substitutions
              </span>
              <div className="flex flex-wrap gap-2">
                {substitutions.map((sub, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-medium"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white"
          >
            Close Details
          </button>
          {onAddToPlan && (
            <button
              onClick={() => {
                onClose();
                onAddToPlan(exercise);
              }}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-gray-950 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add to Workout Plan
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
