import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkoutProvider } from './context/WorkoutContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import RestTimerModal from './components/RestTimerModal';

import Dashboard from './pages/Dashboard';
import TodayWorkout from './pages/TodayWorkout';
import WorkoutPlan from './pages/WorkoutPlan';
import AbsCore from './pages/AbsCore';
import ExerciseLibrary from './pages/ExerciseLibrary';
import Cardio from './pages/Cardio';
import Nutrition from './pages/Nutrition';
import Progress from './pages/Progress';
import Measurements from './pages/Measurements';
import ProfileSettings from './pages/ProfileSettings';

function AppLayout() {
  const { user } = useAuth();
  const [dayNumber, setDayNumber] = useState(1);

  useEffect(() => {
    if (user?.startDate) {
      const start = new Date(user.startDate + "T00:00:00Z");
      const today = new Date();
      const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
      const diffTime = todayUtc.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDayNumber(Math.max(1, Math.min(90, diffDays)));
    }
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0b0f17] text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar currentDayNumber={dayNumber} streak={1} />
      
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/today" element={<TodayWorkout />} />
            <Route path="/plan" element={<WorkoutPlan />} />
            <Route path="/core" element={<AbsCore />} />
            <Route path="/exercises" element={<ExerciseLibrary />} />
            <Route path="/cardio" element={<Cardio />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/measurements" element={<Measurements />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <BottomNav />
      <RestTimerModal />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkoutProvider>
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </WorkoutProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
