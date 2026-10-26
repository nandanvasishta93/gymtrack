import React from 'react';
import { Trophy, CheckCircle2, Clock, Weight, Flame, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WorkoutSummaryModal({ isOpen, summary, onClose }) {
  const navigate = useNavigate();

  if (!isOpen || !summary) return null;

  const session = summary.session || {};
  const prsAchieved = session.setLogs?.filter(s => s.isPr) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-scale-up text-gray-900 dark:text-gray-100 text-center">
        
        {/* Trophy Animation Header */}
        <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
          <Trophy className="w-9 h-9 text-gray-950" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-cyan-500">
          Day Completed!
        </span>
        <h2 className="text-2xl font-black mt-1">Workout Finished</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
          Outstanding effort! All your sets, volume, and reps have been securely recorded.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 my-6 text-left">
          
          <div className="bg-gray-50 dark:bg-gray-800/60 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 text-cyan-500 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Duration</span>
            </div>
            <p className="text-xl font-black font-mono">
              {summary.durationMinutes || Math.round((session.durationSeconds || 0) / 60)} <span className="text-xs font-normal text-gray-400">mins</span>
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/60 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 text-emerald-500 mb-1">
              <Weight className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Volume</span>
            </div>
            <p className="text-xl font-black font-mono">
              {Math.round(summary.totalVolumeKg || session.totalVolumeKg || 0)} <span className="text-xs font-normal text-gray-400">kg</span>
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/60 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 text-amber-500 mb-1">
              <Flame className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Reps</span>
            </div>
            <p className="text-xl font-black font-mono">
              {summary.totalReps || session.totalReps || 0}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/60 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 text-indigo-500 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Exercises</span>
            </div>
            <p className="text-xl font-black font-mono">
              {summary.completedExercises || 0}
            </p>
          </div>

        </div>

        {/* PR Alert if any achieved */}
        {prsAchieved.length > 0 && (
          <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-left flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">New Personal Record!</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                Achieved a milestone on {prsAchieved[0]?.exercise?.name || 'an exercise'}!
              </p>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => {
              onClose();
              navigate('/progress');
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs sm:text-sm font-bold transition-colors"
          >
            View Progress Chart
          </button>
          <button
            onClick={() => {
              onClose();
              navigate('/dashboard');
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all"
          >
            Back to Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
