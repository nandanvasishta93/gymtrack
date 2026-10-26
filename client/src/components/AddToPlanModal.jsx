import React, { useState, useEffect } from 'react';
import { X, Calendar, Plus, CheckCircle2, Clock, Dumbbell, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import ImageWithFallback from './ImageWithFallback';

export default function AddToPlanModal({ isOpen, onClose, exercise, onAdded }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [targetSets, setTargetSets] = useState(3);
  const [targetReps, setTargetReps] = useState('8-12');
  const [restSeconds, setRestSeconds] = useState(90);
  const [targetRir, setTargetRir] = useState(2);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      setSuccessMessage('');
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await api.getWorkoutTemplates();
      setTemplates(data);
      if (data && data.length > 0) {
        setSelectedTemplateId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load workout templates:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !exercise) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTemplateId) return;

    try {
      setSubmitting(true);
      const res = await api.addExerciseToPlan({
        templateId: selectedTemplateId,
        exerciseId: exercise.id,
        targetSets: parseInt(targetSets),
        targetReps,
        restSeconds: parseInt(restSeconds),
        targetRir: parseInt(targetRir),
        notes
      });

      setSuccessMessage(res.message || 'Exercise successfully added to your workout plan!');
      if (onAdded) onAdded();

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      alert(err.message || 'Failed to add exercise to plan');
    } finally {
      setSubmitting(false);
    }
  };

  const QUICK_REP_OPTIONS = ['6-8', '8-10', '8-12', '10-12', '12-15', '15-20'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-gray-900 dark:text-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500">
                Custom Schedule
              </span>
              <h3 className="text-lg font-black">
                Add to Workout Plan
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Exercise Summary Card */}
        <div className="flex items-center gap-3.5 p-3.5 my-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
          <ImageWithFallback
            src={exercise.photoUrl}
            alt={exercise.name}
            muscle={exercise.primaryMuscle}
            className="w-16 h-16 rounded-xl shrink-0"
          />
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              {exercise.primaryMuscle}
            </span>
            <h4 className="text-base font-bold text-gray-900 dark:text-white mt-0.5 truncate">
              {exercise.name}
            </h4>
            <p className="text-xs text-gray-500 truncate">
              {exercise.equipment} • {exercise.difficulty}
            </p>
          </div>
        </div>

        {successMessage ? (
          <div className="py-8 text-center space-y-2 animate-scale-up">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              {successMessage}
            </h4>
            <p className="text-xs text-gray-500">Updated across your 90-day program schedule.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Template / Day Picker */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
                Target Workout Split / Day of Week *
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                disabled={loading}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-xs sm:text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500"
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.dayOfWeek}) — {t.exercises?.length || 0} exercises currently
                  </option>
                ))}
              </select>
            </div>

            {/* Prescription Controls Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              
              <div>
                <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                  Sets
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={targetSets}
                  onChange={(e) => setTargetSets(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-bold text-gray-900 dark:text-white focus:outline-none text-center"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                  Target Reps
                </label>
                <input
                  type="text"
                  value={targetReps}
                  onChange={(e) => setTargetReps(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-bold text-gray-900 dark:text-white focus:outline-none text-center"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                  Rest (Seconds)
                </label>
                <input
                  type="number"
                  step="15"
                  min="30"
                  max="300"
                  value={restSeconds}
                  onChange={(e) => setRestSeconds(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-bold text-gray-900 dark:text-white focus:outline-none text-center"
                />
              </div>

            </div>

            {/* Quick Rep Buttons */}
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1.5">
                Quick Rep Ranges:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REP_OPTIONS.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setTargetReps(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                      targetReps === r
                        ? 'bg-cyan-500 text-gray-950 border-cyan-500'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* RIR (Reps In Reserve) */}
            <div>
              <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                Target RIR (Reps In Reserve)
              </label>
              <select
                value={targetRir}
                onChange={(e) => setTargetRir(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
              >
                <option value="1">1 RIR (Very High Intensity / Near Failure)</option>
                <option value="2">2 RIR (Recommended Hypertrophy Standard)</option>
                <option value="3">3 RIR (Moderate Intensity / Technical Control)</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                Custom Prescription Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Focus on deep pause at bottom"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedTemplateId}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{submitting ? 'Adding...' : 'Add to Workout Plan'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
