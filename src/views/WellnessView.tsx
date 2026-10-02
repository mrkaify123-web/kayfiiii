import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Heart,
  Utensils,
  Droplets,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  Flame,
  Calendar,
  Coffee,
  Check,
  Plus,
  RefreshCw,
  Sliders,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { formatDateDisplay, formatISTTime } from '../utils/ist';

export const WellnessView: React.FC = () => {
  const {
    wellnessSettings,
    wellnessTodayData,
    wellnessDailyHistory,
    wellnessStreak,
    secondsToNextBreak,
    nextBreakTimeFormatted,
    markWellnessItem,
    triggerManualBreak,
    snoozeWellnessBreak,
    setActiveTab,
  } = useApp();

  const [waterGlasses, setWaterGlasses] = useState(wellnessTodayData?.waterCount || 0);

  // Format countdown mm:ss or hh:mm:ss
  const formatCountdown = (totalSec: number) => {
    if (totalSec <= 0) return 'Break due now!';
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleWaterIncrement = () => {
    const nextCount = (wellnessTodayData?.waterCount || 0) + 1;
    setWaterGlasses(nextCount);
    markWellnessItem('water', true, nextCount);
  };

  const historyDates = Object.keys(wellnessDailyHistory)
    .sort()
    .reverse()
    .slice(0, 14);

  return (
    <div className="space-y-4 sm:space-y-6 pb-24">
      {/* 1. Hero Next Break Countdown Banner */}
      <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-sky-500/10 border border-teal-500/25 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full text-white bg-teal-600 dark:bg-teal-500 shadow-xs">
                WELLNESS REMINDER
              </span>
              {wellnessSettings.enabled ? (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Active (Every {Math.round(wellnessSettings.breakIntervalMinutes / 60)}h)
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-400 bg-slate-500/10 px-2 py-0.5 rounded-full">
                  Disabled
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight font-mono">
                {formatCountdown(secondsToNextBreak)}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                until next break
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-teal-500" />
              <span>
                Next break scheduled at: <strong>{nextBreakTimeFormatted || 'Calculating...'} IST</strong>
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerManualBreak}
              className="px-3.5 py-2.5 rounded-2xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <Coffee className="w-4 h-4" />
              <span>Take Break Now</span>
            </button>

            <button
              onClick={() => snoozeWellnessBreak(10)}
              className="px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-xs"
            >
              Snooze 10m
            </button>
          </div>
        </div>
      </div>

      {/* 2. Today's 3-in-1 Checklist (Food, Water, Rest) */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Heart className="w-4 h-4 text-teal-500" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                TODAY'S WELLNESS CHECKLIST
              </h3>
              <p className="text-[11px] text-slate-400">
                Mark your habits with one tap as you host matches
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{wellnessStreak} Day Streak</span>
          </div>
        </div>

        {/* 3 Interactive Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Item 1: Food */}
          <div
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
              wellnessTodayData.foodDone
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/70'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold">
                  <Utensils className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
                    Food & Meals
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    {wellnessTodayData.foodDone
                      ? `Marked Done at ${wellnessTodayData.foodMarkedAt || 'today'}`
                      : 'Pending'}
                  </span>
                </div>
              </div>

              {wellnessTodayData.foodDone && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              )}
            </div>

            <button
              onClick={() => markWellnessItem('food', !wellnessTodayData.foodDone)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                wellnessTodayData.foodDone
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-teal-600 hover:text-white'
              }`}
            >
              {wellnessTodayData.foodDone ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{wellnessTodayData.foodDone ? 'Marked Done' : 'Mark as Done'}</span>
            </button>
          </div>

          {/* Item 2: Water */}
          <div
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
              wellnessTodayData.waterDone
                ? 'bg-sky-500/10 border-sky-500/30'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/70'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-600 flex items-center justify-center font-bold">
                  <Droplets className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
                    Water Hydration
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    {wellnessTodayData.waterCount || 0} glasses logged
                  </span>
                </div>
              </div>

              {wellnessTodayData.waterDone && (
                <CheckCircle2 className="w-5 h-5 text-sky-500" />
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleWaterIncrement}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 transition-all shadow-xs flex items-center justify-center gap-1 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+1 Glass</span>
              </button>

              <button
                onClick={() => markWellnessItem('water', !wellnessTodayData.waterDone)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  wellnessTodayData.waterDone
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {wellnessTodayData.waterDone ? 'Done' : 'Mark'}
              </button>
            </div>
          </div>

          {/* Item 3: Rest */}
          <div
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
              wellnessTodayData.restDone
                ? 'bg-purple-500/10 border-purple-500/30'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/70'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-4.5 h-4.5 text-teal-600" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
                    Rest & Stretch
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    {wellnessTodayData.restDone
                      ? `Marked at ${wellnessTodayData.restMarkedAt || 'today'}`
                      : `${wellnessSettings.restDurationMinutes}m recommended`}
                  </span>
                </div>
              </div>

              {wellnessTodayData.restDone && (
                <CheckCircle2 className="w-5 h-5 text-teal-500" />
              )}
            </div>

            <button
              onClick={() => markWellnessItem('rest', !wellnessTodayData.restDone)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                wellnessTodayData.restDone
                  ? 'bg-teal-600 text-white hover:bg-teal-700'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-teal-600 hover:text-white'
              }`}
            >
              {wellnessTodayData.restDone ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{wellnessTodayData.restDone ? 'Marked Rested' : 'Mark Rest Done'}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats: Breaks Taken vs Skipped */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Breaks Taken</span>
            <span className="text-base sm:text-lg font-extrabold text-teal-600 dark:text-teal-400 tabular-nums">
              {wellnessTodayData.breaksTaken || 0}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Breaks Skipped</span>
            <span className="text-base sm:text-lg font-extrabold text-rose-500 tabular-nums">
              {wellnessTodayData.breaksSkipped || 0}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Food Timing</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
              {wellnessSettings.mealTimes.filter((m) => m.enabled).map((m) => m.time).join(', ') || 'Custom'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Configure</span>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 block">
                Settings
              </span>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-500/20"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Daily Log with Timestamps & Past Days History */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4 text-teal-500" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                DAILY LOG & PAST HISTORY
              </h3>
              <p className="text-[11px] text-slate-400">Date-wise records of break habits and timestamps</p>
            </div>
          </div>
        </div>

        {/* History Date List */}
        <div className="space-y-2.5 pt-1">
          {historyDates.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">
              No previous wellness logs recorded yet. Take breaks to build your streak!
            </p>
          )}

          {historyDates.map((dateStr) => {
            const dayEntry = wellnessDailyHistory[dateStr];
            const isAllDone = dayEntry.foodDone && dayEntry.waterDone && dayEntry.restDone;

            return (
              <div
                key={dateStr}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                      {formatDateDisplay(dateStr)}
                    </span>
                    {isAllDone && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>All 3 Done</span>
                      </span>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-slate-400">
                    <span>{dayEntry.breaksTaken || 0} taken</span>
                    <span className="mx-1">·</span>
                    <span>{dayEntry.breaksSkipped || 0} skipped</span>
                  </div>
                </div>

                {/* Habit Badges */}
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1 ${
                      dayEntry.foodDone
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                        : 'bg-slate-200/50 dark:bg-slate-700/50 text-slate-400'
                    }`}
                  >
                    <Utensils className="w-3 h-3" />
                    <span>Food: {dayEntry.foodDone ? dayEntry.foodMarkedAt || 'Done' : 'Pending'}</span>
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1 ${
                      dayEntry.waterDone
                        ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                        : 'bg-slate-200/50 dark:bg-slate-700/50 text-slate-400'
                    }`}
                  >
                    <Droplets className="w-3 h-3" />
                    <span>Water: {dayEntry.waterCount || (dayEntry.waterDone ? '1' : '0')} cups</span>
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1 ${
                      dayEntry.restDone
                        ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300'
                        : 'bg-slate-200/50 dark:bg-slate-700/50 text-slate-400'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Rest: {dayEntry.restDone ? 'Done' : 'Pending'}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
