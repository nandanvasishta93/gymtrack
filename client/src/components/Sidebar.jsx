import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Dumbbell,
  ShieldAlert,
  Library,
  Activity,
  Salad,
  TrendingUp,
  Ruler,
  Settings,
  Sparkles
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/today', label: "Today's Workout", icon: Dumbbell, highlight: true },
  { to: '/plan', label: '90-Day Plan', icon: CalendarDays },
  { to: '/core', label: 'Abs & Core', icon: ShieldAlert, badge: 'Daily' },
  { to: '/exercises', label: 'Exercise Library', icon: Library },
  { to: '/cardio', label: 'Cardio', icon: Activity },
  { to: '/nutrition', label: 'Nutrition', icon: Salad },
  { to: '/progress', label: 'Progress & PRs', icon: TrendingUp },
  { to: '/measurements', label: 'Body Metrics', icon: Ruler },
  { to: '/profile', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white dark:bg-[#0b0f17] border-r border-gray-200 dark:border-gray-800 p-4 space-y-6 min-h-[calc(100vh-4rem)]">
      
      {/* Quick Navigation Links */}
      <nav className="space-y-1.5 flex-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-gray-950 shadow-md shadow-cyan-500/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Program Info Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-emerald-950/30 border border-cyan-500/20 text-gray-900 dark:text-white">
        <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 mb-1">
          <Sparkles className="w-3.5 h-3.5" /> 90-Day Transformation
        </div>
        <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-tight">
          Double progression with RIR autoregulation and 6-day hypertrophy split.
        </p>
      </div>

    </aside>
  );
}
