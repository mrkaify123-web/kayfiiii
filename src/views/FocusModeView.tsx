import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Radio,
  ExternalLink,
  Trophy,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Zap,
  IndianRupee,
  Layers,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { formatSecondsCountdown, formatISTTime } from '../utils/ist';
import { formatMatchSequentialDisplay } from '../utils/matchGenerator';
import { CancelConfirmModal } from '../components/CancelConfirmModal';

export const FocusModeView: React.FC = () => {
  const {
    currentMatch,
    nextMatch,
    secondsToNextMatch,
    currentDailyData,
    settings,
    openIdp,
    openWinning,
    completeMatch,
    cancelMatch,
    copyMatch,
    setFocusMode,
  } = useApp();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cancelModalMatchId, setCancelModalMatchId] = useState<string | null>(null);

  const isAmoled = settings.hosting.focusModeAmoled;

  // Keyboard shortcut: Esc to exit Focus Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setFocusMode]);

  const handleCopy = async (match: any) => {
    const success = await copyMatch(match);
    if (success) {
      setCopiedId(match.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleConfirmCancel = (reason?: string) => {
    if (cancelModalMatchId) {
      cancelMatch(cancelModalMatchId, reason || 'Match Cancelled');
      setCancelModalMatchId(null);
    }
  };

  const completed = currentDailyData.completedCount || 0;
  const totalEarnings = currentDailyData.totalEarnings || 0;
  const target = settings.hosting.dailyTarget || 147;
  const progressPercent = Math.min(100, Math.round((totalEarnings / target) * 100));

  const currentTimeIST = formatISTTime(undefined, false);

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 flex flex-col justify-between max-w-2xl mx-auto transition-colors ${
        isAmoled
          ? 'bg-black text-white'
          : 'bg-[var(--app-background,#f2fbf9)] text-slate-900 dark:text-slate-100'
      }`}
    >
      {/* 1. Top Bar */}
      <div
        className={`flex items-center justify-between p-3.5 rounded-2xl border shadow-xs backdrop-blur-xl ${
          isAmoled
            ? 'bg-neutral-950/90 border-neutral-800'
            : 'bg-white/80 dark:bg-slate-900/85 border-slate-200/80 dark:border-slate-800/80'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-500 flex items-center justify-center font-bold">
            <Zap className="w-4 h-4 fill-teal-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                FOCUS MODE
              </span>
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Live IST: {currentTimeIST}
            </span>
          </div>
        </div>

        {/* Exit Focus Mode Button */}
        <button
          onClick={() => setFocusMode(false)}
          className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <X className="w-3.5 h-3.5" />
          <span>Exit Focus</span>
        </button>
      </div>

      {/* 2. Main Match Arena: Current Match Hero & Next Match */}
      <div className="my-auto py-4 space-y-4">
        {/* CURRENT MATCH CARD */}
        {currentMatch ? (
          <div
            className={`rounded-3xl p-5 sm:p-6 border-2 border-teal-500/50 shadow-lg space-y-4 ${
              isAmoled
                ? 'bg-neutral-950 border-teal-500/60'
                : 'bg-white/90 dark:bg-slate-900/90'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full text-white bg-teal-600 dark:bg-teal-500">
                    CURRENT MATCH
                  </span>
                  <span className="text-xs font-bold font-mono text-slate-500">
                    Slot {currentMatch.slot + 1}
                  </span>
                </div>

                {/* Match Number & Sequential Count */}
                <div className="flex items-baseline gap-2.5 mt-2">
                  <span className="text-3xl sm:text-5xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
                    #{currentMatch.matchNumber}
                  </span>
                  <span className="text-lg sm:text-2xl font-extrabold text-teal-600 dark:text-teal-400">
                    {formatMatchSequentialDisplay(currentMatch)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-teal-500" />
                  <span>Time: <strong>{currentMatch.time}</strong></span>
                  <span>·</span>
                  <span className="text-emerald-500 font-semibold">Active Now</span>
                </div>
              </div>

              {/* Status Badge */}
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                {currentMatch.status}
              </span>
            </div>

            {/* 5 Full Action Buttons: IDP, WIN, COPY, COMPLETE, CANCEL */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {/* IDP */}
              <button
                onClick={() => openIdp(currentMatch)}
                className="py-2.5 px-2 rounded-xl text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-500/15 hover:bg-sky-500/25 transition-all flex flex-col sm:flex-row items-center justify-center gap-1 active:scale-95"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                <span>IDP</span>
              </button>

              {/* WIN */}
              <button
                onClick={() => openWinning(currentMatch)}
                className="py-2.5 px-2 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 hover:bg-amber-500/25 transition-all flex flex-col sm:flex-row items-center justify-center gap-1 active:scale-95"
              >
                <Trophy className="w-4 h-4 shrink-0" />
                <span>WIN</span>
              </button>

              {/* COPY */}
              <button
                onClick={() => handleCopy(currentMatch)}
                className="py-2.5 px-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all flex flex-col sm:flex-row items-center justify-center gap-1 active:scale-95"
              >
                {copiedId === currentMatch.id ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{copiedId === currentMatch.id ? 'Copied' : 'COPY'}</span>
              </button>

              {/* COMPLETE (one-tap, no confirmation) */}
              <button
                onClick={() => completeMatch(currentMatch.id)}
                className="py-2.5 px-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex flex-col sm:flex-row items-center justify-center gap-1 shadow-xs active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Done</span>
              </button>

              {/* CANCEL (with confirmation) */}
              <button
                onClick={() => setCancelModalMatchId(currentMatch.id)}
                className="py-2.5 px-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/15 transition-all flex flex-col sm:flex-row items-center justify-center gap-1 active:scale-95"
              >
                <XCircle className="w-4 h-4 shrink-0" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`rounded-3xl p-6 border text-center space-y-2 ${
              isAmoled
                ? 'bg-neutral-950 border-neutral-800'
                : 'bg-white/80 dark:bg-slate-900/80 border-slate-200'
            }`}
          >
            <Clock className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No match currently ongoing
            </h3>
            <p className="text-xs text-slate-400">
              Your next match will appear below with live countdown.
            </p>
          </div>
        )}

        {/* NEXT MATCH CARD */}
        {nextMatch && (
          <div
            className={`rounded-3xl p-5 border shadow-sm space-y-3 ${
              isAmoled
                ? 'bg-neutral-950/70 border-neutral-800'
                : 'bg-white/70 dark:bg-slate-900/70 border-slate-200/80 dark:border-slate-800/80'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  NEXT MATCH
                </span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  #{nextMatch.matchNumber} ({formatMatchSequentialDisplay(nextMatch)})
                </span>
              </div>

              {/* Live Countdown */}
              <div className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-mono font-extrabold text-sm">
                <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                <span>{formatSecondsCountdown(secondsToNextMatch)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">
                Scheduled: <strong>{nextMatch.time}</strong>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openIdp(nextMatch)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-sky-600 bg-sky-500/10 hover:bg-sky-500/20"
                >
                  IDP
                </button>
                <button
                  onClick={() => handleCopy(nextMatch)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800"
                >
                  {copiedId === nextMatch.id ? 'Copied' : 'COPY'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Small Bottom Bar: Completed Count & Today's Earnings */}
      <div
        className={`p-3.5 rounded-2xl border shadow-xs flex items-center justify-between text-xs backdrop-blur-xl ${
          isAmoled
            ? 'bg-neutral-950 border-neutral-800'
            : 'bg-white/80 dark:bg-slate-900/85 border-slate-200/80 dark:border-slate-800/80'
        }`}
      >
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Completed</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 tabular-nums">
              {completed} Matches
            </span>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Earnings</span>
            <span className="text-sm font-extrabold text-teal-600 dark:text-teal-400 tabular-nums">
              ₹{totalEarnings}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            Target: ₹{target} ({progressPercent}%)
          </span>
          <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mt-1">
            <div
              className="h-full rounded-full bg-teal-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalMatchId && (
        <CancelConfirmModal
          isOpen={true}
          match={
            (cancelModalMatchId === currentMatch?.id ? currentMatch : null) ||
            (cancelModalMatchId === nextMatch?.id ? nextMatch : null) ||
            currentDailyData.matches.find((m) => m.id === cancelModalMatchId) ||
            null
          }
          onConfirm={handleConfirmCancel}
          onCancel={() => setCancelModalMatchId(null)}
        />
      )}
    </div>
  );
};
