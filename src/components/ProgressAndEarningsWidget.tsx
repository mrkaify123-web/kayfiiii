import React from 'react';
import { useApp } from '../context/AppContext';
import { IndianRupee, Target, Layers, PlusCircle, CheckCircle, XCircle } from 'lucide-react';

interface ProgressAndEarningsWidgetProps {
  onOpenExtraModal: () => void;
}

export const ProgressAndEarningsWidget: React.FC<ProgressAndEarningsWidgetProps> = ({
  onOpenExtraModal,
}) => {
  const { currentDailyData, settings } = useApp();

  const totalRegular = currentDailyData.schedule?.totalRegularMatches || 49;
  const completed = currentDailyData.completedCount || 0;
  const cancelled = currentDailyData.cancelledCount || 0;
  const extra = currentDailyData.extraMatches || 0;
  const remaining = Math.max(0, totalRegular - completed - cancelled);

  const regularEarnings = currentDailyData.regularEarnings || 0;
  const extraEarnings = currentDailyData.extraEarnings || 0;
  const totalEarnings = currentDailyData.totalEarnings || 0;

  // Regular progress percentage (max 100%)
  const progressPercent = totalRegular > 0 ? Math.min(100, Math.round((completed / totalRegular) * 100)) : 0;

  // Target calculations
  const dailyTarget = settings.hosting.dailyTarget || 147;
  const targetPercent = Math.min(100, Math.round((totalEarnings / dailyTarget) * 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      {/* Card 1: Today's Earnings & Target */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white/75 dark:bg-slate-900/75 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                TODAY'S EARNINGS
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                ₹{totalEarnings}
              </span>
            </div>
          </div>

          <button
            onClick={onOpenExtraModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-teal-500" />
            <span>Extra Matches ({extra})</span>
          </button>
        </div>

        {/* Breakdown chips */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-center">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Regular</span>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 tabular-nums">
              ₹{regularEarnings}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Extra</span>
            <span className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              ₹{extraEarnings}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Target</span>
            <span className="text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400 tabular-nums">
              ₹{dailyTarget}
            </span>
          </div>
        </div>

        {/* Target Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
              <Target className="w-3.5 h-3.5 text-teal-500" />
              Daily Target
            </span>
            <span className="tabular-nums font-bold text-slate-800 dark:text-slate-200">
              ₹{totalEarnings} / ₹{dailyTarget} ({targetPercent}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${targetPercent}%`,
                backgroundColor: 'var(--primary-accent, #14b8a6)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Card 2: Today's Match Progress */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white/75 dark:bg-slate-900/75 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                TODAY'S PROGRESS
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {completed} <span className="text-sm font-semibold text-slate-400">/ {totalRegular}</span>
              </span>
            </div>
          </div>

          <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 tabular-nums">
            {progressPercent}% Done
          </span>
        </div>

        {/* Regular matches progress bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
            {/* Completed Segment */}
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${(completed / totalRegular) * 100}%` }}
              title={`Completed: ${completed}`}
            />
            {/* Cancelled Segment */}
            <div
              className="h-full bg-rose-500/70 transition-all duration-500"
              style={{ width: `${(cancelled / totalRegular) * 100}%` }}
              title={`Cancelled: ${cancelled}`}
            />
          </div>
        </div>

        {/* Stat badges */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs">
          <div className="p-1.5 rounded-lg">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Completed</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{completed}</span>
          </div>
          <div className="p-1.5 rounded-lg">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Remaining</span>
            <span className="font-bold text-slate-700 dark:text-slate-300 tabular-nums">{remaining}</span>
          </div>
          <div className="p-1.5 rounded-lg">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Cancelled</span>
            <span className="font-bold text-rose-500 tabular-nums">{cancelled}</span>
          </div>
          <div className="p-1.5 rounded-lg">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Extra</span>
            <span className="font-bold text-amber-500 tabular-nums">+{extra}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
