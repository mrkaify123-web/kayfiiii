import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Trophy,
  CheckCircle2,
  XCircle,
  PlusCircle,
  IndianRupee,
  Percent,
  Copy,
  Check,
  Calendar,
  FileText,
  Flame,
} from 'lucide-react';
import { formatDateDisplay } from '../utils/ist';

interface DailySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDate?: string;
}

export const DailySummaryModal: React.FC<DailySummaryModalProps> = ({
  isOpen,
  onClose,
  targetDate,
}) => {
  const { allDailyData, selectedDate, streakDays, setToastMessage } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const dateToInspect = targetDate || selectedDate;
  const day = allDailyData[dateToInspect];

  const totalRegular = day?.schedule?.totalRegularMatches || day?.matches?.length || 49;
  const completed = day?.completedCount || 0;
  const cancelled = day?.cancelledCount || 0;
  const extra = day?.extraMatches || 0;
  const totalEarnings = day?.totalEarnings || 0;
  const completionRate = totalRegular > 0 ? Math.round((completed / totalRegular) * 100) : 0;
  const notes = day?.notes || '';

  const cancelledWithReasons = day?.matches?.filter((m) => m.isCancelled) || [];

  const handleCopySummary = async () => {
    const summaryText = `📊 Today's Summary (${formatDateDisplay(dateToInspect)})
• ${totalRegular} Regular Matches
• ${completed} Completed
• ${cancelled} Cancelled
• ${extra} Extra Matches
• ₹${totalEarnings} Total Earned
• ${completionRate}% Completion Rate${notes ? `\n\n📝 Notes: ${notes}` : ''}`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setToastMessage({ text: 'Daily summary copied to clipboard!' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setToastMessage({ text: 'Unable to copy summary.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Daily Performance Summary
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatDateDisplay(dateToInspect)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
          {/* Main Earnings & Completion Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-sky-500/10 border border-teal-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-300 block">
                TOTAL EARNED
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
                ₹{totalEarnings}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                Regular: ₹{day?.regularEarnings || 0} + Extra: ₹{day?.extraEarnings || 0}
              </span>
            </div>

            {/* Circular / Pill Completion Badge */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
              <Percent className="w-4 h-4 text-teal-500 mb-0.5" />
              <span className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {completionRate}%
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">COMPLETION</span>
            </div>
          </div>

          {/* 6 Grid Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Total Regular */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">REGULAR MATCHES</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                {totalRegular}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Scheduled Target</span>
            </div>

            {/* Completed */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase font-bold">COMPLETED</span>
              </div>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {completed} Matches
              </span>
              <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 block">₹{completed * 3} Earned</span>
            </div>

            {/* Cancelled */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                <XCircle className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase font-bold">CANCELLED</span>
              </div>
              <span className="text-base font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">
                {cancelled} Matches
              </span>
              <span className="text-[10px] text-rose-500/80 block">Earned: ₹0</span>
            </div>

            {/* Extra Matches */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase font-bold">EXTRA MATCHES</span>
              </div>
              <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
                +{extra} Matches
              </span>
              <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 block">₹{extra * 3} Earned</span>
            </div>
          </div>

          {/* Cancelled Reasons Breakdown if any */}
          {cancelledWithReasons.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500 block">
                CANCELLED MATCH DETAILS ({cancelledWithReasons.length})
              </span>
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {cancelledWithReasons.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50"
                  >
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      #{m.matchNumber} ({m.time})
                    </span>
                    <span className="text-[11px] font-medium text-rose-500">
                      {m.cancelReason ? m.cancelReason : 'No reason specified'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Notes if any */}
          {notes && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>Day Notes</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                "{notes}"
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleCopySummary}
            className="py-2.5 px-3 rounded-2xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-3 rounded-2xl text-xs font-bold text-white shadow-xs hover:opacity-95 transition-all"
            style={{ backgroundColor: 'var(--primary-accent, #14b8a6)' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
