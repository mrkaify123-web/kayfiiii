import { Match } from '../types';
import { formatDateDisplay } from './ist';

export interface ProofDetails {
  date: string;
  time: string;
  matchNumber: string;
  matchCount: number;
  status: string;
  earning: number;
}

export function generateProofText(match: Match, matchCount?: number): string {
  const dateFormatted = formatDateDisplay(match.date);
  const statusText = match.isCompleted ? 'COMPLETED' : match.isCancelled ? 'CANCELLED' : match.status;
  const countStr = match.sequentialCount != null ? `#${match.sequentialCount}` : (matchCount != null ? `#${matchCount}` : `#${match.slot + 1}`);

  return [
    `🎮 FREE FIRE HOSTING PROOF`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📅 Date: ${dateFormatted}`,
    `🕒 Time: ${match.time} (IST)`,
    `🔢 Match Number: #${match.matchNumber}`,
    `🎯 Sequential Count: ${countStr}`,
    `⚡ Status: ${statusText}`,
    `💰 Earning: ₹${match.earning}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Hosted via FF Hosting Manager`,
  ].join('\n');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older environments
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

export async function shareProof(text: string, title = 'Free Fire Match Proof'): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title,
        text,
      });
      return true;
    } catch {
      // User cancelled or share failed, fallback to copy
      return copyToClipboard(text);
    }
  } else {
    return copyToClipboard(text);
  }
}
