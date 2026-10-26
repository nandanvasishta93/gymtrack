import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Coffee,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Filter,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function WorkoutPlan() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [calendarData, setCalendarData] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState('All');
  const [newStartDate, setNewStartDate] = useState('');
  const [savingDate, setSavingDate] = useState(false);
  const [selectedDayModal, setSelectedDayModal] = useState(null);

  useEffect(() => {
    loadCalendar();
    if (user?.startDate) {
      setNewStartDate(user.startDate);
    }
  }, [user]);

  const loadCalendar = async () => {
    try {
      setLoading(true);
      const data = await api.getCalendar();
      setCalendarData(data);
    } catch (err) {
      console.error('Failed to load calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStartDate = async (e) => {
    e.preventDefault();
    if (!newStartDate) return;
    try {
      setSavingDate(true);
      await api.recalculateProgram(newStartDate);
      await refreshProfile();
      await loadCalendar();
      alert('Program schedule recalculated successfully for all 90 days!');
    } catch (err) {
      alert(err.message || 'Failed to update start date');
    } finally {
      setSavingDate(false);
    }
  };

  const getStatusBadge = (status, isToday) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center gap-1 animate-pulse">
            <RotateCcw className="w-3 h-3 animate-spin" /> In Progress
          </span>
        );
      case 'REST_DAY':
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <Coffee className="w-3 h-3" /> Rest Day
          </span>
        );
      case 'MISSED':
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Missed
          </span>
        );
      default:
        return (
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
            isToday
              ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/40'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'
          }`}>
            {isToday ? "Today" : "Scheduled"}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const days = calendarData?.days || [];
  const filteredDays = selectedWeek === 'All'
    ? days
    : days.filter(d => d.weekNumber === parseInt(selectedWeek));

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-fade-in max-w-7xl mx-auto">
      
      {/* Header & Start Date Manager */}
      <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-500 text-xs font-bold uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" /> 90-Day Transformation Roadmap
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            Program Calendar (Day 1 – 90)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
            Track your 13-week progressive overload journey. Clicking any scheduled day opens workout details.
          </p>
        </div>

        {/* Start Date Form */}
        <form onSubmit={handleUpdateStartDate} className="flex items-center gap-2 shrink-0 bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="text-left">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
              Program Start Date
            </label>
            <input
              type="date"
              value={newStartDate}
              onChange={(e) => setNewStartDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-gray-900 dark:text-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={savingDate}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 text-xs font-bold transition-colors shrink-0"
          >
            {savingDate ? 'Saving...' : 'Recalculate'}
          </button>
        </form>
      </div>

      {/* Week Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedWeek('All')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
            selectedWeek === 'All'
              ? 'bg-cyan-500 text-gray-950'
              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-gray-300'
          }`}
        >
          All 90 Days
        </button>
        {Array.from({ length: 13 }, (_, i) => i + 1).map((week) => (
          <button
            key={week}
            onClick={() => setSelectedWeek(week.toString())}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
              selectedWeek === week.toString()
                ? 'bg-cyan-500 text-gray-950'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-gray-300'
            }`}
          >
            Wk {week}
          </button>
        ))}
      </div>

      {/* 90-Day Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
        {filteredDays.map((day) => {
          const isToday = day.isToday;
          const templateName = day.workoutTemplate?.name || (day.status === "REST_DAY" ? "Rest & Recovery" : "Workout");
          
          return (
            <div
              key={day.id}
              onClick={() => {
                if (isToday) navigate('/today');
                else setSelectedDayModal(day);
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between hover:shadow-md ${
                isToday
                  ? 'bg-cyan-500/10 border-cyan-500 ring-2 ring-cyan-500/30'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-md ${
                    isToday ? 'bg-cyan-500 text-gray-950' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}>
                    Day {day.dayNumber}
                  </span>
                  <span className="text-[11px] font-medium text-gray-400">
                    {day.date}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                  {templateName}
                </h4>

                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                  Wk {day.weekNumber} • {day.phaseName.split(':')[0]}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                {getStatusBadge(day.displayStatus, isToday)}
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Details Modal */}
      {selectedDayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-fade-in text-gray-900 dark:text-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <span className="text-xs font-black uppercase text-cyan-500">Day {selectedDayModal.dayNumber} of 90</span>
                <h3 className="text-xl font-black mt-0.5">
                  {selectedDayModal.workoutTemplate?.name || (selectedDayModal.status === "REST_DAY" ? "Rest & Recovery" : "Workout")}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDayModal(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-2.5 text-xs">
              <p><strong>Scheduled Date:</strong> {selectedDayModal.date}</p>
              <p><strong>Week:</strong> Week {selectedDayModal.weekNumber} ({selectedDayModal.phaseName})</p>
              <p><strong>Status:</strong> {selectedDayModal.displayStatus}</p>
              {selectedDayModal.workoutTemplate?.description && (
                <p className="text-gray-500 leading-relaxed bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                  {selectedDayModal.workoutTemplate.description}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedDayModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold"
              >
                Close
              </button>
              {selectedDayModal.status !== "REST_DAY" && (
                <button
                  onClick={() => {
                    setSelectedDayModal(null);
                    navigate(`/today`);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-gray-950 text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-cyan-500/20"
                >
                  Go to Workout <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
