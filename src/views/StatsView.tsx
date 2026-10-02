import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, Trophy, Flame, IndianRupee, Layers, CheckCircle2, XCircle, Calendar, Percent } from 'lucide-react';

export const StatsView: React.FC = () => {
  const { allDailyData, streakDays } = useApp();

  const stats = useMemo(() => {
    let totalCompleted = 0;
    let totalCancelled = 0;
    let totalExtra = 0;
    let totalRegularEarnings = 0;
    let totalExtraEarnings = 0;
    let activeDays = 0;

    Object.values(allDailyData).forEach((day) => {
      const isDayActive = day.completedCount > 0 || day.extraMatches > 0;
      if (isDayActive) {
        activeDays++;
      }
      totalCompleted += day.completedCount || 0;
      totalCancelled += day.cancelledCount || 0;
      totalExtra += day.extraMatches || 0;
      totalRegularEarnings += day.regularEarnings || 0;
      totalExtraEarnings += day.extraEarnings || 0;
    });

    const totalMatches = totalCompleted + totalCancelled + totalExtra;
    const totalEarnings = totalRegularEarnings + totalExtraEarnings;
    const avgMatchesPerDay = activeDays > 0 ? (totalCompleted / activeDays).toFixed(1) : '0';
    const completionRate = totalMatches > 0 ? Math.round((totalCompleted / (totalCompleted + totalCancelled)) * 100) || 0 : 0;

    return {
      totalMatches,
      totalCompleted,
      totalCancelled,
      totalExtra,
      totalRegularEarnings,
      totalExtraEarnings,
      totalEarnings,
      avgMatchesPerDay,
      activeDays,
      completionRate,
    };
  }, [allDailyData]);

  return (
    <div className="space-y-4 sm:space-y-5 pb-24">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Hosting Statistics
              </h2>
              <p className="text-[11px] text-slate-400">All-time lifetime metrics & performance</p>
            </div>
          </div>

          <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold">
            <Flame className="w-4 h-4 fill-amber-500" />
            <span>{streakDays} Days Streak</span>
          </div>
        </div>

        {/* All-time Earnings Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-500/10 to-sky-500/10 border border-teal-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-300 block">
              LIFETIME EARNINGS
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
              ₹{stats.totalEarnings}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Regular</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200 tabular-nums">
                ₹{stats.totalRegularEarnings}
              </span>
            </div>
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px]">Extra</span>
              <span className="font-extrabold text-amber-500 tabular-nums">
                ₹{stats.totalExtraEarnings}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Key Performance Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs text-slate-400 font-medium block">Completed Matches</span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {stats.totalCompleted}
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-2">
            <XCircle className="w-4 h-4" />
          </div>
          <span className="text-xs text-slate-400 font-medium block">Cancelled Matches</span>
          <span className="text-xl sm:text-2xl font-extrabold text-rose-500 tabular-nums">
            {stats.totalCancelled}
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-xs text-slate-400 font-medium block">Extra Matches</span>
          <span className="text-xl sm:text-2xl font-extrabold text-amber-500 tabular-nums">
            {stats.totalExtra}
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center mb-2">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-xs text-slate-400 font-medium block">Active Hosting Days</span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {stats.activeDays}
          </span>
        </div>
      </div>

      {/* Secondary Efficiency Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Avg Matches / Active Day</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {stats.avgMatchesPerDay} matches
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <Trophy className="w-5 h-5 text-teal-500" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Completion Rate</span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {stats.completionRate}%
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <Percent className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
