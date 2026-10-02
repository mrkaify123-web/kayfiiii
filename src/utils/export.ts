import { AppSettings, DailyData } from '../types';

export function downloadJsonFile(data: unknown, filename: string) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCsvFile(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Builds CSV export according to section 55:
 * Columns: Date, Time, Match Number, Status, Completed, Cancelled, Regular Earning, Extra Earning, Total Earning
 */
export function generateCsvData(allDailyData: Record<string, DailyData>): string {
  const headers = [
    'Date',
    'Time',
    'Match Number',
    'Status',
    'Completed',
    'Cancelled',
    'Regular Earning',
    'Extra Earning',
    'Total Earning',
  ];

  const rows: string[] = [headers.join(',')];

  // Sort dates descending
  const sortedDates = Object.keys(allDailyData).sort().reverse();

  for (const date of sortedDates) {
    const daily = allDailyData[date];
    if (!daily || !daily.matches) continue;

    // Output all matches for the day
    daily.matches.forEach((match) => {
      const row = [
        `"${match.date}"`,
        `"${match.time}"`,
        `"${match.matchNumber}"`,
        `"${match.status}"`,
        match.isCompleted ? 'YES' : 'NO',
        match.isCancelled ? 'YES' : 'NO',
        match.earning,
        0, // Extra per match row
        match.earning,
      ];
      rows.push(row.join(','));
    });

    // If day has extra matches, add summary extra rows
    if (daily.extraMatches > 0) {
      const extraRow = [
        `"${daily.date}"`,
        `"EXTRA MATCHES"`,
        `"Count: ${daily.extraMatches}"`,
        `"COMPLETED"`,
        'YES',
        'NO',
        0,
        daily.extraEarnings,
        daily.extraEarnings,
      ];
      rows.push(extraRow.join(','));
    }
  }

  return rows.join('\n');
}

export interface BackupPayload {
  version: string;
  exportedAt: string;
  allDailyData: Record<string, DailyData>;
  settings: AppSettings;
}
