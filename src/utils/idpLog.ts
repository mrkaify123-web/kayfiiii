import { IdpLogEntry, Match } from '../types';
import { getISTDate, getISTDateString, formatISTTime, parseTimeToMinutes } from './ist';

export const STORAGE_KEY_IDP_LOGS = 'ff_idp_logs_v1';

/**
 * Calculates scheduled time vs click time difference in IST.
 */
export function calculateIdpDifference(
  matchDate: string,
  time24OrTime: string,
  nowDate: Date = getISTDate()
): {
  diffSeconds: number;
  diffType: 'early' | 'on_time' | 'late';
  diffFormatted: string;
  scheduledMinutes: number;
} {
  let scheduledMinutes = 0;
  if (time24OrTime.includes(':')) {
    if (time24OrTime.toLowerCase().includes('am') || time24OrTime.toLowerCase().includes('pm')) {
      const isPM = time24OrTime.toLowerCase().includes('pm');
      const clean = time24OrTime.replace(/am|pm/gi, '').trim();
      const [h, m] = clean.split(':').map((x) => parseInt(x, 10) || 0);
      let hour24 = h % 12;
      if (isPM) hour24 += 12;
      scheduledMinutes = hour24 * 60 + m;
    } else {
      scheduledMinutes = parseTimeToMinutes(time24OrTime);
    }
  }

  const clickMinutes = nowDate.getHours() * 60 + nowDate.getMinutes() + nowDate.getSeconds() / 60;
  const diffSeconds = Math.round((clickMinutes - scheduledMinutes) * 60);

  let diffType: 'early' | 'on_time' | 'late';
  let diffFormatted: string;

  // Within 60 seconds is treated as on-time
  if (Math.abs(diffSeconds) <= 60) {
    diffType = 'on_time';
    diffFormatted = 'On time';
  } else if (diffSeconds < -60) {
    diffType = 'early';
    const absSec = Math.abs(diffSeconds);
    if (absSec < 60) {
      diffFormatted = `${absSec}s early`;
    } else {
      const mins = Math.round(absSec / 60);
      diffFormatted = `${mins} min early`;
    }
  } else {
    diffType = 'late';
    if (diffSeconds < 60) {
      diffFormatted = `${diffSeconds}s late`;
    } else {
      const mins = Math.round(diffSeconds / 60);
      diffFormatted = `${mins} min late`;
    }
  }

  return {
    diffSeconds,
    diffType,
    diffFormatted,
    scheduledMinutes,
  };
}

/**
 * Loads all saved IDP logs from localStorage
 */
export function loadIdpLogs(): IdpLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_IDP_LOGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load IDP logs:', e);
  }
  return [];
}

/**
 * Persists IDP logs to localStorage
 */
export function saveIdpLogs(logs: IdpLogEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_IDP_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save IDP logs:', e);
  }
}

/**
 * Records an IDP button click silently.
 * - If first click for this match: creates new entry.
 * - If clicked multiple times: keeps first click time as main, adds to extra clicks.
 * - Ignores accidental double-clicks within 5 seconds.
 */
export function recordIdpClick(match: Match): { logs: IdpLogEntry[]; updatedEntry: IdpLogEntry | null; isNew: boolean } {
  const existingLogs = loadIdpLogs();
  const now = getISTDate();
  const nowTimestamp = Date.now();
  const nowTimeFormatted = formatISTTime(now, true);
  const todayIST = getISTDateString(now);

  const existingIndex = existingLogs.findIndex((l) => l.matchId === match.id);

  if (existingIndex >= 0) {
    const entry = existingLogs[existingIndex];
    // Ignore double clicks within 5 seconds
    if (nowTimestamp - entry.idpClickTimestamp < 5000) {
      return { logs: existingLogs, updatedEntry: null, isNew: false };
    }

    // Keep FIRST click time as main, store this as extra click
    const updatedEntry: IdpLogEntry = {
      ...entry,
      totalClicks: (entry.totalClicks || 1) + 1,
      allClicks: [...(entry.allClicks || [entry.idpClickTime]), nowTimeFormatted],
    };

    const nextLogs = [...existingLogs];
    nextLogs[existingIndex] = updatedEntry;
    saveIdpLogs(nextLogs);
    return { logs: nextLogs, updatedEntry, isNew: false };
  }

  // Brand new IDP click entry
  const { diffSeconds, diffType, diffFormatted, scheduledMinutes } = calculateIdpDifference(
    match.date || todayIST,
    match.time24 || match.time,
    now
  );

  const newEntry: IdpLogEntry = {
    id: `idp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    matchId: match.id,
    date: match.date || todayIST,
    scheduledMatchTime: match.time || match.time24,
    scheduledMinutes,
    matchNumber: match.matchNumber,
    sequentialCount: match.sequentialCount || null,
    idpClickTime: nowTimeFormatted,
    idpClickTimestamp: nowTimestamp,
    differenceSeconds: diffSeconds,
    diffType,
    diffFormatted,
    matchType: match.id.includes('extra') ? 'EXTRA' : 'REGULAR',
    totalClicks: 1,
    allClicks: [nowTimeFormatted],
    createdAt: new Date().toISOString(),
  };

  const nextLogs = [newEntry, ...existingLogs];
  saveIdpLogs(nextLogs);
  return { logs: nextLogs, updatedEntry: newEntry, isNew: true };
}

/**
 * Computes summary statistics for a list of IDP logs
 */
export function calculateIdpStats(logs: IdpLogEntry[]): {
  total: number;
  onTimeCount: number;
  onTimePercent: number;
  earlyCount: number;
  lateCount: number;
  avgDifferenceSeconds: number;
  avgDiffFormatted: string;
  earliestEntry: IdpLogEntry | null;
  latestEntry: IdpLogEntry | null;
} {
  const total = logs.length;
  if (total === 0) {
    return {
      total: 0,
      onTimeCount: 0,
      onTimePercent: 0,
      earlyCount: 0,
      lateCount: 0,
      avgDifferenceSeconds: 0,
      avgDiffFormatted: '0 min',
      earliestEntry: null,
      latestEntry: null,
    };
  }

  let onTime = 0;
  let early = 0;
  let late = 0;
  let sumDiff = 0;

  let earliest: IdpLogEntry | null = null;
  let latest: IdpLogEntry | null = null;

  logs.forEach((item) => {
    if (item.diffType === 'on_time') onTime++;
    else if (item.diffType === 'early') early++;
    else if (item.diffType === 'late') late++;

    sumDiff += item.differenceSeconds;

    if (!earliest || item.differenceSeconds < earliest.differenceSeconds) {
      earliest = item;
    }
    if (!latest || item.differenceSeconds > latest.differenceSeconds) {
      latest = item;
    }
  });

  const avgDiff = Math.round(sumDiff / total);
  let avgDiffFormatted = '';
  if (Math.abs(avgDiff) <= 60) {
    avgDiffFormatted = 'On time';
  } else if (avgDiff < 0) {
    avgDiffFormatted = `${Math.round(Math.abs(avgDiff) / 60)}m early avg`;
  } else {
    avgDiffFormatted = `${Math.round(avgDiff / 60)}m late avg`;
  }

  return {
    total,
    onTimeCount: onTime,
    onTimePercent: Math.round((onTime / total) * 100),
    earlyCount: early,
    lateCount: late,
    avgDifferenceSeconds: avgDiff,
    avgDiffFormatted,
    earliestEntry: earliest,
    latestEntry: latest,
  };
}
