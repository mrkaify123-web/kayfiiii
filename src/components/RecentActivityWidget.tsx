import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, XCircle, ArrowRight, Clock } from 'lucide-react';

export const RecentActivityWidget: React.FC = () => {
  const { currentDailyData, setSelectedMatchForDetail, setActiveTab } = useApp();

  const activityMatches = currentDailyData.matches
    .filter((m) => m.isCompleted || m.isCancelled)
    .slice(-4)
    .reverse();

  if (activityMatches.length === 0) {
    return (
      <div className="rounded-3xl p-5 bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs text-center py-6">
        <Clock className="w-5 h-5 mx-auto text-slate-400 mb-2" />
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          No matches hosted yet today.
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
          Matches you complete or cancel will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl p-5 bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          RECENT ACTIVITY
        </h3>
        <button
          onClick={() => setActiveTab('matches')}
          className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-2">
        {activityMatches.map((m) => (
          <div
            key={m.id}
            onClick={() => setSelectedMatchForDetail(m)}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  m.isCompleted
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/15 text-rose-500'
                }`}
              >
                {m.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                    #{m.matchNumber}
                  </span>
                  <span className="text-[10px] text-slate-400">Slot {m.slot + 1}</span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{m.time}</span>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`text-xs font-extrabold tabular-nums ${
                  m.isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                }`}
              >
                {m.isCompleted ? '+₹3' : '₹0'}
              </span>
              <span className="block text-[10px] text-slate-400 font-medium">
                {m.isCompleted ? 'Completed' : 'Cancelled'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
