import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Edit3, Check, X, FileText, IndianRupee, Layers, ArrowLeft, Clock } from 'lucide-react';
import { formatDateDisplay, getISTDate, getISTDateString } from '../utils/ist';
import { PreviousDayModal } from '../components/PreviousDayModal';
import { getWeekRangeForDate, calculateWeeklyEarnings, WeeklyPaymentRecord } from '../utils/weeklyEarnings';

export const CalendarView: React.FC = () => {
  const { allDailyData, selectedDate, setSelectedDate, setDailyNotes, idpLogs } = useApp();

  const [prevDayModalOpen, setPrevDayModalOpen] = useState(false);

  // Current view month & year state
  const initialDateParts = selectedDate.split('-').map(Number);
  const [viewYear, setViewYear] = useState<number>(initialDateParts[0] || 2026);
  const [viewMonth, setViewMonth] = useState<number>(initialDateParts[1] || 9); // 1-indexed

  // Date detail modal state
  const [activeDateModal, setActiveDateModal] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesInput, setNotesInput] = useState('');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Build grid of days (Monday-to-Sunday cycle in IST)
  const calendarGrid = useMemo(() => {
    // First day of month (0 = Sun, 1 = Mon, ...)
    const rawFirstDay = new Date(Date.UTC(viewYear, viewMonth - 1, 1)).getUTCDay();
    // Monday is index 0: days since Monday (0 = Sun -> 6)
    const firstDay = rawFirstDay === 0 ? 6 : rawFirstDay - 1;
    const daysInMonth = new Date(Date.UTC(viewYear, viewMonth, 0)).getUTCDate();

    const cells: { day: number | null; dateStr: string; earnings: number; hasData: boolean }[] = [];

    // Empty cells before first Monday
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, dateStr: '', earnings: 0, hasData: false });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayData = allDailyData[dateStr];
      const earnings = dayData?.totalEarnings || 0;
      const hasData = !!(dayData && (dayData.completedCount > 0 || dayData.extraMatches > 0 || dayData.cancelledCount > 0));

      cells.push({
        day: d,
        dateStr,
        earnings,
        hasData,
      });
    }

    return cells;
  }, [viewYear, viewMonth, allDailyData]);

  // Weekly calculations for weeks in this month (Single source of truth)
  const monthlyWeeks = useMemo(() => {
    const daysInMonth = new Date(Date.UTC(viewYear, viewMonth, 0)).getUTCDate();
    const seenWeeks = new Set<string>();
    const list: WeeklyPaymentRecord[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const range = getWeekRangeForDate(dateStr);
      if (!seenWeeks.has(range.weekId)) {
        seenWeeks.add(range.weekId);
        list.push(calculateWeeklyEarnings(range.startDate, range.endDate, allDailyData));
      }
    }
    return list;
  }, [viewYear, viewMonth, allDailyData]);

  const activeDateWeek = useMemo(() => {
    if (!activeDateModal) return null;
    const range = getWeekRangeForDate(activeDateModal);
    return calculateWeeklyEarnings(range.startDate, range.endDate, allDailyData);
  }, [activeDateModal, allDailyData]);

  const dayIdpLogs = useMemo(() => {
    if (!activeDateModal) return [];
    return (idpLogs || []).filter((l) => l.date === activeDateModal);
  }, [activeDateModal, idpLogs]);

  // Click on date
  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    const dayData = allDailyData[dateStr];
    setNotesInput(dayData?.notes || '');
    setEditingNotes(false);
    setActiveDateModal(dateStr);
  };

  const handleSaveNotes = () => {
    if (activeDateModal) {
      setDailyNotes(activeDateModal, notesInput);
      setEditingNotes(false);
    }
  };

  const activeDayData = activeDateModal ? allDailyData[activeDateModal] : null;

  return (
    <div className="space-y-4 sm:space-y-5 pb-24">
      {/* Calendar Header with Month Navigation */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {monthNames[viewMonth - 1]} {viewYear}
              </h2>
              <p className="text-[11px] text-slate-400">Pastel Earnings Calendar</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPrevDayModalOpen(true)}
              title="Quick view yesterday's summary"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Previous Day</span>
            </button>
            <button
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              title="Next Month"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days of Week Header: strictly Monday to Sunday (IST) */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dw) => (
            <span key={dw} className="text-[11px] font-bold text-slate-400 uppercase tracking-wider py-1">
              {dw}
            </span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {calendarGrid.map((cell, idx) => {
            if (!cell.day) {
              return <div key={`empty_${idx}`} className="h-14 sm:h-20 rounded-2xl bg-transparent" />;
            }

            const isToday = cell.dateStr === getISTDateString();
            const isSelected = cell.dateStr === selectedDate;

            return (
              <button
                key={cell.dateStr}
                onClick={() => handleDateClick(cell.dateStr)}
                className={`relative h-14 sm:h-20 rounded-2xl p-1.5 sm:p-2 flex flex-col justify-between text-left transition-all group active:scale-95 ${
                  isSelected
                    ? 'ring-2 ring-teal-500 bg-teal-500/10 dark:bg-teal-500/15'
                    : cell.hasData
                    ? 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
                    : 'bg-white/40 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                {/* Day number */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs sm:text-sm font-bold tabular-nums ${
                      isToday
                        ? 'w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-extrabold text-[10px] sm:text-xs'
                        : isSelected
                        ? 'text-teal-600 dark:text-teal-400 font-extrabold'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {cell.day}
                  </span>

                  {allDailyData[cell.dateStr]?.notes && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Has notes" />
                  )}
                </div>

                {/* Earnings Pastel Pill */}
                {cell.hasData ? (
                  <span className="text-[10px] sm:text-xs font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                    ₹{cell.earnings}
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-300 dark:text-slate-700 font-mono">
                    —
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Weekly Payments in this Month (Exact single source of truth) */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              WEEKLY TOTALS (MON → SUN IST)
            </span>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">
              {monthlyWeeks.length} Weeks
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {monthlyWeeks.map((w) => (
              <div
                key={w.weekId}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Week: {w.formattedRange}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {w.completedMatches} completed · {w.extraMatches} extra
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-extrabold text-sm text-teal-600 dark:text-teal-400 block">
                    ₹{w.totalEarnings}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    Payment
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Date Breakdown Details Modal */}
      {activeDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  DATE DETAILS
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {formatDateDisplay(activeDateModal)}
                </h3>
              </div>
              <button
                onClick={() => setActiveDateModal(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Earning Banner */}
            <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-center">
              <span className="text-xs text-teal-700 dark:text-teal-300 font-semibold block">
                Total Day Earnings
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400 tabular-nums">
                ₹{activeDayData?.totalEarnings || 0}
              </span>
            </div>

            {/* Belonging Monday-Sunday Week Payment */}
            {activeDateWeek && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    WEEKLY PAYMENT ({activeDateWeek.formattedRange})
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Mon 00:00 → Sun 23:59 IST Week
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold font-mono text-teal-600 dark:text-teal-400 tabular-nums block">
                    ₹{activeDateWeek.payment}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {activeDateWeek.status}
                  </span>
                </div>
              </div>
            )}

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">Regular Matches</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  {activeDayData?.completedCount || 0} / {activeDayData?.schedule?.totalRegularMatches || 49}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  Earned: ₹{activeDayData?.regularEarnings || 0}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">Extra Matches</span>
                <span className="text-sm font-bold text-amber-500 tabular-nums">
                  +{activeDayData?.extraMatches || 0}
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 block mt-0.5">
                  Earned: ₹{activeDayData?.extraEarnings || 0}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">Completed Matches</span>
                <span className="text-sm font-bold text-emerald-500 tabular-nums">
                  {activeDayData?.completedCount || 0}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">Cancelled Matches</span>
                <span className="text-sm font-bold text-rose-500 tabular-nums">
                  {activeDayData?.cancelledCount || 0}
                </span>
              </div>
            </div>

            {/* Cancelled matches with reasons if any */}
            {activeDayData?.matches?.some((m) => m.isCancelled) && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500 block">
                  Cancelled Matches & Reasons
                </span>
                <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                  {activeDayData.matches
                    .filter((m) => m.isCancelled)
                    .map((m) => (
                      <div key={m.id} className="flex items-center justify-between text-xs py-0.5">
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                          #{m.matchNumber} ({m.time}):
                        </span>
                        <span className="font-semibold text-rose-500 text-[11px]">
                          {m.cancelReason || 'No reason specified'}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* IDP Timings Logged for this Date */}
            {dayIdpLogs.length > 0 && (
              <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/25 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    IDP Timings Logged ({dayIdpLogs.length})
                  </span>
                </div>
                <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                  {dayIdpLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between text-xs py-0.5">
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        #{log.matchNumber} ({log.scheduledMatchTime}):
                      </span>
                      <span
                        className={`font-mono font-semibold text-[11px] ${
                          log.diffType === 'early'
                            ? 'text-emerald-500'
                            : log.diffType === 'on_time'
                            ? 'text-sky-500'
                            : 'text-rose-500'
                        }`}
                      >
                        {log.idpClickTime} ({log.diffFormatted})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Notes (Section 24) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  <span>Daily Notes</span>
                </div>
                {!editingNotes ? (
                  <button
                    onClick={() => setEditingNotes(true)}
                    className="text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSaveNotes}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                )}
              </div>

              {editingNotes ? (
                <textarea
                  rows={3}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="e.g. Aaj 5 extra matches kiye sham ko..."
                  className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                />
              ) : (
                <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                  {activeDayData?.notes ? `"${activeDayData.notes}"` : 'No notes written for this date.'}
                </p>
              )}
            </div>

            {/* Close Button */}
            <div className="pt-2">
              <button
                onClick={() => setActiveDateModal(null)}
                className="w-full py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Previous Day Modal */}
      <PreviousDayModal
        isOpen={prevDayModalOpen}
        onClose={() => setPrevDayModalOpen(false)}
      />
    </div>
  );
};
