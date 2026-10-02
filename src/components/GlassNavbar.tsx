import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import {
  Home,
  Gamepad2,
  IndianRupee,
  CalendarDays,
  Settings,
  BarChart3,
  History,
  Heart,
  FileText,
} from 'lucide-react';

export const GlassNavbar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems: { tab: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { tab: 'home', label: 'Home', icon: Home },
    { tab: 'matches', label: 'Matches', icon: Gamepad2 },
    { tab: 'earnings', label: 'Earnings', icon: IndianRupee },
    { tab: 'calendar', label: 'Calendar', icon: CalendarDays },
    { tab: 'wellness', label: 'Wellness', icon: Heart },
    { tab: 'idplog', label: 'IDP Log', icon: FileText },
    { tab: 'stats', label: 'Stats', icon: BarChart3 },
    { tab: 'history', label: 'History', icon: History },
    { tab: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-3 sm:bottom-6 left-0 right-0 z-40 flex justify-center px-2 sm:px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center justify-between gap-0.5 sm:gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full glass-panel bg-white/85 dark:bg-slate-900/85 border border-white/50 dark:border-slate-800/80 shadow-xl shadow-slate-950/10 dark:shadow-black/40 backdrop-blur-2xl transition-all max-w-2xl w-full overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          const IconComponent = item.icon;

          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`relative flex flex-col items-center justify-center flex-1 min-w-[50px] sm:min-w-[58px] py-1 px-1 rounded-2xl transition-all duration-200 min-h-[44px] select-none shrink-0 ${
                isActive
                  ? 'text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {/* Active pill background */}
              {isActive && (
                <span
                  className="absolute inset-0 rounded-2xl opacity-15 dark:opacity-25 transition-all duration-200"
                  style={{ backgroundColor: 'var(--primary-accent, #14b8a6)' }}
                />
              )}

              {/* Icon */}
              <div
                className={`transition-transform duration-200 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}
                style={{ color: isActive ? 'var(--primary-accent, #14b8a6)' : undefined }}
              >
                <IconComponent className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>

              {/* Label */}
              <span className={`text-[9px] sm:text-[10px] tracking-tight mt-0.5 whitespace-nowrap truncate max-w-[56px] ${
                isActive ? 'font-bold' : 'font-medium'
              }`}>
                {item.label}
              </span>

              {/* Active tiny dot indicator */}
              {isActive && (
                <span
                  className="w-1 h-1 rounded-full mt-0.5"
                  style={{ backgroundColor: 'var(--primary-accent, #14b8a6)' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
