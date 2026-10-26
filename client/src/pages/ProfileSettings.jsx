import React, { useState, useEffect } from 'react';
import {
  User,
  Settings,
  Download,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function ProfileSettings() {
  const { user, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Profile fields
  const [name, setName] = useState('');
  const [age, setAge] = useState(23);
  const [weight, setWeight] = useState(62.0);
  const [height, setHeight] = useState(168.0);
  const [experience, setExperience] = useState('Intermediate');
  const [goal, setGoal] = useState('Build muscle and gradually reduce body fat');
  const [trainingFrequency, setTrainingFrequency] = useState(6);
  const [workoutDuration, setWorkoutDuration] = useState('60-90 minutes');
  const [diet, setDiet] = useState('Vegetarian');
  const [units, setUnits] = useState('kg/cm');
  const [dailyProteinTarget, setDailyProteinTarget] = useState(115);
  const [cardioTargetMins, setCardioTargetMins] = useState(120);

  // Start date
  const [startDate, setStartDate] = useState('');

  // Statuses
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingStartDate, setSavingStartDate] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || 'Athlete');
      setAge(user.age || 23);
      setWeight(user.weight || 62.0);
      setHeight(user.height || 168.0);
      setExperience(user.experience || 'Intermediate');
      setGoal(user.goal || 'Build muscle and gradually reduce body fat');
      setTrainingFrequency(user.trainingFrequency || 6);
      setWorkoutDuration(user.workoutDuration || '60-90 minutes');
      setDiet(user.diet || 'Vegetarian');
      setUnits(user.units || 'kg/cm');
      setDailyProteinTarget(user.dailyProteinTarget || 115);
      setCardioTargetMins(user.cardioTargetMins || 120);
      setStartDate(user.startDate || '');
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await api.updateProfile({
        name,
        age: parseInt(age),
        weight: parseFloat(weight),
        height: parseFloat(height),
        experience,
        goal,
        trainingFrequency: parseInt(trainingFrequency),
        workoutDuration,
        diet,
        units,
        dailyProteinTarget: parseFloat(dailyProteinTarget),
        cardioTargetMins: parseInt(cardioTargetMins)
      });
      await refreshProfile();
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRecalculateStartDate = async (e) => {
    e.preventDefault();
    if (!startDate) return;
    try {
      setSavingStartDate(true);
      await api.recalculateProgram(startDate);
      await refreshProfile();
      alert('Program schedule recalculated for all 90 days!');
    } catch (err) {
      alert(err.message || 'Failed to recalculate start date');
    } finally {
      setSavingStartDate(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gym-mine-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export data');
    }
  };

  const handleConfirmReset = async () => {
    try {
      setResetting(true);
      await api.resetProgram();
      setShowResetModal(false);
      alert('Program has been reset successfully.');
      window.location.reload();
    } catch (err) {
      alert(err.message || 'Failed to reset program');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-fade-in max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-500 flex items-center gap-1.5">
          <Settings className="w-4 h-4" /> User Configuration
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-0.5">
          Profile & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Customize your intermediate stats, recalculate program dates, and manage exports.
        </p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-500" /> Physical & Training Profile
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            {experience} Athlete
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Athlete Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Age (Years)</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Height (cm)</label>
            <input
              type="number"
              step="0.5"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Experience Level</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Diet Style</label>
            <select
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
            >
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Eggetarian">Eggetarian</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Daily Protein Target (g)</label>
            <input
              type="number"
              value={dailyProteinTarget}
              onChange={(e) => setDailyProteinTarget(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Weekly Cardio Goal (Mins)</label>
            <input
              type="number"
              value={cardioTargetMins}
              onChange={(e) => setCardioTargetMins(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Measurement Units</label>
            <select
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
            >
              <option value="kg/cm">Metric (kg / cm)</option>
              <option value="lb/in">Imperial (lb / in)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Primary Fitness Goal</label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingProfile}
            className="px-6 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-black text-xs sm:text-sm shadow-md shadow-cyan-500/20 transition-all"
          >
            {savingProfile ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>

      {/* Recalculate Start Date Card */}
      <form onSubmit={handleRecalculateStartDate} className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-500" /> Program Start Date Recalculation
        </h3>
        <p className="text-xs text-gray-500">
          Changing this date automatically recalculates and shifts all Day 1 through Day 90 calendar dates.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full sm:w-auto bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={savingStartDate}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 text-gray-950 font-bold text-xs sm:text-sm"
          >
            {savingStartDate ? 'Recalculating...' : 'Apply New Start Date'}
          </button>
        </div>
      </form>

      {/* Theme & Data Controls */}
      <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Data & Interface Management</h3>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={toggleTheme}
            className="flex-1 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2 hover:border-gray-400"
          >
            Toggle Theme: <span className="uppercase text-cyan-500">{theme}</span>
          </button>

          <button
            onClick={handleExportData}
            className="flex-1 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2 hover:border-gray-400"
          >
            <Download className="w-4 h-4 text-emerald-500" /> Export All Data (JSON)
          </button>
        </div>

        {/* Reset Danger Zone */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-rose-500">Reset Program Progress</h4>
              <p className="text-[11px] text-gray-500">Clears workout logs and resets calendar to Day 1.</p>
            </div>
            <button
              onClick={() => setShowResetModal(true)}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 text-xs font-bold transition-colors"
            >
              Reset Program
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Are you absolutely sure?</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              This action will permanently erase your logged workout sessions and reset all 90 days. Your body measurement history will be preserved.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                disabled={resetting}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-500/30"
              >
                {resetting ? 'Resetting...' : 'Yes, Reset Program'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
