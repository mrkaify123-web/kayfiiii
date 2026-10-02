import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  ActiveTab,
  AppNotification,
  AppSettings,
  DailyData,
  DailyScheduleConfig,
  Match,
} from '../types';
import {
  calculateScheduleSlots,
  getISTCurrentMinutes,
  getISTDate,
  getISTDateString,
  parseTimeToMinutes,
  formatISTTime,
} from '../utils/ist';
import {
  determineCurrentAndNextMatch,
  generateMatchesForDate,
  getIdpUrl,
  getWinUrl,
  recalculateSequentialCounts,
  getMatchCopyString,
} from '../utils/matchGenerator';
import { applyThemeToDocument } from '../utils/themes';
import { playNotificationSound, triggerHaptic } from '../utils/audio';
import { generateProofText, copyToClipboard, shareProof } from '../utils/proof';
import { WeeklyPaymentStatus } from '../utils/weeklyEarnings';
import {
  IdpLogEntry,
  WellnessSettings,
  WellnessChecklistDay,
  WellnessLogEntry,
} from '../types';
import {
  loadIdpLogs,
  saveIdpLogs,
  recordIdpClick,
  STORAGE_KEY_IDP_LOGS,
} from '../utils/idpLog';
import {
  loadWellnessSettings,
  saveWellnessSettings,
  loadWellnessDailyData,
  saveWellnessDailyData,
  getOrCreateWellnessDay,
  calculateWellnessStreak,
  DEFAULT_WELLNESS_SETTINGS,
  STORAGE_KEY_WELLNESS_SETTINGS,
  STORAGE_KEY_WELLNESS_DAILY,
  STORAGE_KEY_WELLNESS_LAST_BREAK,
  STORAGE_KEY_WELLNESS_SNOOZE,
} from '../utils/wellness';
import confetti from 'canvas-confetti';

interface AppContextType {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  allDailyData: Record<string, DailyData>;
  currentDailyData: DailyData;
  settings: AppSettings;
  updateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
  weeklyPaymentStatuses: Record<string, WeeklyPaymentStatus>;
  setWeeklyPaymentStatus: (weekId: string, status: WeeklyPaymentStatus) => void;
  toggleWeeklyPaymentStatus: (weekId: string) => void;
  currentMatch: Match | null;
  nextMatch: Match | null;
  secondsToNextMatch: number;
  streakDays: number;
  isOnline: boolean;
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (title: string, message: string, type?: AppNotification['type'], matchNum?: string) => void;
  // Match Actions
  completeMatch: (matchId: string) => void;
  cancelMatch: (matchId: string, reason?: string) => void;
  uncancelMatch: (matchId: string) => void;
  undoMatchAction: (matchId: string) => void;
  togglePinMatch: (matchId: string) => void;
  setExtraMatches: (date: string, count: number, notes?: string) => void;
  setManualCountOverride: (date: string, count: number | null) => void;
  setMatchSequentialOverride: (matchId: string, overrideCount: number | null) => void;
  setDailyNotes: (date: string, notes: string) => void;
  generateScheduleForDate: (date: string, config: DailyScheduleConfig, overwrite?: boolean) => void;
  getIdpUrl: (matchNumber: string) => string;
  getWinUrl: (matchNumber: string) => string;
  openIdp: (match: Match) => void;
  openWinning: (match: Match) => void;
  executeProofWorkflow: (match: Match, openWinningWindow?: boolean) => Promise<boolean>;
  copyProofAction: (match: Match) => Promise<boolean>;
  shareProofAction: (match: Match) => Promise<boolean>;
  copyMatchNumber: (matchNumber: string) => Promise<boolean>;
  copyMatch: (match: Match) => Promise<boolean>;
  // Data Import / Export
  importDataBackup: (jsonContent: string) => boolean;
  resetAllData: () => void;
  refreshTimeAndStatus: () => void;
  lastUpdatedTime: string;
  toastMessage: { text: string; actionText?: string; onAction?: () => void } | null;
  setToastMessage: (toast: { text: string; actionText?: string; onAction?: () => void } | null) => void;
  selectedMatchForDetail: Match | null;
  setSelectedMatchForDetail: (match: Match | null) => void;
  hostingMode: boolean;
  setHostingMode: (val: boolean) => void;

  // Feature 1: Wellness
  wellnessSettings: WellnessSettings;
  updateWellnessSettings: (updater: (prev: WellnessSettings) => WellnessSettings) => void;
  wellnessTodayData: WellnessChecklistDay;
  wellnessDailyHistory: Record<string, WellnessChecklistDay>;
  wellnessStreak: number;
  wellnessPopupOpen: boolean;
  secondsToNextBreak: number;
  nextBreakTimeFormatted: string;
  markWellnessItem: (item: 'food' | 'water' | 'rest', done: boolean, count?: number) => void;
  recordBreakAction: (action: 'done' | 'skipped', checklist?: { food: boolean; water: boolean; rest: boolean }) => void;
  snoozeWellnessBreak: (minutes: number) => void;
  triggerManualBreak: () => void;
  closeWellnessPopup: () => void;

  // Feature 2: IDP Log
  idpLogs: IdpLogEntry[];
  deleteIdpLog: (id: string) => void;
  clearIdpLogs: () => void;

  // Feature 3: Focus Mode
  focusMode: boolean;
  setFocusMode: (val: boolean) => void;
}

const STORAGE_KEY_DATA = 'ff_hosting_daily_data_v2';
const STORAGE_KEY_SETTINGS = 'ff_hosting_settings_v2';
const STORAGE_KEY_NOTIFS = 'ff_hosting_notifs_v2';
const STORAGE_KEY_WEEKLY_PAYMENTS = 'ff_weekly_payment_statuses_v1';

const DEFAULT_SCHEDULE_CONFIG: DailyScheduleConfig = {
  startTime: '10:00',
  endTime: '22:00',
  intervalMinutes: 15,
  base10AM: '332212',
  base11AM: '336612',
  overwrite1115: '',
  overwrite1130: '',
  overwrite1145: '',
  totalRegularMatches: 49,
};

const DEFAULT_SETTINGS: AppSettings = {
  appearance: {
    mode: 'dark',
    pastelTheme: 'Teal',
    customAccentColor: null,
    pastelBackground: null,
  },
  notifications: {
    enabled: true,
    notifyBeforeMinutes: 5,
    sound: 'default',
    vibration: true,
  },
  hosting: {
    defaultStartTime: '10:00',
    defaultEndTime: '22:00',
    defaultInterval: 15,
    earningRate: 3,
    dailyTarget: 147,
    hostingMode: false,
    adminBaseUrl: 'https://skillclash.site/admin2020/matches',
    idpBaseUrl: 'https://skillclash.site/admin2020/matches/edit/',
    winningBaseUrl: 'https://skillclash.site/admin2020/matches/member_join_match/',
    focusMode: false,
    focusModeAmoled: false,
    focusModeAutoEnable: false,
    focusModeAutoMinutes: 5,
  },
  display: {
    density: 'comfortable',
    autoScrollToCurrent: true,
    widgets: {
      currentMatch: true,
      nextMatch: true,
      todayEarnings: true,
      todayProgress: true,
      dailyTarget: true,
      quickActions: true,
      extraMatches: true,
      statistics: true,
      recentActivity: true,
    },
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<string>(getISTDateString());
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [allDailyData, setAllDailyData] = useState<Record<string, DailyData>>({});
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<{ text: string; actionText?: string; onAction?: () => void } | null>(null);
  const [selectedMatchForDetail, setSelectedMatchForDetail] = useState<Match | null>(null);
  const [notifiedMatches, setNotifiedMatches] = useState<Set<string>>(new Set());
  const [weeklyPaymentStatuses, setWeeklyPaymentStatuses] = useState<Record<string, WeeklyPaymentStatus>>({});

  // Feature 1: Wellness States
  const [wellnessSettings, setWellnessSettingsState] = useState<WellnessSettings>(() => loadWellnessSettings());
  const [wellnessDailyHistory, setWellnessDailyHistory] = useState<Record<string, WellnessChecklistDay>>(() => loadWellnessDailyData());
  const [wellnessPopupOpen, setWellnessPopupOpen] = useState(false);
  const [lastBreakTimestamp, setLastBreakTimestamp] = useState<number>(() => {
    const raw = localStorage.getItem(STORAGE_KEY_WELLNESS_LAST_BREAK);
    return raw ? parseInt(raw, 10) : Date.now();
  });
  const [snoozeUntilTimestamp, setSnoozeUntilTimestamp] = useState<number | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY_WELLNESS_SNOOZE);
    return raw ? parseInt(raw, 10) : null;
  });

  // Feature 2: IDP Logs State
  const [idpLogs, setIdpLogs] = useState<IdpLogEntry[]>(() => loadIdpLogs());

  // Feature 3: Focus Mode State (persisted in settings.hosting.focusMode)
  const [focusMode, setFocusModeState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return !!parsed?.hosting?.focusMode;
      }
    } catch {
      // fallback
    }
    return false;
  });

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setToastMessage({ text: 'Back Online' });
    };
    const handleOffline = () => {
      setIsOnline(false);
      setToastMessage({ text: "You're Offline - Local data remains intact" });
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Load Initial Settings & Data
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
          appearance: {
            ...DEFAULT_SETTINGS.appearance,
            ...(parsed.appearance || {}),
            mode: parsed?.appearance?.mode === 'light' ? 'light' : 'dark',
          },
          hosting: {
            ...DEFAULT_SETTINGS.hosting,
            ...(parsed.hosting || {}),
            idpBaseUrl: parsed?.hosting?.idpBaseUrl || DEFAULT_SETTINGS.hosting.idpBaseUrl,
            winningBaseUrl: parsed?.hosting?.winningBaseUrl || DEFAULT_SETTINGS.hosting.winningBaseUrl,
          },
        });
      }
    } catch {
      // fallback
    }

    try {
      const savedNotifs = localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (savedNotifs) {
        setNotifications(JSON.parse(savedNotifs));
      }
    } catch {
      // fallback
    }

    try {
      const savedWeekly = localStorage.getItem(STORAGE_KEY_WEEKLY_PAYMENTS);
      if (savedWeekly) {
        setWeeklyPaymentStatuses(JSON.parse(savedWeekly));
      }
    } catch {
      // fallback
    }

    try {
      const savedData = localStorage.getItem(STORAGE_KEY_DATA);
      const todayStr = getISTDateString();

      let parsedData: Record<string, DailyData> = {};
      if (savedData) {
        parsedData = JSON.parse(savedData);
      }

      // If today doesn't exist, create it cleanly
      if (!parsedData[todayStr]) {
        const slots = calculateScheduleSlots(
          DEFAULT_SCHEDULE_CONFIG.startTime,
          DEFAULT_SCHEDULE_CONFIG.endTime,
          DEFAULT_SCHEDULE_CONFIG.intervalMinutes
        );
        const config: DailyScheduleConfig = {
          ...DEFAULT_SCHEDULE_CONFIG,
          totalRegularMatches: slots.length,
        };
        const matches = generateMatchesForDate(todayStr, config);
        parsedData[todayStr] = {
          date: todayStr,
          schedule: config,
          matches,
          extraMatches: 0,
          completedCount: 0,
          cancelledCount: 0,
          regularEarnings: 0,
          extraEarnings: 0,
          totalEarnings: 0,
          notes: '',
        };
      }

      // If database is fresh, populate a couple previous days for immediate calendar & analytics richness
      const dayKeys = Object.keys(parsedData);
      if (dayKeys.length === 1 && dayKeys[0] === todayStr) {
        // Seed yesterday and 2 days ago for rich demonstration of calendar, stats & streaks
        const nowIST = getISTDate();
        for (let i = 1; i <= 2; i++) {
          const pastDate = new Date(nowIST);
          pastDate.setDate(pastDate.getDate() - i);
          const pastDateStr = getISTDateString(pastDate);

          const slots = calculateScheduleSlots('10:00', '22:00', 15);
          const pastConfig: DailyScheduleConfig = {
            ...DEFAULT_SCHEDULE_CONFIG,
            base10AM: String(332212 - i * 100),
            base11AM: String(336612 - i * 100),
            totalRegularMatches: slots.length,
          };
          const baseMatches = generateMatchesForDate(pastDateStr, pastConfig);
          // Simulate 42 completed matches, 3 cancelled, 4 upcoming
          const completedCount = 42;
          const cancelledCount = 3;
          const matches = baseMatches.map((m, idx) => {
            if (idx < completedCount) {
              return { ...m, isCompleted: true, status: 'COMPLETED' as const, earning: 3 };
            } else if (idx < completedCount + cancelledCount) {
              return { ...m, isCancelled: true, status: 'CANCELLED' as const, earning: 0 };
            }
            return m;
          });
          const extraMatches = i === 1 ? 5 : 2;
          const regularEarnings = completedCount * 3;
          const extraEarnings = extraMatches * 3;

          parsedData[pastDateStr] = {
            date: pastDateStr,
            schedule: pastConfig,
            matches,
            extraMatches,
            completedCount,
            cancelledCount,
            regularEarnings,
            extraEarnings,
            totalEarnings: regularEarnings + extraEarnings,
            notes: i === 1 ? 'Aaj 5 extra matches kiye. Smooth hosting day.' : 'Regular day hosting completed.',
          };
        }
      }

      setAllDailyData(parsedData);
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(parsedData));
    } catch {
      // fallback
    }
  }, []);

  // Save Data to localStorage
  const saveDailyData = useCallback((newData: Record<string, DailyData>) => {
    setAllDailyData(newData);
    try {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(newData));
    } catch (e) {
      console.error('Failed to save daily data', e);
    }
  }, []);

  // Save Settings to localStorage & Apply Theme
  const updateSettings = useCallback(
    (updater: (prev: AppSettings) => AppSettings) => {
      setSettings((prev) => {
        const next = updater(prev);
        try {
          localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(next));
        } catch (e) {
          console.error('Failed to save settings', e);
        }
        return next;
      });
    },
    []
  );

  // Apply Appearance Theme (Independent of OS/browser prefers-color-scheme)
  useEffect(() => {
    const isDark = settings.appearance.mode === 'dark';
    applyThemeToDocument(
      settings.appearance.pastelTheme,
      isDark,
      settings.appearance.customAccentColor,
      settings.appearance.pastelBackground
    );
  }, [
    settings.appearance.mode,
    settings.appearance.pastelTheme,
    settings.appearance.customAccentColor,
    settings.appearance.pastelBackground,
  ]);

  // Notifications persistence
  const saveNotifications = useCallback((newNotifs: AppNotification[]) => {
    setNotifications(newNotifs);
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(newNotifs));
    } catch {
      // ignore
    }
  }, []);

  const addNotification = useCallback(
    (title: string, message: string, type: AppNotification['type'] = 'info', matchNum?: string) => {
      const newNotif: AppNotification = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        title,
        message,
        type,
        isRead: false,
        matchNumber: matchNum,
      };
      setNotifications((prev) => {
        const updated = [newNotif, ...prev].slice(0, 50);
        try {
          localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });

      if (settings.notifications.enabled) {
        playNotificationSound(settings.notifications.sound);
        triggerHaptic(settings.notifications.vibration);
      }
    },
    [settings.notifications]
  );

  const markNotificationRead = useCallback(
    (id: string) => {
      const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      saveNotifications(updated);
    },
    [notifications, saveNotifications]
  );

  const markAllNotificationsRead = useCallback(() => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Get current daily data safely
  const currentDailyData = useMemo<DailyData>(() => {
    if (allDailyData[selectedDate]) {
      return allDailyData[selectedDate];
    }
    const slots = calculateScheduleSlots(
      settings.hosting.defaultStartTime,
      settings.hosting.defaultEndTime,
      settings.hosting.defaultInterval
    );
    const config: DailyScheduleConfig = {
      ...DEFAULT_SCHEDULE_CONFIG,
      startTime: settings.hosting.defaultStartTime,
      endTime: settings.hosting.defaultEndTime,
      intervalMinutes: settings.hosting.defaultInterval,
      totalRegularMatches: slots.length,
    };
    const matches = generateMatchesForDate(selectedDate, config);
    return {
      date: selectedDate,
      schedule: config,
      matches,
      extraMatches: 0,
      completedCount: 0,
      cancelledCount: 0,
      regularEarnings: 0,
      extraEarnings: 0,
      totalEarnings: 0,
      notes: '',
    };
  }, [allDailyData, selectedDate, settings.hosting]);

  // Live timer tick for current / next match & countdown
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update last updated string
  useEffect(() => {
    const ist = getISTDate();
    let hours = ist.getHours();
    const minutes = String(ist.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    setLastUpdatedTime(`${hours}:${minutes} ${ampm}`);
  }, [tick]);

  // Determine current & next match
  const { currentMatch, nextMatch, secondsToNextMatch } = useMemo(() => {
    const isToday = selectedDate === getISTDateString();
    return determineCurrentAndNextMatch(
      currentDailyData.matches,
      isToday,
      currentDailyData.schedule?.intervalMinutes || 15
    );
    // tick triggers update every second
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDailyData.matches, selectedDate, currentDailyData.schedule?.intervalMinutes, tick]);

  // Match Notification Checker
  useEffect(() => {
    if (!settings.notifications.enabled) return;
    const isToday = selectedDate === getISTDateString();
    if (!isToday || !nextMatch) return;

    const notifyWindowSeconds = settings.notifications.notifyBeforeMinutes * 60;
    // Check if match starts in notifyWindowSeconds (with 3-second tolerance)
    if (secondsToNextMatch > 0 && secondsToNextMatch <= notifyWindowSeconds && secondsToNextMatch > notifyWindowSeconds - 4) {
      const matchKey = `${nextMatch.id}_${settings.notifications.notifyBeforeMinutes}m`;
      if (!notifiedMatches.has(matchKey)) {
        setNotifiedMatches((prev) => new Set(prev).add(matchKey));
        addNotification(
          'Match Starting Soon',
          `Match #${nextMatch.matchNumber} (${nextMatch.time}) starts in ${settings.notifications.notifyBeforeMinutes} minute${
            settings.notifications.notifyBeforeMinutes > 1 ? 's' : ''
          }.`,
          'match',
          nextMatch.matchNumber
        );
      }
    }
  }, [nextMatch, secondsToNextMatch, settings.notifications, selectedDate, notifiedMatches, addNotification]);

  // Calculate Streak Days
  const streakDays = useMemo(() => {
    const nowIST = getISTDate();
    let streak = 0;
    let checkDate = new Date(nowIST);

    // If today has completed matches, start streak check from today, else start from yesterday
    const todayStr = getISTDateString(checkDate);
    const todayData = allDailyData[todayStr];
    const todayActive = todayData && (todayData.completedCount > 0 || todayData.extraMatches > 0);

    if (!todayActive) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    for (let i = 0; i < 365; i++) {
      const dateStr = getISTDateString(checkDate);
      const dayData = allDailyData[dateStr];
      if (dayData && (dayData.completedCount > 0 || dayData.extraMatches > 0)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [allDailyData]);

  // ============================================
  // FEATURE 1: WELLNESS / BREAK ENGINE
  // ============================================
  const todayIST = getISTDateString();
  const wellnessTodayData = useMemo(() => {
    return getOrCreateWellnessDay(wellnessDailyHistory, todayIST);
  }, [wellnessDailyHistory, todayIST]);

  const wellnessStreak = useMemo(() => {
    return calculateWellnessStreak(wellnessDailyHistory);
  }, [wellnessDailyHistory]);

  const breakIntervalMs = (wellnessSettings.breakIntervalMinutes || 120) * 60 * 1000;

  const { secondsToNextBreak, nextBreakTimeFormatted } = useMemo(() => {
    const now = Date.now();
    const effectiveTarget =
      snoozeUntilTimestamp && snoozeUntilTimestamp > now
        ? snoozeUntilTimestamp
        : lastBreakTimestamp + breakIntervalMs;

    const diffMs = Math.max(0, effectiveTarget - now);
    const sec = Math.ceil(diffMs / 1000);
    const targetDate = new Date(effectiveTarget);
    return {
      secondsToNextBreak: sec,
      nextBreakTimeFormatted: formatISTTime(targetDate, false),
    };
  }, [tick, snoozeUntilTimestamp, lastBreakTimestamp, breakIntervalMs]);

  // Wellness Break Reminder Check (every tick)
  useEffect(() => {
    if (!wellnessSettings.enabled) return;
    const now = Date.now();
    const ist = getISTDate();
    const currentMin = ist.getHours() * 60 + ist.getMinutes();
    const startMin = parseTimeToMinutes(settings.hosting.defaultStartTime || '10:00');
    const endMin = parseTimeToMinutes(settings.hosting.defaultEndTime || '22:00');
    const withinHostingHours = currentMin >= startMin && currentMin <= endMin;

    if (!withinHostingHours) return;
    if (snoozeUntilTimestamp && now < snoozeUntilTimestamp) return;

    const isDue = now - lastBreakTimestamp >= breakIntervalMs;
    // Buffer check: if next match starts in 2 minutes or less (secondsToNextMatch > 0 && secondsToNextMatch <= 120),
    // delay popup until after match so it never blocks IDP/WIN/COPY/Complete!
    const isMatchImminent = secondsToNextMatch > 0 && secondsToNextMatch <= 120;

    if (isDue && !isMatchImminent && !wellnessPopupOpen) {
      setWellnessPopupOpen(true);
      if (wellnessSettings.soundEnabled && wellnessSettings.sound !== 'none') {
        playNotificationSound(wellnessSettings.sound);
      }
      if (wellnessSettings.vibration) {
        triggerHaptic(true);
      }
      addNotification('Time for a Break!', 'Take a moment to stretch, hydrate, and refuel.', 'info');
    }
  }, [
    tick,
    wellnessSettings.enabled,
    wellnessSettings.soundEnabled,
    wellnessSettings.sound,
    wellnessSettings.vibration,
    settings.hosting.defaultStartTime,
    settings.hosting.defaultEndTime,
    snoozeUntilTimestamp,
    lastBreakTimestamp,
    breakIntervalMs,
    secondsToNextMatch,
    wellnessPopupOpen,
    addNotification,
  ]);

  // Feature 3: Auto-enable Focus Mode check
  useEffect(() => {
    if (!settings.hosting.focusModeAutoEnable) return;
    const autoMins = (settings.hosting.focusModeAutoMinutes || 5) * 60;
    if (secondsToNextMatch > 0 && secondsToNextMatch <= autoMins) {
      if (!focusMode) {
        setFocusModeState(true);
        setToastMessage({ text: 'Focus Mode auto-activated for upcoming match' });
      }
    }
  }, [secondsToNextMatch, settings.hosting.focusModeAutoEnable, settings.hosting.focusModeAutoMinutes, focusMode]);

  // Recalculate daily totals and active sequential counts helper
  const recalculateDay = (day: DailyData): DailyData => {
    const startCount = day.schedule?.startCount || 1;
    const updatedMatches = recalculateSequentialCounts(day.matches || [], startCount);

    const completedMatches = updatedMatches.filter((m) => m.isCompleted);
    const cancelledMatches = updatedMatches.filter((m) => m.isCancelled);

    const completedCount = completedMatches.length;
    const cancelledCount = cancelledMatches.length;

    const rate = settings.hosting.earningRate || 3;
    const regularEarnings = completedCount * rate;
    const extraEarnings = (day.extraMatches || 0) * rate;
    const totalEarnings = regularEarnings + extraEarnings;

    return {
      ...day,
      matches: updatedMatches,
      completedCount,
      cancelledCount,
      regularEarnings,
      extraEarnings,
      totalEarnings,
    };
  };

  // Complete Match
  const completeMatch = useCallback(
    (matchId: string) => {
      setAllDailyData((prev) => {
        const day = prev[selectedDate] || currentDailyData;
        const targetMatch = day.matches.find((m) => m.id === matchId);
        if (!targetMatch || targetMatch.isCompleted) {
          // Already completed, prevent double earning
          return prev;
        }

        const rate = settings.hosting.earningRate || 3;
        const updatedMatches = day.matches.map((m) => {
          if (m.id === matchId) {
            return {
              ...m,
              isCompleted: true,
              isCancelled: false,
              status: 'COMPLETED' as const,
              earning: rate,
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }
          return m;
        });

        const updatedDay = recalculateDay({
          ...day,
          matches: updatedMatches,
        });

        const nextData = {
          ...prev,
          [selectedDate]: updatedDay,
        };
        saveDailyData(nextData);

        // Feedback
        playNotificationSound(settings.notifications.sound);
        triggerHaptic(settings.notifications.vibration);
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#2dd4bf', '#38bdf8', '#34d399'],
        });

        setToastMessage({
          text: `Match #${targetMatch.matchNumber} completed! (+₹${rate})`,
          actionText: 'Undo',
          onAction: () => undoMatchAction(matchId),
        });

        addNotification(
          'Match Completed',
          `Match #${targetMatch.matchNumber} marked as completed. ₹${rate} added to earnings.`,
          'earning',
          targetMatch.matchNumber
        );

        return nextData;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedDate, currentDailyData, settings.hosting.earningRate, settings.notifications, saveDailyData, addNotification]
  );

  // Cancel Match
  const cancelMatch = useCallback(
    (matchId: string, reason?: string) => {
      setAllDailyData((prev) => {
        const day = prev[selectedDate] || currentDailyData;
        const targetMatch = day.matches.find((m) => m.id === matchId);
        if (!targetMatch || targetMatch.isCancelled) {
          return prev;
        }

        const trimmedReason = reason && reason.trim() ? reason.trim() : undefined;

        const updatedMatches = day.matches.map((m) => {
          if (m.id === matchId) {
            return {
              ...m,
              isCompleted: false,
              isCancelled: true,
              cancelReason: trimmedReason,
              status: 'CANCELLED' as const,
              earning: 0,
              updatedAt: new Date().toISOString(),
            };
          }
          return m;
        });

        const updatedDay = recalculateDay({
          ...day,
          matches: updatedMatches,
        });

        const nextData = {
          ...prev,
          [selectedDate]: updatedDay,
        };
        saveDailyData(nextData);

        const reasonDisplay = trimmedReason ? ` (${trimmedReason})` : '';
        setToastMessage({
          text: `Match #${targetMatch.matchNumber} cancelled${reasonDisplay}. (₹0)`,
          actionText: 'Undo',
          onAction: () => undoMatchAction(matchId),
        });

        addNotification(
          'Match Cancelled',
          `Match #${targetMatch.matchNumber} was marked as cancelled${reasonDisplay}.`,
          'alert',
          targetMatch.matchNumber
        );

        return nextData;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedDate, currentDailyData, saveDailyData, addNotification]
  );

  // Undo Match Action
  const undoMatchAction = useCallback(
    (matchId: string) => {
      setAllDailyData((prev) => {
        const day = prev[selectedDate];
        if (!day) return prev;

        const updatedMatches = day.matches.map((m) => {
          if (m.id === matchId) {
            return {
              ...m,
              isCompleted: false,
              isCancelled: false,
              status: 'UPCOMING' as const,
              earning: 0,
              updatedAt: new Date().toISOString(),
              completedAt: undefined,
            };
          }
          return m;
        });

        const updatedDay = recalculateDay({
          ...day,
          matches: updatedMatches,
        });

        const nextData = {
          ...prev,
          [selectedDate]: updatedDay,
        };
        saveDailyData(nextData);
        setToastMessage({ text: 'Match action undone.' });
        return nextData;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedDate, saveDailyData]
  );

  // Uncancel Match
  const uncancelMatch = useCallback(
    (matchId: string) => {
      setAllDailyData((prev) => {
        const day = prev[selectedDate] || currentDailyData;
        const targetMatch = day.matches.find((m) => m.id === matchId);
        if (!targetMatch || !targetMatch.isCancelled) {
          return prev;
        }

        const updatedMatches = day.matches.map((m) => {
          if (m.id === matchId) {
            return {
              ...m,
              isCancelled: false,
              isCompleted: false,
              status: 'UPCOMING' as const,
              earning: 0,
              updatedAt: new Date().toISOString(),
            };
          }
          return m;
        });

        const updatedDay = recalculateDay({
          ...day,
          matches: updatedMatches,
        });

        const nextData = {
          ...prev,
          [selectedDate]: updatedDay,
        };
        saveDailyData(nextData);

        setToastMessage({
          text: `Match #${targetMatch.matchNumber} uncancelled & restored.`,
        });

        return nextData;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedDate, currentDailyData, saveDailyData]
  );

  // Toggle Pin Match
  const togglePinMatch = useCallback(
    (matchId: string) => {
      setAllDailyData((prev) => {
        const day = prev[selectedDate] || currentDailyData;
        const updatedMatches = day.matches.map((m) => {
          if (m.id === matchId) {
            return { ...m, isPinned: !m.isPinned };
          }
          return m;
        });
        const nextData = {
          ...prev,
          [selectedDate]: { ...day, matches: updatedMatches },
        };
        saveDailyData(nextData);
        return nextData;
      });
    },
    [selectedDate, currentDailyData, saveDailyData]
  );

  // Set Extra Matches
  const setExtraMatches = useCallback(
    (date: string, count: number, notes?: string) => {
      const validCount = Math.max(0, count);
      setAllDailyData((prev) => {
        const day = prev[date] || currentDailyData;
        const updatedDay = recalculateDay({
          ...day,
          extraMatches: validCount,
          extraMatchesNotes: notes !== undefined ? notes : day.extraMatchesNotes,
        });
        const nextData = {
          ...prev,
          [date]: updatedDay,
        };
        saveDailyData(nextData);
        setToastMessage({
          text: `Extra matches set to ${validCount} (+₹${validCount * (settings.hosting.earningRate || 3)})`,
        });
        return nextData;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentDailyData, saveDailyData, settings.hosting.earningRate]
  );

  // Set Manual Count Override
  const setManualCountOverride = useCallback(
    (date: string, count: number | null) => {
      setAllDailyData((prev) => {
        const day = prev[date] || currentDailyData;
        const nextData = {
          ...prev,
          [date]: { ...day, manualCountOverride: count },
        };
        saveDailyData(nextData);
        setToastMessage({ text: count !== null ? `Manual count override set to #${count}` : 'Manual count reset' });
        return nextData;
      });
    },
    [currentDailyData, saveDailyData]
  );

  // Set Individual Match Sequential Override
  const setMatchSequentialOverride = useCallback(
    (matchId: string, overrideCount: number | null) => {
      setAllDailyData((prev) => {
        const day = prev[selectedDate] || currentDailyData;
        const updatedMatches = day.matches.map((m) => {
          if (m.id === matchId) {
            return {
              ...m,
              sequentialOverride: overrideCount,
            };
          }
          return m;
        });

        const updatedDay = recalculateDay({
          ...day,
          matches: updatedMatches,
        });

        const nextData = {
          ...prev,
          [selectedDate]: updatedDay,
        };
        saveDailyData(nextData);
        setToastMessage({
          text: overrideCount !== null ? `Sequential count overridden to #${overrideCount}` : 'Sequential override cleared',
        });
        return nextData;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedDate, currentDailyData, saveDailyData]
  );

  // Set Daily Notes
  const setDailyNotes = useCallback(
    (date: string, notes: string) => {
      setAllDailyData((prev) => {
        const day = prev[date] || currentDailyData;
        const nextData = {
          ...prev,
          [date]: { ...day, notes },
        };
        saveDailyData(nextData);
        setToastMessage({ text: 'Daily notes saved.' });
        return nextData;
      });
    },
    [currentDailyData, saveDailyData]
  );

  // Generate / Regenerate Schedule For Date
  const generateScheduleForDate = useCallback(
    (date: string, config: DailyScheduleConfig, overwrite: boolean = false) => {
      setAllDailyData((prev) => {
        const existing = prev[date];

        // If overwrite is false, preserve slot completed/cancelled/pinned status from existing matches
        // If overwrite is true, wipe all previous completion states and start fresh
        const existingMatchesToKeep = overwrite || !existing ? [] : existing.matches;

        const newMatches = generateMatchesForDate(
          date,
          config,
          existingMatchesToKeep
        );

        const updatedDay = recalculateDay({
          date,
          schedule: config,
          matches: newMatches,
          extraMatches: overwrite ? 0 : existing?.extraMatches || 0,
          extraMatchesNotes: overwrite ? undefined : existing?.extraMatchesNotes,
          notes: overwrite ? '' : existing?.notes || '',
          completedCount: 0,
          cancelledCount: 0,
          regularEarnings: 0,
          extraEarnings: 0,
          totalEarnings: 0,
        });

        const nextData = {
          ...prev,
          [date]: updatedDay,
        };
        saveDailyData(nextData);
        setToastMessage({
          text: overwrite
            ? `Schedule reset & generated for ${date} (${newMatches.length} matches)`
            : `Match numbers updated for ${date} (${newMatches.length} matches)`,
        });
        return nextData;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [saveDailyData]
  );

  // Centralized URL Getters
  const getIdpUrlForMatch = useCallback(
    (matchNumber: string) => {
      return getIdpUrl(matchNumber, settings.hosting.idpBaseUrl);
    },
    [settings.hosting.idpBaseUrl]
  );

  const getWinUrlForMatch = useCallback(
    (matchNumber: string) => {
      return getWinUrl(matchNumber, settings.hosting.winningBaseUrl);
    },
    [settings.hosting.winningBaseUrl]
  );

  // Admin Actions
  const openIdp = useCallback(
    (match: Match) => {
      // 1. Feature 2: Silent IDP timing log
      recordIdpClick(match);
      setIdpLogs(loadIdpLogs());

      // 2. Open IDP URL
      const url = getIdpUrlForMatch(match.matchNumber);
      window.open(url, '_blank', 'noopener,noreferrer');
      setToastMessage({ text: `Opened IDP for #${match.matchNumber}` });
    },
    [getIdpUrlForMatch]
  );

  const openWinning = useCallback(
    (match: Match) => {
      const url = getWinUrlForMatch(match.matchNumber);
      window.open(url, '_blank', 'noopener,noreferrer');
      setToastMessage({ text: `Opened WIN for #${match.matchNumber}` });
    },
    [getWinUrlForMatch]
  );

  // Proof Workflow (Section 14)
  const executeProofWorkflow = useCallback(
    async (match: Match, openWinningWindow: boolean = true): Promise<boolean> => {
      const day = allDailyData[selectedDate] || currentDailyData;
      const count = day.manualCountOverride !== null && day.manualCountOverride !== undefined
        ? day.manualCountOverride
        : day.completedCount + (match.isCompleted ? 0 : 1);

      const proofText = generateProofText(match, count);
      await copyToClipboard(proofText);

      if (openWinningWindow) {
        const url = getWinUrlForMatch(match.matchNumber);
        window.open(url, '_blank', 'noopener,noreferrer');
      }

      // If not already completed, complete it
      if (!match.isCompleted) {
        completeMatch(match.id);
      }

      setToastMessage({
        text: `Proof copied & Match #${match.matchNumber} processed!`,
      });

      return true;
    },
    [allDailyData, selectedDate, currentDailyData, completeMatch, getWinUrlForMatch]
  );

  const copyProofAction = useCallback(
    async (match: Match): Promise<boolean> => {
      const day = allDailyData[selectedDate] || currentDailyData;
      const count = day.manualCountOverride ?? (day.completedCount || 1);
      const text = generateProofText(match, count);
      const success = await copyToClipboard(text);
      if (success) {
        setToastMessage({ text: 'Proof copied to clipboard!' });
      }
      return success;
    },
    [allDailyData, selectedDate, currentDailyData]
  );

  const shareProofAction = useCallback(
    async (match: Match): Promise<boolean> => {
      const day = allDailyData[selectedDate] || currentDailyData;
      const count = day.manualCountOverride ?? (day.completedCount || 1);
      const text = generateProofText(match, count);
      const success = await shareProof(text, `FF Match #${match.matchNumber} Proof`);
      if (success) {
        setToastMessage({ text: 'Proof shared!' });
      }
      return success;
    },
    [allDailyData, selectedDate, currentDailyData]
  );

  const copyMatchNumber = useCallback(async (matchNumber: string): Promise<boolean> => {
    const success = await copyToClipboard(matchNumber);
    if (success) {
      setToastMessage({ text: 'Copied' });
    }
    return success;
  }, []);

  const copyMatch = useCallback(async (match: Match): Promise<boolean> => {
    const textToCopy = getMatchCopyString(match);
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setToastMessage({ text: 'Copied' });
    }
    return success;
  }, []);

  // Import Backup
  const importDataBackup = useCallback(
    (jsonContent: string): boolean => {
      try {
        const parsed = JSON.parse(jsonContent);
        if (parsed.allDailyData && typeof parsed.allDailyData === 'object') {
          setAllDailyData((prev) => {
            const merged = { ...prev, ...parsed.allDailyData };
            saveDailyData(merged);
            return merged;
          });
          if (parsed.settings) {
            updateSettings(() => parsed.settings);
          }
          setToastMessage({ text: 'Data restored successfully!' });
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [saveDailyData, updateSettings]
  );

  // Reset All Data
  const setWeeklyPaymentStatus = useCallback((weekId: string, status: WeeklyPaymentStatus) => {
    setWeeklyPaymentStatuses((prev) => {
      const next = { ...prev, [weekId]: status };
      try {
        localStorage.setItem(STORAGE_KEY_WEEKLY_PAYMENTS, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const toggleWeeklyPaymentStatus = useCallback((weekId: string) => {
    setWeeklyPaymentStatuses((prev) => {
      const current = prev[weekId] || 'Pending';
      const nextStatus: WeeklyPaymentStatus = current === 'Paid' ? 'Pending' : 'Paid';
      const next = { ...prev, [weekId]: nextStatus };
      try {
        localStorage.setItem(STORAGE_KEY_WEEKLY_PAYMENTS, JSON.stringify(next));
      } catch {}
      setToastMessage({ text: `Week payment marked as ${nextStatus}` });
      return next;
    });
  }, []);

  // Feature 1: Wellness Handlers
  const updateWellnessSettings = useCallback((updater: (prev: WellnessSettings) => WellnessSettings) => {
    setWellnessSettingsState((prev) => {
      const next = updater(prev);
      saveWellnessSettings(next);
      return next;
    });
  }, []);

  const markWellnessItem = useCallback((item: 'food' | 'water' | 'rest', done: boolean, count?: number) => {
    const today = getISTDateString();
    const nowTime = formatISTTime(undefined, false);

    setWellnessDailyHistory((prev) => {
      const currentDay = getOrCreateWellnessDay(prev, today);
      const updatedDay: WellnessChecklistDay = {
        ...currentDay,
        foodDone: item === 'food' ? done : currentDay.foodDone,
        foodMarkedAt: item === 'food' ? (done ? nowTime : undefined) : currentDay.foodMarkedAt,
        waterDone: item === 'water' ? done : currentDay.waterDone,
        waterMarkedAt: item === 'water' ? (done ? nowTime : undefined) : currentDay.waterMarkedAt,
        waterCount:
          item === 'water'
            ? count !== undefined
              ? count
              : done
              ? (currentDay.waterCount || 0) + 1
              : currentDay.waterCount
            : currentDay.waterCount,
        restDone: item === 'rest' ? done : currentDay.restDone,
        restMarkedAt: item === 'rest' ? (done ? nowTime : undefined) : currentDay.restMarkedAt,
        logs: [
          {
            id: `log_${Date.now()}`,
            timestamp: new Date().toISOString(),
            timeIST: nowTime,
            dateIST: today,
            type: item,
            message: `Marked ${item} as ${done ? 'Done' : 'Pending'}`,
          },
          ...currentDay.logs,
        ],
      };

      const nextData = { ...prev, [today]: updatedDay };
      saveWellnessDailyData(nextData);
      return nextData;
    });

    setToastMessage({ text: `Marked ${item.toUpperCase()} as ${done ? 'Done' : 'Pending'}` });
  }, []);

  const recordBreakAction = useCallback((action: 'done' | 'skipped', checklist?: { food: boolean; water: boolean; rest: boolean }) => {
    const today = getISTDateString();
    const nowTime = formatISTTime(undefined, false);
    const nowTimestamp = Date.now();

    setWellnessDailyHistory((prev) => {
      const currentDay = getOrCreateWellnessDay(prev, today);
      const updatedDay: WellnessChecklistDay = {
        ...currentDay,
        foodDone: checklist?.food !== undefined ? checklist.food : currentDay.foodDone,
        foodMarkedAt: checklist?.food ? (currentDay.foodMarkedAt || nowTime) : currentDay.foodMarkedAt,
        waterDone: checklist?.water !== undefined ? checklist.water : currentDay.waterDone,
        waterMarkedAt: checklist?.water ? (currentDay.waterMarkedAt || nowTime) : currentDay.waterMarkedAt,
        restDone: checklist?.rest !== undefined ? checklist.rest : currentDay.restDone,
        restMarkedAt: checklist?.rest ? (currentDay.restMarkedAt || nowTime) : currentDay.restMarkedAt,
        breaksTaken: action === 'done' ? (currentDay.breaksTaken || 0) + 1 : currentDay.breaksTaken,
        breaksSkipped: action === 'skipped' ? (currentDay.breaksSkipped || 0) + 1 : currentDay.breaksSkipped,
        logs: [
          {
            id: `log_${Date.now()}`,
            timestamp: new Date().toISOString(),
            timeIST: nowTime,
            dateIST: today,
            type: action === 'done' ? 'break' : 'skip',
            message: action === 'done' ? 'Completed hosting break' : 'Skipped break',
            checklist,
          },
          ...currentDay.logs,
        ],
      };

      const nextData = { ...prev, [today]: updatedDay };
      saveWellnessDailyData(nextData);
      return nextData;
    });

    setLastBreakTimestamp(nowTimestamp);
    localStorage.setItem(STORAGE_KEY_WELLNESS_LAST_BREAK, String(nowTimestamp));
    setSnoozeUntilTimestamp(null);
    localStorage.removeItem(STORAGE_KEY_WELLNESS_SNOOZE);
    setWellnessPopupOpen(false);

    setToastMessage({ text: action === 'done' ? 'Break logged! Rest up & stay hydrated.' : 'Break skipped.' });
  }, []);

  const snoozeWellnessBreak = useCallback((minutes: number) => {
    const snoozeUntil = Date.now() + minutes * 60 * 1000;
    setSnoozeUntilTimestamp(snoozeUntil);
    localStorage.setItem(STORAGE_KEY_WELLNESS_SNOOZE, String(snoozeUntil));
    setWellnessPopupOpen(false);
    setToastMessage({ text: `Break snoozed for ${minutes} minutes` });
  }, []);

  const triggerManualBreak = useCallback(() => {
    setWellnessPopupOpen(true);
  }, []);

  const closeWellnessPopup = useCallback(() => {
    setWellnessPopupOpen(false);
  }, []);

  // Feature 2: IDP Log Handlers
  const deleteIdpLog = useCallback((id: string) => {
    setIdpLogs((prev) => {
      const next = prev.filter((l) => l.id !== id);
      saveIdpLogs(next);
      return next;
    });
    setToastMessage({ text: 'IDP log entry removed' });
  }, []);

  const clearIdpLogs = useCallback(() => {
    setIdpLogs([]);
    saveIdpLogs([]);
    setToastMessage({ text: 'All IDP logs cleared' });
  }, []);

  // Feature 3: Focus Mode Handlers
  const setFocusMode = useCallback(
    (val: boolean) => {
      setFocusModeState(val);
      updateSettings((prev) => ({
        ...prev,
        hosting: {
          ...prev.hosting,
          focusMode: val,
        },
      }));
      setToastMessage({ text: val ? 'Focus Mode Activated' : 'Exited Focus Mode' });
    },
    [updateSettings]
  );

  const resetAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_DATA);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
    localStorage.removeItem(STORAGE_KEY_NOTIFS);
    localStorage.removeItem(STORAGE_KEY_WEEKLY_PAYMENTS);
    localStorage.removeItem(STORAGE_KEY_IDP_LOGS);
    localStorage.removeItem(STORAGE_KEY_WELLNESS_SETTINGS);
    localStorage.removeItem(STORAGE_KEY_WELLNESS_DAILY);
    localStorage.removeItem(STORAGE_KEY_WELLNESS_LAST_BREAK);
    localStorage.removeItem(STORAGE_KEY_WELLNESS_SNOOZE);
    window.location.reload();
  }, []);

  const refreshTimeAndStatus = useCallback(() => {
    const ist = getISTDate();
    let hours = ist.getHours();
    const minutes = String(ist.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    setLastUpdatedTime(`${hours}:${minutes} ${ampm}`);
    setToastMessage({ text: 'Dashboard refreshed' });
  }, []);

  const hostingMode = settings.hosting.hostingMode;
  const setHostingMode = useCallback(
    (val: boolean) => {
      updateSettings((prev) => ({
        ...prev,
        hosting: {
          ...prev.hosting,
          hostingMode: val,
        },
      }));
    },
    [updateSettings]
  );

  return (
    <AppContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        activeTab,
        setActiveTab,
        allDailyData,
        currentDailyData,
        settings,
        updateSettings,
        weeklyPaymentStatuses,
        setWeeklyPaymentStatus,
        toggleWeeklyPaymentStatus,
        currentMatch,
        nextMatch,
        secondsToNextMatch,
        streakDays,
        isOnline,
        notifications,
        unreadNotificationCount,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        completeMatch,
        cancelMatch,
        uncancelMatch,
        undoMatchAction,
        togglePinMatch,
        setExtraMatches,
        setManualCountOverride,
        setMatchSequentialOverride,
        setDailyNotes,
        generateScheduleForDate,
        getIdpUrl: getIdpUrlForMatch,
        getWinUrl: getWinUrlForMatch,
        openIdp,
        openWinning,
        executeProofWorkflow,
        copyProofAction,
        shareProofAction,
        copyMatchNumber,
        copyMatch,
        importDataBackup,
        resetAllData,
        refreshTimeAndStatus,
        lastUpdatedTime,
        toastMessage,
        setToastMessage,
        selectedMatchForDetail,
        setSelectedMatchForDetail,
        hostingMode,
        setHostingMode,
        // Feature 1: Wellness
        wellnessSettings,
        updateWellnessSettings,
        wellnessTodayData,
        wellnessDailyHistory,
        wellnessStreak,
        wellnessPopupOpen,
        secondsToNextBreak,
        nextBreakTimeFormatted,
        markWellnessItem,
        recordBreakAction,
        snoozeWellnessBreak,
        triggerManualBreak,
        closeWellnessPopup,
        // Feature 2: IDP Logs
        idpLogs,
        deleteIdpLog,
        clearIdpLogs,
        // Feature 3: Focus Mode
        focusMode,
        setFocusMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
