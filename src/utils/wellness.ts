import { WellnessSettings, WellnessChecklistDay, WellnessLogEntry, MealTime } from '../types';
import { getISTDate, getISTDateString, formatISTTime } from './ist';

export const STORAGE_KEY_WELLNESS_SETTINGS = 'ff_wellness_settings_v1';
export const STORAGE_KEY_WELLNESS_DAILY = 'ff_wellness_daily_v1';
export const STORAGE_KEY_WELLNESS_LAST_BREAK = 'ff_wellness_last_break_v1';
export const STORAGE_KEY_WELLNESS_SNOOZE = 'ff_wellness_snooze_until_v1';

export const DEFAULT_WELLNESS_SETTINGS: WellnessSettings = {
  enabled: true,
  breakIntervalMinutes: 120, // 2 hours
  breakIntervalType: '2h',
  foodEnabled: true,
  mealTimes: [
    { id: 'meal_1', time: '13:00', label: 'Lunch', enabled: true },
    { id: 'meal_2', time: '17:00', label: 'Evening Snack', enabled: true },
    { id: 'meal_3', time: '20:30', label: 'Dinner', enabled: true },
  ],
  waterEnabled: true,
  waterIntervalMinutes: 60, // 1 hour
  restEnabled: true,
  restDurationMinutes: 10,
  restIntervalMinutes: 120,
  soundEnabled: true,
  sound: 'bell',
  vibration: true,
};

export function loadWellnessSettings(): WellnessSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WELLNESS_SETTINGS);
    if (raw) {
      return { ...DEFAULT_WELLNESS_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load wellness settings:', e);
  }
  return DEFAULT_WELLNESS_SETTINGS;
}

export function saveWellnessSettings(settings: WellnessSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_WELLNESS_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save wellness settings:', e);
  }
}

export function loadWellnessDailyData(): Record<string, WellnessChecklistDay> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WELLNESS_DAILY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load wellness daily data:', e);
  }
  return {};
}

export function saveWellnessDailyData(data: Record<string, WellnessChecklistDay>): void {
  try {
    localStorage.setItem(STORAGE_KEY_WELLNESS_DAILY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save wellness daily data:', e);
  }
}

export function getOrCreateWellnessDay(
  allData: Record<string, WellnessChecklistDay>,
  dateStr: string = getISTDateString()
): WellnessChecklistDay {
  if (allData[dateStr]) {
    return allData[dateStr];
  }
  return {
    date: dateStr,
    foodDone: false,
    waterDone: false,
    waterCount: 0,
    restDone: false,
    breaksTaken: 0,
    breaksSkipped: 0,
    logs: [],
  };
}

/**
 * Calculates streak of consecutive days where all three (food, water, rest) were completed
 */
export function calculateWellnessStreak(allData: Record<string, WellnessChecklistDay>): number {
  const dates = Object.keys(allData).sort().reverse();
  let streak = 0;
  const today = getISTDateString();

  for (const d of dates) {
    const entry = allData[d];
    if (entry.foodDone && entry.waterDone && entry.restDone) {
      streak++;
    } else if (d === today) {
      // If today is in progress, do not break streak
      continue;
    } else {
      break;
    }
  }
  return streak;
}
