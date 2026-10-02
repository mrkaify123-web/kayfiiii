import { DailyScheduleConfig, Match, MatchStatus } from '../types';
import { calculateScheduleSlots, getISTCurrentMinutes, getISTDateString, parseTimeToMinutes } from './ist';

export const DEFAULT_IDP_BASE_URL = 'https://skillclash.site/admin2020/matches/edit/';
export const DEFAULT_WIN_BASE_URL = 'https://skillclash.site/admin2020/matches/member_join_match/';
export const SKILLCLASH_IDP_BASE_URL = DEFAULT_IDP_BASE_URL;
export const SKILLCLASH_WIN_BASE_URL = DEFAULT_WIN_BASE_URL;

/**
 * Normalizes a base URL and appends the match number cleanly.
 * Handles trailing slashes, leading slashes, and whitespace:
 * - "https://skillclash.site/admin2020/matches/edit" + "332212" -> "https://skillclash.site/admin2020/matches/edit/332212"
 * - "https://skillclash.site/admin2020/matches/edit/" + "332212" -> "https://skillclash.site/admin2020/matches/edit/332212"
 */
export function formatUrlWithMatchNumber(baseUrl: string, matchNumber: string): string {
  const cleanBase = (baseUrl || '').trim().replace(/\/+$/, '');
  const cleanMatch = (matchNumber || '').trim();
  if (!cleanBase) return cleanMatch;
  return `${cleanBase}/${cleanMatch}`;
}

/**
 * Returns the exact SkillClash IDP URL for a match.
 * Always appends THAT MATCH'S FULL MATCH NUMBER to the end of the URL.
 * NEVER appends the #count or internal database IDs.
 */
export function getIdpUrl(matchNumber: string, idpBaseUrl?: string): string {
  const base = idpBaseUrl && idpBaseUrl.trim() ? idpBaseUrl.trim() : DEFAULT_IDP_BASE_URL;
  if (!base.includes('/edit') && !base.includes('/edit/')) {
    const clean = base.replace(/\/+$/, '');
    return formatUrlWithMatchNumber(`${clean}/edit`, matchNumber);
  }
  return formatUrlWithMatchNumber(base, matchNumber);
}

/**
 * Returns the exact SkillClash WIN URL for a match.
 * Always appends THAT MATCH'S FULL MATCH NUMBER to the end of the URL.
 * NEVER appends the #count or internal database IDs.
 */
export function getWinUrl(matchNumber: string, winBaseUrl?: string): string {
  const base = winBaseUrl && winBaseUrl.trim() ? winBaseUrl.trim() : DEFAULT_WIN_BASE_URL;
  if (!base.includes('/member_join_match') && !base.includes('/member_join_match/')) {
    const clean = base.replace(/\/+$/, '');
    return formatUrlWithMatchNumber(`${clean}/member_join_match`, matchNumber);
  }
  return formatUrlWithMatchNumber(base, matchNumber);
}

/**
 * Formats the sequential count display for a match (e.g. "#1", "#2", or "CANCELLED")
 */
export function formatMatchSequentialDisplay(match: Match): string {
  if (match.isCancelled) return 'CANCELLED';
  if (match.sequentialCount != null) return `#${match.sequentialCount}`;
  return `#${match.slot + 1}`;
}

/**
 * Returns the required Copy string for a match:
 * Clicking Copy MUST copy BOTH Match Number AND Sequential Count (e.g. "332212#1", "336624#4").
 */
export function getMatchCopyString(match: Match): string {
  if (match.sequentialCount != null) {
    return `${match.matchNumber}#${match.sequentialCount}`;
  }
  if (match.isCancelled) {
    return match.matchNumber;
  }
  return `${match.matchNumber}#${match.slot + 1}`;
}

/**
 * Recalculates sequential hosting counts for all matches:
 * 1. Starts from startCount (default 1).
 * 2. CANCELLED matches DO NOT consume a sequential position (assigned null).
 * 3. Subsequent active matches seamlessly take the next sequential number.
 * 4. If an override exists, it updates the sequence point.
 *    If the overridden match is cancelled, the override carries to the next active match.
 */
export function recalculateSequentialCounts(matches: Match[], startCount: number = 1): Match[] {
  let currentCount = Math.max(1, startCount);
  let pendingOverride: number | null = null;

  return matches.map((m) => {
    if (m.sequentialOverride != null) {
      pendingOverride = m.sequentialOverride;
    }

    if (m.isCancelled) {
      return {
        ...m,
        sequentialCount: null,
      };
    }

    if (pendingOverride != null) {
      currentCount = pendingOverride;
      pendingOverride = null;
    }

    const assignedCount = currentCount;
    currentCount++;

    return {
      ...m,
      sequentialCount: assignedCount,
    };
  });
}

/**
 * Generates match numbers based on the user's exact specification:
 *
 * 1. 10:00 AM Match Number (base10AM):
 *    - Same hour's 15-minute matches are calculated by +1:
 *      10:00 = 10AMBase
 *      10:15 = 10AMBase + 1
 *      10:30 = 10AMBase + 2
 *      10:45 = 10AMBase + 3
 *
 * 2. 11:00 AM Match Number (base11AM) and future hours:
 *    - For every hour from 11:00 AM onward:
 *      numberOfHoursAfter11AM = hour - 11
 *      hourlyBase = 11AMBase + numberOfHoursAfter11AM
 *
 *    - For each 15-minute slot within the hour:
 *      00 minutes = hourlyBase + 0
 *      15 minutes = hourlyBase + 12
 *      30 minutes = hourlyBase + 24
 *      45 minutes = hourlyBase + 36
 *
 * 3. Optional manual overwrites for 11:15 AM, 11:30 AM, 11:45 AM:
 *    - If provided, use the overwrite string. If empty, use calculated.
 *
 * 4. Sequential hosting counts are computed dynamically from startCount.
 *    Cancelled matches do not consume a sequential position.
 */
export function generateMatchesForDate(
  date: string,
  config: DailyScheduleConfig,
  existingMatches: Match[] = []
): Match[] {
  const slots = calculateScheduleSlots(config.startTime, config.endTime, config.intervalMinutes);
  const existingMap = new Map<number, Match>();
  existingMatches.forEach((m) => existingMap.set(m.slot, m));

  const base10Str = (config.base10AM || config.seed1 || '332212').trim();
  const base11Str = (config.base11AM || config.seed2 || '336612').trim();

  const base10Num = parseInt(base10Str, 10) || 332212;
  const base11Num = parseInt(base11Str, 10) || 336612;

  const nowISTDate = getISTDateString();
  const currentMinutesIST = getISTCurrentMinutes();
  const isToday = date === nowISTDate;

  const rawMatches: Match[] = slots.map((slotInfo, index) => {
    const [hStr, mStr] = slotInfo.time24.split(':');
    const hour = parseInt(hStr, 10);
    const minute = parseInt(mStr, 10);

    let matchNumber = '';

    if (hour === 10) {
      // 10:00 AM HOUR LOGIC: calculated by +1 within the hour
      const slotInHour = Math.floor(minute / (config.intervalMinutes || 15));
      const calculated = base10Num + slotInHour;
      matchNumber = String(calculated).padStart(base10Str.length, '0');
    } else if (hour < 10) {
      // For any slot before 10 AM (if start time modified)
      const hoursBefore10 = 10 - hour;
      const slotInHour = Math.floor(minute / (config.intervalMinutes || 15));
      const calculated = base10Num - hoursBefore10 * 4 + slotInHour;
      matchNumber = String(calculated).padStart(base10Str.length, '0');
    } else {
      // 11:00 AM AND FUTURE HOURS LOGIC:
      const numberOfHoursAfter11AM = hour - 11;
      const hourlyBase = base11Num + numberOfHoursAfter11AM;

      let minuteAdd = 0;
      if (minute === 15) minuteAdd = 12;
      else if (minute === 30) minuteAdd = 24;
      else if (minute === 45) minuteAdd = 36;
      else minuteAdd = Math.floor(minute / 15) * 12;

      const calculated = hourlyBase + minuteAdd;
      matchNumber = String(calculated).padStart(base11Str.length, '0');

      // Check optional manual overwrites for 11:15, 11:30, 11:45
      if (hour === 11) {
        if (minute === 15 && config.overwrite1115 && config.overwrite1115.trim()) {
          matchNumber = config.overwrite1115.trim();
        } else if (minute === 30 && config.overwrite1130 && config.overwrite1130.trim()) {
          matchNumber = config.overwrite1130.trim();
        } else if (minute === 45 && config.overwrite1145 && config.overwrite1145.trim()) {
          matchNumber = config.overwrite1145.trim();
        }
      }
    }

    const existing = existingMap.get(index);
    const id = existing?.id || `${date}_slot_${index}_${matchNumber}`;

    // Determine status
    let status: MatchStatus = 'UPCOMING';
    let earning = 0;
    let isCompleted = false;
    let isCancelled = false;
    let isPinned = false;
    const sequentialOverride = existing?.sequentialOverride ?? null;

    if (existing) {
      isCompleted = existing.isCompleted;
      isCancelled = existing.isCancelled;
      earning = existing.earning;
      isPinned = !!existing.isPinned;
    }

    if (isCompleted) {
      status = 'COMPLETED';
    } else if (isCancelled) {
      status = 'CANCELLED';
    } else if (isToday) {
      const matchMin = parseTimeToMinutes(slotInfo.time24);
      const nextMatchMin = matchMin + config.intervalMinutes;

      if (currentMinutesIST >= matchMin && currentMinutesIST < nextMatchMin) {
        status = 'CURRENT';
      } else if (currentMinutesIST >= matchMin - 5 && currentMinutesIST < matchMin) {
        status = 'STARTING_SOON';
      } else {
        status = 'UPCOMING';
      }
    }

    return {
      id,
      date,
      time: slotInfo.time12,
      time24: slotInfo.time24,
      matchNumber,
      slot: index,
      sequentialOverride,
      status,
      earning,
      isCompleted,
      isCancelled,
      isPinned,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: existing?.completedAt,
    };
  });

  // Calculate sequential counts taking into account cancellation & overrides
  return recalculateSequentialCounts(rawMatches, config.startCount || 1);
}

/**
 * Calculates current and next match dynamically based on IST time and state
 */
export function determineCurrentAndNextMatch(
  matches: Match[],
  isToday: boolean,
  intervalMinutes: number = 15
): {
  currentMatch: Match | null;
  nextMatch: Match | null;
  secondsToNextMatch: number;
} {
  if (!matches || matches.length === 0) {
    return { currentMatch: null, nextMatch: null, secondsToNextMatch: 0 };
  }

  const pendingMatches = matches.filter((m) => !m.isCompleted && !m.isCancelled);

  if (pendingMatches.length === 0) {
    return {
      currentMatch: matches[matches.length - 1] || null,
      nextMatch: null,
      secondsToNextMatch: 0,
    };
  }

  if (!isToday) {
    return {
      currentMatch: pendingMatches[0] || null,
      nextMatch: pendingMatches[1] || null,
      secondsToNextMatch: 0,
    };
  }

  const currentISTMinutes = getISTCurrentMinutes();
  const now = new Date();
  const currentSeconds = now.getSeconds();

  let current: Match | null = null;
  let next: Match | null = null;
  let secondsToNext = 0;

  for (let i = 0; i < pendingMatches.length; i++) {
    const m = pendingMatches[i];
    const mMinutes = parseTimeToMinutes(m.time24);
    const endMinutes = mMinutes + intervalMinutes;

    if (currentISTMinutes >= mMinutes && currentISTMinutes < endMinutes) {
      current = m;
      next = pendingMatches[i + 1] || null;
      break;
    } else if (currentISTMinutes < mMinutes) {
      if (!current) {
        current = m;
        next = pendingMatches[i + 1] || null;
      }
      break;
    }
  }

  if (!current && pendingMatches.length > 0) {
    current = pendingMatches[0];
    next = pendingMatches[1] || null;
  }

  if (next) {
    const nextMin = parseTimeToMinutes(next.time24);
    const diffMin = nextMin - currentISTMinutes;
    secondsToNext = Math.max(0, diffMin * 60 - currentSeconds);
  } else if (current) {
    const curMin = parseTimeToMinutes(current.time24);
    const diffMin = curMin - currentISTMinutes;
    if (diffMin > 0) {
      secondsToNext = Math.max(0, diffMin * 60 - currentSeconds);
    }
  }

  return {
    currentMatch: current,
    nextMatch: next,
    secondsToNextMatch: secondsToNext,
  };
}
