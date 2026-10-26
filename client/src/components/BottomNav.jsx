import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Dumbbell,
  ShieldAlert,
  Salad,
  TrendingUp,
  Settings
} from 'lucide-react';

const MOBILE_NAV = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/today', label: 'Workout', icon: Dumbbell, isMain: true },
  { to: '/core', label: 'Abs/Core', icon: ShieldAlert },
  { to: '/nutrition', label: 'Diet', icon: Salad },
  { to: '/progress', label: 'Stats', icon: TrendingUp },
  { to: '/profile', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0b0f17]/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {MOBILE_NAV.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-1.5 rounded-xl transition-all relative ${
                isActive
                  ? 'text-cyan-500 font-bold scale-105'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`
            }
          >
            {item.isMain ? (
              <div className="w-10 h-10 rounded-2xl bg-cyan-500 text-gray-950 flex items-center justify-center -mt-5 shadow-lg shadow-cyan-500/30">
                <Icon className="w-5 h-5 stroke-[2.5]" />
              </div>
            ) : (
              <Icon className="w-5 h-5" />
            )}
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
