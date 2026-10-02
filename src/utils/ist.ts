/**
 * IST (Asia/Kolkata, UTC+5:30) Date and Time Utilities
 * Guaranteed consistent calculation regardless of the client machine's local timezone.
 */

const IST_OFFSET_MINUTES = 330; // 5 hours 30 minutes

/**
 * Returns current Date adjusted to IST time components
 */
export function getISTDate(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + IST_OFFSET_MINUTES * 60000);
}

/**
 * Returns YYYY-MM-DD string in IST
 */
export function getISTDateString(date: Date = getISTDate()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts a 24-hour time "HH:mm" to 12-hour "hh:mm A" (e.g., "10:00" -> "10:00 AM")
 */
export function format24To12Hour(time24: string): string {
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

/**
 * Formats an IST Date to "hh:mm:ss A" or "hh:mm A"
 */
export function formatISTTime(date: Date = getISTDate(), includeSeconds = false): string {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  if (includeSeconds) {
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds} ${ampm}`;
  }
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Formats "YYYY-MM-DD" to human readable "30 Sep 2026, Wednesday"
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return date.toLocaleDateString('en-US', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    weekday: 'short',
  });
}

/**
 * Parses "HH:mm" to total minutes since midnight
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map((x) => parseInt(x, 10) || 0);
  return h * 60 + m;
}

/**
 * Formats minutes from midnight to "HH:mm"
 */
export function formatMinutesTo24Hour(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Calculates schedule slots between startTime and endTime with given interval
 */
export function calculateScheduleSlots(
  startTime: string = '10:00',
  endTime: string = '22:00',
  intervalMinutes: number = 15
): { time24: string; time12: string; minutes: number }[] {
  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);

  const safeInterval = Math.max(1, intervalMinutes);
  const slots: { time24: string; time12: string; minutes: number }[] = [];

  let current = startMin;
  while (current <= endMin) {
    const time24 = formatMinutesTo24Hour(current);
    const time12 = format24To12Hour(time24);
    slots.push({
      time24,
      time12,
      minutes: current,
    });
    current += safeInterval;
  }

  return slots;
}

/**
 * Returns current IST minutes since midnight
 */
export function getISTCurrentMinutes(): number {
  const istDate = getISTDate();
  return istDate.getHours() * 60 + istDate.getMinutes();
}

/**
 * Formats seconds into MM:SS
 */
export function formatSecondsCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00';
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
