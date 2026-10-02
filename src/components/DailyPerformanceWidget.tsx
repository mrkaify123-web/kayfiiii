import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  PlusCircle,
  IndianRupee,
  Percent,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface DailyPerformanceWidgetProps {
  onOpenSummaryModal: () => void;
}

export const DailyPerformanceWidget: React.FC<DailyPerformanceWidgetProps> = ({
  onOpenSummaryModal,
}) => {
  const { currentDailyData } = useApp();

  const totalRegular = currentDailyData.schedule?.totalRegularMatches || currentDailyData.matches.length || 49;
  const completed = currentDailyData.completedCount;
  const cancelled = currentDailyData.cancelledCount;
  const extra = currentDailyData.extraMatches || 0;
  const totalEarnings = currentDailyData.totalEarnings;
  const completionRate = totalRegular > 0 ? Math.round((completed / totalRegular) * 100) : 0;

  return (
    <div className="rounded-3xl p-5 bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <Trophy className="w-4 h-4 text-teal-500" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              DAILY PERFORMANCE SUMMARY
            </h3>
            <p className="text-[11px] text-slate-400">Automatic daily match & earning report</p>
          </div>
        </div>

        <button
          onClick={onOpenSummaryModal}
          className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-0.5"
        >
          <span>Full Report</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5-item summary cards based on the prompt's example */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* Regular Matches */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">REGULAR MATCHES</span>
          <span className="text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">
            {totalRegular}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Total Target</span>
        </div>

        {/* Completed */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            COMPLETED
          </span>
          <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {completed}
          </span>
          <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 block">₹{completed * 3}</span>
        </div>

        {/* Cancelled */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold text-rose-500 uppercase flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            CANCELLED
          </span>
          <span className="text-lg font-extrabold text-rose-500 tabular-nums">
            {cancelled}
          </span>
          <span className="text-[10px] text-rose-500/80 block">₹0</span>
        </div>

        {/* Extra Matches */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-1">
            <PlusCircle className="w-3 h-3" />
            EXTRA
          </span>
          <span className="text-lg font-extrabold text-amber-500 tabular-nums">
            +{extra}
          </span>
          <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 block">₹{extra * 3}</span>
        </div>

        {/* Total Earned */}
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block">
            TOTAL EARNED
          </span>
          <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
            ₹{totalEarnings}
          </span>
          <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 block">Verified</span>
        </div>

        {/* Completion % */}
        <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20">
          <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 uppercase block">
            COMPLETION
          </span>
          <span className="text-lg font-extrabold text-teal-600 dark:text-teal-400 tabular-nums">
            {completionRate}%
          </span>
          <span className="text-[10px] text-teal-600/80 dark:text-teal-400/80 block">
            {completed}/{totalRegular} Done
          </span>
        </div>
      </div>
    </div>
  );
};
