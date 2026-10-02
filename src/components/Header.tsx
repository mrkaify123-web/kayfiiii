import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  RefreshCw,
  Flame,
  Radio,
  Clock,
  Sparkles,
  SlidersHorizontal,
  Target,
} from 'lucide-react';
import { formatISTTime } from '../utils/ist';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenDailySetup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenDailySetup,
}) => {
  const {
    streakDays,
    unreadNotificationCount,
    refreshTimeAndStatus,
    hostingMode,
    setHostingMode,
    focusMode,
    setFocusMode,
    isOnline,
  } = useApp();

  const [isRotating, setIsRotating] = useState(false);
  const currentTimeIST = formatISTTime(undefined, false);

  const handleRefresh = () => {
    setIsRotating(true);
    refreshTimeAndStatus();
    setTimeout(() => setIsRotating(false), 600);
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-800/80 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Brand & Status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0"
               style={{ backgroundColor: 'var(--primary-accent, #14b8a6)' }}>
            <span className="text-sm sm:text-base tracking-wider font-extrabold">FF</span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white truncate">
                Free Fire Hosting
              </h1>
              {!isOnline && (
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  Offline
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                <span className="tabular-nums font-mono">{currentTimeIST} IST</span>
              </span>
              {streakDays > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-0.5 text-amber-700 dark:text-amber-300 font-semibold">
                    <Flame className="w-3 h-3 fill-amber-500 text-amber-600" />
                    <span>{streakDays}d Streak</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Daily Setup Quick Trigger */}
          <button
            onClick={onOpenDailySetup}
            title="Daily Setup & Seed Numbers"
            className="h-9 px-2.5 sm:px-3 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Daily Setup</span>
          </button>

          {/* Focus Mode Quick Toggle */}
          <button
            onClick={() => setFocusMode(!focusMode)}
            title={focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode (Distraction-free)'}
            className={`h-9 px-2.5 sm:px-3 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              focusMode
                ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/20'
                : 'text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Focus</span>
          </button>

          {/* Hosting Mode Quick Switch */}
          <button
            onClick={() => setHostingMode(!hostingMode)}
            title="Toggle Hosting Mode"
            className={`h-9 px-2.5 sm:px-3 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              hostingMode
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                : 'text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${hostingMode ? 'animate-pulse' : ''}`} />
            <span className="hidden xs:inline">{hostingMode ? 'In Hosting' : 'Host Mode'}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            title="Refresh dashboard"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} />
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            title="Notifications"
            className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                    style={{ backgroundColor: 'var(--primary-accent, #14b8a6)' }}>
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
