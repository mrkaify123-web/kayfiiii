import { DailyData } from '../types';
import { getISTDate, getISTDateString } from './ist';

export type WeeklyPaymentStatus = 'Pending' | 'Paid';

export interface WeeklyDayBreakdown {
  dayName: string; // 'Monday', 'Tuesday', ...
  date: string; // 'YYYY-MM-DD'
  formattedDate: string; // '28 Sep'
  regularEarnings: number;
  extraEarnings: number;
  totalEarnings: number;
  completed: number;
  cancelled: number;
  extra: number;
  hasData: boolean;
}

export interface WeeklyPaymentRecord {
  weekId: string; // '2026-09-28_2026-10-04'
  startDate: string; // '2026-09-28' (Monday)
  endDate: string; // '2026-10-04' (Sunday)
  formattedRange: string; // '28 Sep - 4 Oct'
  fullRangeLabel: string; // 'Monday, 28 Sep → Sunday, 4 Oct'
  regularMatches: number;
  extraMatches: number;
  completedMatches: number;
  cancelledMatches: number;
  totalMatches: number;
  regularEarnings: number;
  extraEarnings: number;
  totalEarnings: number;
  payment: number;
  status: WeeklyPaymentStatus;
  isCurrentWeek: boolean;
  dailyBreakdown: WeeklyDayBreakdown[];
}

/**
 * Returns the exact Monday-to-Sunday week range for any given YYYY-MM-DD date in IST.
 * Week starts Monday 00:00:00 IST and ends Sunday 23:59:59 IST.
 */
export function getWeekRangeForDate(dateStr: string): {
  weekId: string;
  startDate: string; // YYYY-MM-DD (Monday)
  endDate: string; // YYYY-MM-DD (Sunday)
  formattedRange: string; // e.g. "28 Sep - 4 Oct"
  fullRangeLabel: string; // e.g. "Monday, 28 Sep → Sunday, 4 Oct"
  days: { dayName: string; date: string }[];
} {
  const [y, m, d] = dateStr.split('-').map(Number);
  // Noon UTC prevents any day shifting
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));

  // In JS getUTCDay(): 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  const dayOfWeek = dt.getUTCDay();
  // Monday is index 0: days since Monday
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(Date.UTC(y, m - 1, d - daysSinceMonday, 12, 0, 0));
  const sunday = new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() + 6, 12, 0, 0));

  const startYear = monday.getUTCFullYear();
  const startMonth = String(monday.getUTCMonth() + 1).padStart(2, '0');
  const startDay = String(monday.getUTCDate()).padStart(2, '0');
  const startDate = `${startYear}-${startMonth}-${startDay}`;

  const endYear = sunday.getUTCFullYear();
  const endMonth = String(sunday.getUTCMonth() + 1).padStart(2, '0');
  const endDay = String(sunday.getUTCDate()).padStart(2, '0');
  const endDate = `${endYear}-${endMonth}-${endDay}`;

  const weekId = `${startDate}_${endDate}`;

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const days: { dayName: string; date: string }[] = [];

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() + i, 12, 0, 0));
    const dy = dayDate.getUTCFullYear();
    const dm = String(dayDate.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(dayDate.getUTCDate()).padStart(2, '0');
    days.push({
      dayName: dayNames[i],
      date: `${dy}-${dm}-${dd}`,
    });
  }

  const startMonthName = monday.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', month: 'short' });
  const endMonthName = sunday.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', month: 'short' });

  const formattedRange =
    startMonthName === endMonthName
      ? `${monday.getUTCDate()} - ${sunday.getUTCDate()} ${startMonthName}`
      : `${monday.getUTCDate()} ${startMonthName} - ${sunday.getUTCDate()} ${endMonthName}`;

  const fullRangeLabel = `Monday, ${monday.getUTCDate()} ${startMonthName} → Sunday, ${sunday.getUTCDate()} ${endMonthName}`;

  return {
    weekId,
    startDate,
    endDate,
    formattedRange,
    fullRangeLabel,
    days,
  };
}

/**
 * Single source of truth calculation for a Monday-to-Sunday week's earnings.
 */
export function calculateWeeklyEarnings(
  startDate: string,
  endDate: string,
  allDailyData: Record<string, DailyData>,
  savedStatuses: Record<string, WeeklyPaymentStatus> = {},
  earningRate = 3
): WeeklyPaymentRecord {
  const rangeInfo = getWeekRangeForDate(startDate);
  const currentTodayStr = getISTDateString();
  const isCurrentWeek = currentTodayStr >= startDate && currentTodayStr <= endDate;

  let totalRegularEarnings = 0;
  let totalExtraEarnings = 0;
  let totalCompleted = 0;
  let totalCancelled = 0;
  let totalExtra = 0;
  let totalRegularScheduled = 0;

  const dailyBreakdown: WeeklyDayBreakdown[] = rangeInfo.days.map(({ dayName, date }) => {
    const dayData = allDailyData[date];

    const completed = dayData?.completedCount || 0;
    const cancelled = dayData?.cancelledCount || 0;
    const extra = dayData?.extraMatches || 0;

    // Use stored earnings from match data to protect historical rate changes
    const regularEarn =
      dayData?.regularEarnings !== undefined
        ? dayData.regularEarnings
        : dayData?.matches
        ? dayData.matches.filter((m) => m.isCompleted).reduce((s, m) => s + (m.earning || 0), 0)
        : completed * earningRate;

    const extraEarn =
      dayData?.extraEarnings !== undefined ? dayData.extraEarnings : extra * earningRate;

    const totalDayEarn = regularEarn + extraEarn;

    totalRegularEarnings += regularEarn;
    totalExtraEarnings += extraEarn;
    totalCompleted += completed;
    totalCancelled += cancelled;
    totalExtra += extra;
    totalRegularScheduled += dayData?.schedule?.totalRegularMatches || (dayData?.matches ? dayData.matches.length : 49);

    const [dy, dm, dd] = date.split('-').map(Number);
    const dObj = new Date(Date.UTC(dy, dm - 1, dd, 12, 0, 0));
    const mName = dObj.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', month: 'short' });
    const formattedDate = `${dd} ${mName}`;

    return {
      dayName,
      date,
      formattedDate,
      regularEarnings: regularEarn,
      extraEarnings: extraEarn,
      totalEarnings: totalDayEarn,
      completed,
      cancelled,
      extra,
      hasData: !!(dayData && (completed > 0 || cancelled > 0 || extra > 0)),
    };
  });

  const totalEarnings = totalRegularEarnings + totalExtraEarnings;
  const status: WeeklyPaymentStatus = savedStatuses[rangeInfo.weekId] || 'Pending';

  return {
    weekId: rangeInfo.weekId,
    startDate,
    endDate,
    formattedRange: rangeInfo.formattedRange,
    fullRangeLabel: rangeInfo.fullRangeLabel,
    regularMatches: totalRegularScheduled,
    extraMatches: totalExtra,
    completedMatches: totalCompleted,
    cancelledMatches: totalCancelled,
    totalMatches: totalCompleted + totalCancelled + totalExtra,
    regularEarnings: totalRegularEarnings,
    extraEarnings: totalExtraEarnings,
    totalEarnings,
    payment: totalEarnings,
    status,
    isCurrentWeek,
    dailyBreakdown,
  };
}

/**
 * Generates all relevant weekly periods (current week + all weeks with data + at least previous 4 weeks).
 * Sorted strictly descending (most recent first).
 */
export function getAllWeeklyPeriods(
  allDailyData: Record<string, DailyData>,
  savedStatuses: Record<string, WeeklyPaymentStatus> = {},
  earningRate = 3
): {
  currentWeek: WeeklyPaymentRecord;
  previousWeeks: WeeklyPaymentRecord[];
  allWeeks: WeeklyPaymentRecord[];
} {
  const todayStr = getISTDateString();
  const currentWeekRange = getWeekRangeForDate(todayStr);

  const weekSet = new Set<string>();
  weekSet.add(currentWeekRange.startDate);

  // Add all week start dates that have data
  Object.keys(allDailyData).forEach((dateStr) => {
    const range = getWeekRangeForDate(dateStr);
    weekSet.add(range.startDate);
  });

  // Ensure at least past 4 weeks exist for complete history
  const [currY, currM, currD] = currentWeekRange.startDate.split('-').map(Number);
  const currMon = new Date(Date.UTC(currY, currM - 1, currD, 12, 0, 0));

  for (let w = 1; w <= 4; w++) {
    const prevMon = new Date(Date.UTC(currMon.getUTCFullYear(), currMon.getUTCMonth(), currMon.getUTCDate() - w * 7, 12, 0, 0));
    const py = prevMon.getUTCFullYear();
    const pm = String(prevMon.getUTCMonth() + 1).padStart(2, '0');
    const pd = String(prevMon.getUTCDate()).padStart(2, '0');
    weekSet.add(`${py}-${pm}-${pd}`);
  }

  // Sort descending
  const sortedStartDates = Array.from(weekSet).sort().reverse();

  const allWeeks: WeeklyPaymentRecord[] = sortedStartDates.map((startDate) => {
    const range = getWeekRangeForDate(startDate);
    return calculateWeeklyEarnings(range.startDate, range.endDate, allDailyData, savedStatuses, earningRate);
  });

  const currentWeek =
    allWeeks.find((w) => w.startDate === currentWeekRange.startDate) ||
    calculateWeeklyEarnings(currentWeekRange.startDate, currentWeekRange.endDate, allDailyData, savedStatuses, earningRate);

  const previousWeeks = allWeeks.filter((w) => w.startDate !== currentWeekRange.startDate);

  return {
    currentWeek,
    previousWeeks,
    allWeeks,
  };
}

/**
 * Lifetime summary across all stored daily data
 */
export function calculateLifetimeEarnings(
  allDailyData: Record<string, DailyData>
): {
  lifetimeEarnings: number;
  lifetimeRegular: number;
  lifetimeExtra: number;
  lifetimeCompleted: number;
  lifetimeCancelled: number;
  lifetimeExtraMatches: number;
  totalHostingDays: number;
} {
  let lifetimeEarnings = 0;
  let lifetimeRegular = 0;
  let lifetimeExtra = 0;
  let lifetimeCompleted = 0;
  let lifetimeCancelled = 0;
  let lifetimeExtraMatches = 0;
  let totalHostingDays = 0;

  Object.values(allDailyData).forEach((day) => {
    if (day.completedCount > 0 || day.extraMatches > 0 || day.cancelledCount > 0) {
      totalHostingDays++;
    }
    lifetimeEarnings += day.totalEarnings || 0;
    lifetimeRegular += day.regularEarnings || 0;
    lifetimeExtra += day.extraEarnings || 0;
    lifetimeCompleted += day.completedCount || 0;
    lifetimeCancelled += day.cancelledCount || 0;
    lifetimeExtraMatches += day.extraMatches || 0;
  });

  return {
    lifetimeEarnings,
    lifetimeRegular,
    lifetimeExtra,
    lifetimeCompleted,
    lifetimeCancelled,
    lifetimeExtraMatches,
    totalHostingDays,
  };
}
