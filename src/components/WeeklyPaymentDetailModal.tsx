import React from 'react';
import { WeeklyPaymentRecord } from '../utils/weeklyEarnings';
import {
  X,
  Calendar,
  CheckCircle2,
  XCircle,
  PlusCircle,
  IndianRupee,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { formatDateDisplay } from '../utils/ist';

interface WeeklyPaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: WeeklyPaymentRecord | null;
  onToggleStatus: (weekId: string) => void;
}

export const WeeklyPaymentDetailModal: React.FC<WeeklyPaymentDetailModalProps> = ({
  isOpen,
  onClose,
  record,
  onToggleStatus,
}) => {
  if (!isOpen || !record) return null;

  const isPaid = record.status === 'Paid';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  {record.isCurrentWeek ? 'CURRENT EARNING WEEK' : 'WEEKLY PAYMENT'}
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isPaid
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {record.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Week: {record.formattedRange}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
          {/* Main Payment Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-sky-500/10 border border-teal-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                TOTAL WEEKLY PAYMENT
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
                  ₹{record.payment}
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  ({record.completedMatches + record.extraMatches} Paid Matches)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {record.fullRangeLabel}
              </p>
            </div>

            {/* Toggle Status Button */}
            <button
              onClick={() => onToggleStatus(record.weekId)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 active:scale-95 ${
                isPaid
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-amber-500 text-white hover:bg-amber-600'
              }`}
            >
              {isPaid ? <ShieldCheck className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              <span>{isPaid ? 'Mark as Pending' : 'Mark as Paid'}</span>
            </button>
          </div>

          {/* 4 Quick Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">REGULAR EARNINGS</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                ₹{record.regularEarnings}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {record.completedMatches} matches
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-amber-500 block text-[10px] uppercase font-bold">EXTRA EARNINGS</span>
              <span className="text-base font-extrabold text-amber-500 tabular-nums">
                ₹{record.extraEarnings}
              </span>
              <span className="text-[10px] text-amber-600/80 block">
                +{record.extraMatches} matches
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-emerald-500 block text-[10px] uppercase font-bold">COMPLETED</span>
              <span className="text-base font-extrabold text-emerald-500 tabular-nums">
                {record.completedMatches}
              </span>
              <span className="text-[10px] text-slate-400 block">Regular</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-rose-500 block text-[10px] uppercase font-bold">CANCELLED</span>
              <span className="text-base font-extrabold text-rose-500 tabular-nums">
                {record.cancelledMatches}
              </span>
              <span className="text-[10px] text-rose-500/80 block">₹0 earned</span>
            </div>
          </div>

          {/* Daily Earnings Breakdown (Monday -> Sunday) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                DAILY EARNINGS BREAKDOWN (MON → SUN)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Asia/Kolkata (IST)</span>
            </div>

            <div className="space-y-1.5">
              {record.dailyBreakdown.map((day) => (
                <div
                  key={day.date}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-24 font-bold text-slate-800 dark:text-slate-200">
                      {day.dayName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {day.formattedDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-[11px] text-slate-400 hidden sm:block">
                      <span>{day.completed} comp</span>
                      {day.extra > 0 && <span className="text-amber-500"> · +{day.extra} extra</span>}
                      {day.cancelled > 0 && <span className="text-rose-500"> · {day.cancelled} canc</span>}
                    </div>

                    <span className="font-mono font-extrabold text-slate-900 dark:text-white tabular-nums text-sm">
                      ₹{day.totalEarnings}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 text-[11px] text-slate-500 dark:text-slate-400">
            ℹ️ <strong>Earning Rule:</strong> Every week strictly starts Monday 00:00 IST and ends Sunday 23:59:59 IST. Matches and extra matches belong permanently to their actual match date.
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
