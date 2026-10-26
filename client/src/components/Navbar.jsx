import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dumbbell, Sun, Moon, Flame, Timer, Calendar, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useWorkout } from '../context/WorkoutContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ currentDayNumber = 1, streak = 0 }) {
  const { isDark, toggleTheme } = useTheme();
  const { isWorkoutTimerRunning, workoutSeconds, formatTime } = useWorkout();
  const { user } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0b0f17]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-gray-950 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Dumbbell className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-1">
              GYM <span className="text-cyan-500">MINE</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 block -mt-1">
              90-Day Tracker
            </span>
          </div>
        </Link>

        {/* Status Indicators in Header */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Day Badge */}
          <Link
            to="/plan"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-cyan-500/50 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-cyan-500" />
            <span>Day {currentDayNumber} / 90</span>
          </Link>

          {/* Streak Counter */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{streak} Day Streak</span>
          </div>

          {/* Active Workout Timer Badge if Running */}
          {isWorkoutTimerRunning && location.pathname !== '/today' && (
            <Link
              to="/today"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 text-xs font-bold animate-pulse"
              title="Workout in progress! Click to return."
            >
              <Timer className="w-4 h-4" />
              <span>{formatTime(workoutSeconds)}</span>
            </Link>
          )}

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-600" />}
          </button>

          {/* Profile Avatar / Settings Link */}
          <Link
            to="/profile"
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-xs font-bold transition-colors"
          >
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              {user?.name?.[0] || 'A'}
            </div>
            <span className="hidden md:inline text-gray-700 dark:text-gray-200">
              {user?.name || 'Profile'}
            </span>
          </Link>

        </div>

      </div>
    </header>
  );
}
