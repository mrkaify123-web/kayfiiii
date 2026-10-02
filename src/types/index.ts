export type MatchStatus = 'UPCOMING' | 'STARTING_SOON' | 'CURRENT' | 'COMPLETED' | 'CANCELLED';

export interface Match {
  id: string;
  date: string; // YYYY-MM-DD (IST)
  time: string; // "10:00 AM"
  time24: string; // "10:00"
  matchNumber: string; // e.g. "332212"
  slot: number; // 0 to N-1
  sequentialCount?: number | null; // e.g. 1 for #1, null if cancelled
  sequentialOverride?: number | null; // Manual sequential override
  status: MatchStatus;
  earning: number; // ₹3 if completed, 0 if cancelled/upcoming
  isCompleted: boolean;
  isCancelled: boolean;
  cancelReason?: string;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface DailyScheduleConfig {
  startTime: string; // "10:00"
  endTime: string; // "22:00"
  intervalMinutes: number; // 15
  base10AM: string; // "332212"
  base11AM: string; // "336612"
  overwrite1115?: string;
  overwrite1130?: string;
  overwrite1145?: string;
  startCount?: number; // Starting sequential count (default: 1)
  totalRegularMatches: number; // 49
  seed1?: string;
  seed2?: string;
  seed3?: string;
  seed4?: string;
}

export interface DailyData {
  date: string; // YYYY-MM-DD
  schedule: DailyScheduleConfig;
  matches: Match[];
  extraMatches: number;
  extraMatchesNotes?: string;
  manualCountOverride?: number | null;
  notes?: string;
  completedCount: number;
  cancelledCount: number;
  regularEarnings: number;
  extraEarnings: number;
  totalEarnings: number;
}

export type PastelThemeName =
  | 'Sky Blue'
  | 'Mint'
  | 'Aqua'
  | 'Teal'
  | 'Peach'
  | 'Coral'
  | 'Soft Pink'
  | 'Sage'
  | 'Warm Yellow'
  | 'Soft Orange'
  | 'Cream'
  | 'Beige'
  | 'Ocean Blue'
  | 'Soft Green';

export interface ThemeConfig {
  name: PastelThemeName;
  primary: string; // Primary hex
  primaryLight: string;
  primaryDark: string;
  bgLight: string;
  cardLight: string;
  cardDark: string;
  accentSoft: string;
}

export interface AppNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'info' | 'match' | 'earning' | 'alert';
  isRead: boolean;
  matchNumber?: string;
}

export interface AppSettings {
  appearance: {
    mode: 'light' | 'dark';
    pastelTheme: PastelThemeName;
    customAccentColor: string | null;
    pastelBackground?: string | null;
  };
  notifications: {
    enabled: boolean;
    notifyBeforeMinutes: number;
    sound: 'default' | 'soft' | 'bell' | 'none';
    vibration: boolean;
  };
  hosting: {
    defaultStartTime: string;
    defaultEndTime: string;
    defaultInterval: number;
    earningRate: number; // ₹3
    dailyTarget: number; // ₹147
    hostingMode: boolean;
    adminBaseUrl: string; // Legacy fallback
    idpBaseUrl: string; // Default: 'https://skillclash.site/admin2020/matches/edit/'
    winningBaseUrl: string; // Default: 'https://skillclash.site/admin2020/matches/member_join_match/'
    focusMode?: boolean;
    focusModeAmoled?: boolean;
    focusModeAutoEnable?: boolean;
    focusModeAutoMinutes?: number;
  };
  display: {
    density: 'comfortable' | 'compact';
    autoScrollToCurrent: boolean;
    widgets: {
      currentMatch: boolean;
      nextMatch: boolean;
      todayEarnings: boolean;
      todayProgress: boolean;
      dailyTarget: boolean;
      quickActions: boolean;
      extraMatches: boolean;
      statistics: boolean;
      recentActivity: boolean;
    };
  };
}

export type ActiveTab =
  | 'home'
  | 'matches'
  | 'earnings'
  | 'calendar'
  | 'wellness'
  | 'idplog'
  | 'settings'
  | 'stats'
  | 'history'
  | 'setup';

// =======================
// WELLNESS / BREAK TYPES
// =======================
export interface MealTime {
  id: string;
  time: string; // "13:00" or "01:00 PM"
  label: string; // e.g. "Lunch", "Evening Snack", "Dinner"
  enabled: boolean;
}

export interface WellnessSettings {
  enabled: boolean;
  breakIntervalMinutes: number; // default 120 (2h) or 180 (3h)
  breakIntervalType: '2h' | '3h' | 'custom';
  foodEnabled: boolean;
  mealTimes: MealTime[];
  waterEnabled: boolean;
  waterIntervalMinutes: number; // default 60
  restEnabled: boolean;
  restDurationMinutes: number; // default 10
  restIntervalMinutes: number; // default 120
  soundEnabled: boolean;
  sound: 'default' | 'soft' | 'bell' | 'none';
  vibration: boolean;
}

export interface WellnessLogEntry {
  id: string;
  timestamp: string; // ISO
  timeIST: string; // "02:15 PM"
  dateIST: string; // YYYY-MM-DD
  type: 'break' | 'food' | 'water' | 'rest' | 'snooze' | 'skip';
  message: string;
  checklist?: {
    food: boolean;
    water: boolean;
    rest: boolean;
  };
}

export interface WellnessChecklistDay {
  date: string; // YYYY-MM-DD (IST)
  foodDone: boolean;
  foodMarkedAt?: string;
  waterDone: boolean;
  waterMarkedAt?: string;
  waterCount?: number;
  restDone: boolean;
  restMarkedAt?: string;
  breaksTaken: number;
  breaksSkipped: number;
  logs: WellnessLogEntry[];
}

// =======================
// IDP TIME LOG TYPES
// =======================
export interface IdpLogEntry {
  id: string;
  matchId: string;
  date: string; // YYYY-MM-DD (IST)
  scheduledMatchTime: string; // "10:00 AM" / "10:00"
  scheduledMinutes: number;
  matchNumber: string; // "332212"
  sequentialCount?: number | null;
  idpClickTime: string; // "09:58:14 AM"
  idpClickTimestamp: number;
  differenceSeconds: number; // clickSeconds - scheduledSeconds
  diffType: 'early' | 'on_time' | 'late';
  diffFormatted: string; // "2 min early", "On time", "3 min late"
  matchType: 'REGULAR' | 'EXTRA';
  totalClicks: number;
  allClicks: string[]; // List of all click times (e.g. ["09:58:14 AM", "09:58:45 AM"])
  createdAt: string;
}

