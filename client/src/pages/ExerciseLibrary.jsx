import React, { useState, useEffect } from 'react';
import { Search, Filter, Dumbbell, Info, Sparkles, Plus } from 'lucide-react';
import { api } from '../services/api';
import ImageWithFallback from '../components/ImageWithFallback';
import ExerciseDetailsModal from '../components/ExerciseDetailsModal';
import AddToPlanModal from '../components/AddToPlanModal';

const CATEGORIES = [
  'All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms',
  'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Abs', 'Obliques', 'Lower back'
];

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseToAddToPlan, setExerciseToAddToPlan] = useState(null);

  useEffect(() => {
    loadExercises();
  }, [selectedCategory, selectedDifficulty]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await api.getExercises({
        category: selectedCategory,
        difficulty: selectedDifficulty
      });
      setExercises(data);
    } catch (err) {
      console.error('Failed to load exercises:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = exercises.filter(e => {
    if (!search.trim()) return true;
    return e.name.toLowerCase().includes(search.toLowerCase()) ||
           e.primaryMuscle.toLowerCase().includes(search.toLowerCase()) ||
           e.equipment.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-fade-in max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-500">
            Movement Database
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            Exercise Library ({exercises.length})
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Explore execution cues, anatomy, form tips, and add any movement directly to your workout schedule.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises, muscles, equipment..."
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl pl-10 pr-4 py-2 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="space-y-2">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-gray-950'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="font-semibold text-gray-400 uppercase text-[10px]">Difficulty:</span>
          {DIFFICULTIES.map(diff => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                selectedDifficulty === diff
                  ? 'bg-gray-800 text-cyan-400'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Exercises */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800">
          <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">No exercises found</h3>
          <p className="text-xs text-gray-500 mt-1">Try modifying your search or filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(ex => (
            <div
              key={ex.id}
              onClick={() => setSelectedExercise(ex)}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden hover:border-cyan-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="h-44 w-full relative overflow-hidden">
                  <ImageWithFallback
                    src={ex.photoUrl}
                    alt={ex.name}
                    muscle={ex.primaryMuscle}
                    className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-1">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md">
                      {ex.primaryMuscle}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-900/80 text-gray-300 border border-gray-700 backdrop-blur-md">
                      {ex.difficulty}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-base font-black text-gray-900 dark:text-white line-clamp-1 group-hover:text-cyan-500 transition-colors">
                    {ex.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                    {ex.equipment}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                    {ex.instructions}
                  </p>
                </div>
              </div>

              {/* Card Footer with Details trigger and + Add to Plan button */}
              <div className="p-3.5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-gray-500 truncate">
                  {ex.setsRepsTarget}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExerciseToAddToPlan(ex);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-[11px] flex items-center gap-1 transition-all shadow-sm shadow-cyan-500/20"
                    title="Add to a workout plan split / day"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Add to Plan</span>
                  </button>
                  <span className="p-1.5 text-gray-400 hover:text-cyan-500" title="View form cues and instructions">
                    <Info className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <ExerciseDetailsModal
        isOpen={Boolean(selectedExercise)}
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
        onAddToPlan={(ex) => setExerciseToAddToPlan(ex)}
      />

      {/* Add to Plan Modal */}
      <AddToPlanModal
        isOpen={Boolean(exerciseToAddToPlan)}
        exercise={exerciseToAddToPlan}
        onClose={() => setExerciseToAddToPlan(null)}
        onAdded={() => {
          // No reload needed; schedule is updated in database
        }}
      />

    </div>
  );
}
