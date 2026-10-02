import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  IndianRupee,
  TrendingUp,
  Calendar,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Clock,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Award,
  Layers,
  BarChart2,
  CalendarDays,
} from 'lucide-react';
import { getISTDate, getISTDateString, formatDateDisplay } from '../utils/ist';
import {
  getAllWeeklyPeriods,
  calculateLifetimeEarnings,
  WeeklyPaymentRecord,
} from '../utils/weeklyEarnings';
import { WeeklyPaymentDetailModal } from '../components/WeeklyPaymentDetailModal';

interface EarningsViewProps {
  onOpenExtraModal: () => void;
}

export const EarningsView: React.FC<EarningsViewProps> = ({ onOpenExtraModal }) => {
  const {
    currentDailyData,
    allDailyData,
    selectedDate,
    settings,
    weeklyPaymentStatuses,
    toggleWeeklyPaymentStatus,
  } = useApp();

  const [graphView, setGraphView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedWeeklyRecord, setSelectedWeeklyRecord] = useState<WeeklyPaymentRecord | null>(null);
  const [weeklyModalOpen, setWeeklyModalOpen] = useState(false);

  const rate = settings.hosting.earningRate || 3;

  // 1. Today Stats
  const todayCompleted = currentDailyData.completedCount || 0;
  const todayCancelled = currentDailyData.cancelledCount || 0;
  const todayExtra = currentDailyData.extraMatches || 0;
  const todayRegularEarnings = currentDailyData.regularEarnings || 0;
  const todayExtraEarnings = currentDailyData.extraEarnings || 0;
  const todayTotalEarnings = currentDailyData.totalEarnings || 0;

  // 2. Centralized Single Source of Truth for Weekly Payments (Monday-Sunday IST)
  const { currentWeek, previousWeeks, allWeeks } = useMemo(() => {
    return getAllWeeklyPeriods(allDailyData, weeklyPaymentStatuses, rate);
  }, [allDailyData, weeklyPaymentStatuses, rate]);

  // 3. Monthly Summary Aggregation
  const {
    monthlyTotal,
    monthlyRegular,
    monthlyExtra,
    monthlyCompleted,
    monthlyCancelled,
    monthlyExtraMatches,
    hostingDays,
    monthName,
  } = useMemo(() => {
    const [year, month] = selectedDate.split('-');
    const prefix = `${year}-${month}`;

    let mTotal = 0;
    let mRegular = 0;
    let mExtra = 0;
    let mCompleted = 0;
    let mCancelled = 0;
    let mExtraCount = 0;
    let daysCount = 0;

    Object.entries(allDailyData).forEach(([dateStr, day]) => {
      if (dateStr.startsWith(prefix)) {
        if (day.completedCount > 0 || day.extraMatches > 0 || day.cancelledCount > 0) {
          daysCount++;
        }
        mTotal += day.totalEarnings || 0;
        mRegular += day.regularEarnings || 0;
        mExtra += day.extraEarnings || 0;
        mCompleted += day.completedCount || 0;
        mCancelled += day.cancelledCount || 0;
        mExtraCount += day.extraMatches || 0;
      }
    });

    const [yNum, mNum] = [Number(year), Number(month)];
    const monthObj = new Date(Date.UTC(yNum, mNum - 1, 15, 12, 0, 0));
    const mName = monthObj.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', month: 'long', year: 'numeric' });

    return {
      monthlyTotal: mTotal,
      monthlyRegular: mRegular,
      monthlyExtra: mExtra,
      monthlyCompleted: mCompleted,
      monthlyCancelled: mCancelled,
      monthlyExtraMatches: mExtraCount,
      hostingDays: daysCount,
      monthName: mName,
    };
  }, [allDailyData, selectedDate]);

  // 4. Lifetime Summary
  const {
    lifetimeEarnings,
    lifetimeRegular,
    lifetimeExtra,
    lifetimeCompleted,
    lifetimeCancelled,
    lifetimeExtraMatches,
    totalHostingDays,
  } = useMemo(() => {
    return calculateLifetimeEarnings(allDailyData);
  }, [allDailyData]);

  // 5. Chart Data (Supports Daily 7-day, Weekly 4-week, and Monthly)
  const chartData = useMemo(() => {
    if (graphView === 'weekly') {
      // 4 most recent weeks
      return allWeeks.slice(0, 5).reverse().map((w) => ({
        label: w.formattedRange,
        earnings: w.totalEarnings,
        subLabel: `${w.completedMatches} done`,
        id: w.weekId,
      }));
    }

    // Default: past 7 days
    const list: { label: string; earnings: number; subLabel: string; id: string }[] = [];
    const baseDate = getISTDate();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const dateStr = getISTDateString(d);
      const dayData = allDailyData[dateStr];
      const dayLabel = d.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', weekday: 'short' });

      list.push({
        label: dayLabel,
        earnings: dayData?.totalEarnings || 0,
        subLabel: dateStr.slice(5),
        id: dateStr,
      });
    }
    return list;
  }, [graphView, allWeeks, allDailyData]);

  const maxChartEarning = Math.max(1, ...chartData.map((d) => d.earnings));

  const handleOpenWeekDetail = (weekRecord: WeeklyPaymentRecord) => {
    setSelectedWeeklyRecord(weekRecord);
    setWeeklyModalOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-24">
      {/* 1. TODAY'S TOTAL EARNINGS */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                1. TODAY'S EARNINGS
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                ({formatDateDisplay(selectedDate)})
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
                ₹{todayTotalEarnings}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {todayCompleted + todayExtra} Matches Paid
              </span>
            </div>
          </div>

          <button
            onClick={onOpenExtraModal}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl text-xs font-bold text-white shadow-xs flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: 'var(--primary-accent, #14b8a6)' }}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Manage Extra Matches ({todayExtra})</span>
          </button>
        </div>

        {/* 3 Metric Cards for Today */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block">Regular Earnings</span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              ₹{todayRegularEarnings}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {todayCompleted} matches × ₹{rate}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block">Extra Earnings</span>
            <span className="text-lg sm:text-xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
              ₹{todayExtraEarnings}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {todayExtra} extra × ₹{rate}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-slate-400 block">Today's Match Status</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {todayCompleted} Done
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs font-bold text-rose-500 flex items-center gap-0.5">
                <XCircle className="w-3.5 h-3.5" />
                {todayCancelled} Canc
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Total {todayCompleted + todayCancelled + todayExtra} processed
            </span>
          </div>
        </div>
      </div>

      {/* 2. THIS WEEK'S PAYMENT SUMMARY CARD (Current Active Mon-Sun Week) */}
      <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-sky-500/10 border border-teal-500/30 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full text-white bg-teal-600 dark:bg-teal-500 shadow-xs">
                THIS WEEK'S PAYMENT
              </span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  currentWeek.status === 'Paid'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-amber-500 text-white'
                }`}
              >
                Payment: {currentWeek.status}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
                ₹{currentWeek.payment}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                (Regular: ₹{currentWeek.regularEarnings} + Extra: ₹{currentWeek.extraEarnings})
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-teal-500" />
              <span>{currentWeek.fullRangeLabel}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleWeeklyPaymentStatus(currentWeek.weekId)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs active:scale-95 ${
                currentWeek.status === 'Paid'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
              }`}
              title="Click to toggle payment status"
            >
              {currentWeek.status === 'Paid' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              ) : (
                <Clock className="w-4 h-4 text-amber-600" />
              )}
              <span>{currentWeek.status === 'Paid' ? 'Paid' : 'Pending'}</span>
            </button>

            <button
              onClick={() => handleOpenWeekDetail(currentWeek)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 bg-white dark:bg-slate-800 border border-teal-500/30 hover:bg-teal-500/10 transition-colors flex items-center gap-1 shadow-xs"
            >
              <span>Breakdown</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Current Week Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-teal-500/20 text-xs">
          <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">COMPLETED</span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {currentWeek.completedMatches} Matches
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">CANCELLED</span>
            <span className="text-sm font-extrabold text-rose-500 tabular-nums">
              {currentWeek.cancelledMatches} (₹0)
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">EXTRA MATCHES</span>
            <span className="text-sm font-extrabold text-amber-500 tabular-nums">
              +{currentWeek.extraMatches} (+₹{currentWeek.extraEarnings})
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">TOTAL PAYMENT</span>
            <span className="text-sm font-extrabold text-teal-600 dark:text-teal-400 tabular-nums">
              ₹{currentWeek.payment}
            </span>
          </div>
        </div>
      </div>

      {/* 3. DEDICATED SECTION: WEEKLY PAYMENTS (Current Week + Previous Weeks) */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <CalendarDays className="w-4 h-4 text-teal-500" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                WEEKLY PAYMENTS
              </h3>
              <p className="text-[11px] text-slate-400">
                Independent Monday 00:00 → Sunday 23:59:59 (IST) payment cycles
              </p>
            </div>
          </div>
        </div>

        {/* Current Active Week Card */}
        <div className="space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block px-1">
            Current Week
          </span>

          <div
            onClick={() => handleOpenWeekDetail(currentWeek)}
            className="p-4 rounded-2xl bg-gradient-to-r from-teal-500/5 to-emerald-500/5 border-2 border-teal-500/40 hover:border-teal-500 transition-all cursor-pointer shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    Week: {currentWeek.formattedRange}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {currentWeek.fullRangeLabel}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment</span>
                <span className="text-xl sm:text-2xl font-extrabold font-mono text-teal-600 dark:text-teal-400 tabular-nums">
                  ₹{currentWeek.payment}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Regular</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">
                  ₹{currentWeek.regularEarnings}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Extra</span>
                <span className="font-extrabold text-amber-500">
                  ₹{currentWeek.extraEarnings} ({currentWeek.extraMatches})
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Completed / Canc</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {currentWeek.completedMatches} / {currentWeek.cancelledMatches}
                </span>
              </div>
              <div className="text-right flex items-center justify-end">
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWeeklyPaymentStatus(currentWeek.weekId);
                  }}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg cursor-pointer ${
                    currentWeek.status === 'Paid'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {currentWeek.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Previous Completed Weeks List */}
        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block px-1">
            Previous Weeks
          </span>

          <div className="space-y-2">
            {previousWeeks.map((week) => {
              const isPaid = week.status === 'Paid';
              return (
                <div
                  key={week.weekId}
                  onClick={() => handleOpenWeekDetail(week)}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          Week: {week.formattedRange}
                        </span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWeeklyPaymentStatus(week.weekId);
                          }}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                            isPaid
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25'
                          }`}
                          title="Click to toggle status"
                        >
                          {week.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {week.startDate} → {week.endDate}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base sm:text-lg font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                        Payment: ₹{week.payment}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-700/50 text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>Regular: ₹{week.regularEarnings}</span>
                      <span>·</span>
                      <span>Extra: ₹{week.extraEarnings} ({week.extraMatches})</span>
                      <span>·</span>
                      <span>Completed: {week.completedMatches}</span>
                    </div>

                    <div className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-bold text-[11px]">
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. EARNINGS TREND GRAPH */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                EARNINGS TREND GRAPH
              </h3>
              <p className="text-[11px] text-slate-400">
                {graphView === 'weekly' ? 'Weekly Payments Comparison' : 'Daily Earnings Flow'}
              </p>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {(['daily', 'weekly'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setGraphView(view)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg capitalize transition-colors ${
                  graphView === view
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        {/* Clean Pastel Bar Chart */}
        <div className="pt-4 pb-2">
          <div className="flex items-end justify-between gap-2 h-44 px-2">
            {chartData.map((d) => {
              const heightPercent = maxChartEarning > 0 ? Math.round((d.earnings / maxChartEarning) * 100) : 0;
              const isTodayOrCurrent = d.id === getISTDateString() || d.id === currentWeek.weekId;

              return (
                <div key={d.id} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold font-mono text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ₹{d.earnings}
                  </span>

                  <div className="w-full max-w-[40px] bg-slate-100 dark:bg-slate-800/80 rounded-t-xl overflow-hidden flex flex-col justify-end h-full">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        isTodayOrCurrent ? 'opacity-100' : 'opacity-70 group-hover:opacity-90'
                      }`}
                      style={{
                        height: `${Math.max(6, heightPercent)}%`,
                        backgroundColor: 'var(--primary-accent, #14b8a6)',
                      }}
                    />
                  </div>

                  <div className="text-center">
                    <span
                      className={`text-[10px] font-bold block truncate max-w-[55px] ${
                        isTodayOrCurrent ? 'text-teal-600 dark:text-teal-400 font-extrabold' : 'text-slate-400'
                      }`}
                    >
                      {d.label}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono tabular-nums block">
                      ₹{d.earnings}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. MONTHLY SUMMARY */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              MONTHLY SUMMARY ({monthName})
            </h3>
            <p className="text-[11px] text-slate-400">Total earnings & hosting overview for this month</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] font-semibold text-slate-400 block">Total Earnings</span>
            <span className="text-base sm:text-lg font-extrabold text-teal-600 dark:text-teal-400 tabular-nums">
              ₹{monthlyTotal}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] font-semibold text-slate-400 block">Completed Matches</span>
            <span className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-200 tabular-nums">
              {monthlyCompleted}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] font-semibold text-slate-400 block">Cancelled Matches</span>
            <span className="text-base sm:text-lg font-extrabold text-rose-500 tabular-nums">
              {monthlyCancelled}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] font-semibold text-slate-400 block">Hosting Days</span>
            <span className="text-base sm:text-lg font-extrabold text-amber-500 tabular-nums">
              {hostingDays} Days
            </span>
          </div>
        </div>
      </div>

      {/* 6. LIFETIME / ALL-TIME EARNINGS */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              LIFETIME EARNINGS & RECORDS
            </h3>
            <p className="text-[11px] text-slate-400">All-time earnings accumulated across your hosting history</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block">
              LIFETIME EARNED
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
              ₹{lifetimeEarnings}
            </span>
            <span className="text-[10px] text-emerald-600/80 block mt-0.5">
              Verified All-Time
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">REGULAR EARNED</span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              ₹{lifetimeRegular}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {lifetimeCompleted} matches
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-amber-500 uppercase font-bold block">EXTRA EARNED</span>
            <span className="text-lg sm:text-xl font-extrabold text-amber-500 tabular-nums">
              ₹{lifetimeExtra}
            </span>
            <span className="text-[10px] text-amber-600/80 block mt-0.5">
              +{lifetimeExtraMatches} matches
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">HOSTING DAYS</span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-200 tabular-nums">
              {totalHostingDays} Days
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {lifetimeCancelled} cancelled
            </span>
          </div>
        </div>
      </div>

      {/* Weekly Payment Detail Breakdown Modal */}
      <WeeklyPaymentDetailModal
        isOpen={weeklyModalOpen}
        onClose={() => setWeeklyModalOpen(false)}
        record={selectedWeeklyRecord}
        onToggleStatus={(weekId) => {
          toggleWeeklyPaymentStatus(weekId);
          if (selectedWeeklyRecord && selectedWeeklyRecord.weekId === weekId) {
            setSelectedWeeklyRecord({
              ...selectedWeeklyRecord,
              status: selectedWeeklyRecord.status === 'Paid' ? 'Pending' : 'Paid',
            });
          }
        }}
      />
    </div>
  );
};
