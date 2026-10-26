import React, { useState, useEffect } from 'react';
import { X, Search, RefreshCw, Check } from 'lucide-react';
import { api } from '../services/api';
import ImageWithFallback from './ImageWithFallback';

export default function SubstitutionModal({
  isOpen,
  onClose,
  currentExercise,
  templateExerciseId,
  onSubstituted
}) {
  const [search, setSearch] = useState('');
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [substituting, setSubstituting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadExercises();
    }
  }, [isOpen]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await api.getExercises({
        category: currentExercise?.category || 'All'
      });
      setExercises(data);
    } catch (err) {
      console.error('Failed to load substitutions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !currentExercise) return null;

  const filteredExercises = exercises.filter(e => {
    if (e.id === currentExercise.id) return false;
    if (!search.trim()) return true;
    return e.name.toLowerCase().includes(search.toLowerCase()) ||
           e.primaryMuscle.toLowerCase().includes(search.toLowerCase()) ||
           e.equipment.toLowerCase().includes(search.toLowerCase());
  });

  const handleConfirmSubstitute = async () => {
    if (!selectedExerciseId) return;
    try {
      setSubstituting(true);
      await api.substituteExercise({
        templateExerciseId,
        newExerciseId: selectedExerciseId
      });
      onSubstituted();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to substitute exercise');
    } finally {
      setSubstituting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-fade-in text-gray-900 dark:text-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-cyan-500" /> Replace Exercise
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Currently: <span className="font-semibold text-gray-800 dark:text-gray-200">{currentExercise.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search alternative ${currentExercise.category} exercises...`}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="text-center py-8 text-sm text-gray-500">Loading alternatives...</div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              No matching exercises found.
            </div>
          ) : (
            filteredExercises.map(ex => {
              const isSelected = selectedExerciseId === ex.id;
              return (
                <div
                  key={ex.id}
                  onClick={() => setSelectedExerciseId(ex.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500 ring-1 ring-cyan-500/50'
                      : 'bg-white dark:bg-gray-800/60 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <ImageWithFallback
                    src={ex.photoUrl}
                    alt={ex.name}
                    muscle={ex.primaryMuscle}
                    className="w-14 h-14 rounded-xl shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                      {ex.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {ex.equipment} • {ex.difficulty}
                    </p>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                    isSelected
                      ? 'bg-cyan-500 border-cyan-500 text-white'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            disabled={!selectedExerciseId || substituting}
            onClick={handleConfirmSubstitute}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              selectedExerciseId && !substituting
                ? 'bg-cyan-500 hover:bg-cyan-400 text-gray-950 shadow-md shadow-cyan-500/20'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
            }`}
          >
            {substituting ? 'Substituting...' : 'Confirm Replacement'}
          </button>
        </div>

      </div>
    </div>
  );
}
