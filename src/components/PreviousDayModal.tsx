import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Calendar,
  CheckCircle2,
  XCircle,
  PlusCircle,
  IndianRupee,
  Percent,
  FileText,
  ArrowLeft,
  Copy,
  Check,
  CalendarDays,
} from 'lucide-react';
import { formatDateDisplay } from '../utils/ist';

interface PreviousDayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function getPreviousDateString(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() - 1);
    return dt.toISOString().split('T')[0];
  } catch {
    return dateStr;
  }
}

export const PreviousDayModal: React.FC<PreviousDayModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { allDailyData, selectedDate, setSelectedDate, setToastMessage } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const prevDate = getPreviousDateString(selectedDate);
  const prevDay = allDailyData[prevDate];

  const totalRegular = prevDay?.schedule?.totalRegularMatches || prevDay?.matches?.length || 49;
  const completed = prevDay?.completedCount || 0;
  const cancelled = prevDay?.cancelledCount || 0;
  const extra = prevDay?.extraMatches || 0;
  const totalEarnings = prevDay?.totalEarnings || 0;
  const completionRate = totalRegular > 0 ? Math.round((completed / totalRegular) * 100) : 0;
  const notes = prevDay?.notes || '';
  const cancelledMatches = prevDay?.matches?.filter((m) => m.isCancelled) || [];

  const handleJumpToPreviousDay = () => {
    setSelectedDate(prevDate);
    onClose();
    setToastMessage({ text: `Switched view to ${formatDateDisplay(prevDate)}` });
  };

  const handleCopy = async () => {
    const text = `📅 Previous Day Summary (${formatDateDisplay(prevDate)})
• Completed: ${completed}/${totalRegular} (${completionRate}%)
• Cancelled: ${cancelled}
• Extra Matches: ${extra}
• Total Earnings: ₹${totalEarnings}${notes ? `\n• Notes: ${notes}` : ''}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setToastMessage({ text: 'Previous day summary copied!' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setToastMessage({ text: 'Failed to copy summary.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <CalendarDays className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                QUICK VIEW
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Previous Day Summary
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date banner */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {formatDateDisplay(prevDate)}
            </span>
          </div>
          <span className="text-[11px] font-mono font-semibold text-slate-400">
            {prevDate}
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {/* Main Earnings & Completion Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-sky-500/10 border border-amber-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                TOTAL EARNINGS
              </span>
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
                ₹{totalEarnings}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
                Regular: ₹{prevDay?.regularEarnings || 0} + Extra: ₹{prevDay?.extraEarnings || 0}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                COMPLETION
              </span>
              <span className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 tabular-nums">
                {completionRate}%
              </span>
              <span className="text-[10px] text-slate-400 block">
                {completed}/{totalRegular} Done
              </span>
            </div>
          </div>

          {/* 4 Stat Boxes */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Completed */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                COMPLETED
              </span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {completed} Matches
              </span>
              <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 block">Earned: ₹{completed * 3}</span>
            </div>

            {/* Cancelled */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-rose-500 uppercase flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                CANCELLED
              </span>
              <span className="text-base font-extrabold text-rose-500 tabular-nums">
                {cancelled} Matches
              </span>
              <span className="text-[10px] text-rose-500/80 block">₹0</span>
            </div>

            {/* Extra Matches */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-1">
                <PlusCircle className="w-3.5 h-3.5" />
                EXTRA MATCHES
              </span>
              <span className="text-base font-extrabold text-amber-500 tabular-nums">
                +{extra} Matches
              </span>
              <span className="text-[10px] text-amber-600/80 block">Earned: ₹{extra * 3}</span>
            </div>

            {/* Total Regular */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">REGULAR TARGET</span>
              <span className="text-base font-extrabold text-slate-800 dark:text-slate-200 tabular-nums">
                {totalRegular} Matches
              </span>
              <span className="text-[10px] text-slate-400 block">15-min slots</span>
            </div>
          </div>

          {/* Cancelled Reasons Breakdown if any */}
          {cancelledMatches.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500 block">
                CANCELLED MATCH REASONS ({cancelledMatches.length})
              </span>
              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                {cancelledMatches.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50"
                  >
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      #{m.matchNumber} ({m.time})
                    </span>
                    <span className="text-[11px] font-semibold text-rose-500">
                      {m.cancelReason || 'No reason'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes for Previous Day */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              <span>Notes for {formatDateDisplay(prevDate)}</span>
            </div>
            {notes ? (
              <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                "{notes}"
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No personal notes recorded for this date.
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleCopy}
            className="py-2.5 px-3 rounded-2xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleJumpToPreviousDay}
            className="py-2.5 px-3 rounded-2xl text-xs font-bold text-white shadow-xs hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
            style={{ backgroundColor: 'var(--primary-accent, #14b8a6)' }}
          >
            <span>Jump to Date</span>
          </button>
        </div>
      </div>
    </div>
  );
};
