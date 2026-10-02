import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Radio,
  X,
  ExternalLink,
  Trophy,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  FileCheck,
  Clock,
  IndianRupee,
  Layers,
} from 'lucide-react';
import { formatSecondsCountdown } from '../utils/ist';
import { formatMatchSequentialDisplay } from '../utils/matchGenerator';
import { CancelConfirmModal } from './CancelConfirmModal';

export const HostingModeView: React.FC = () => {
  const {
    currentMatch,
    nextMatch,
    secondsToNextMatch,
    currentDailyData,
    openIdp,
    openWinning,
    completeMatch,
    cancelMatch,
    copyMatch,
    executeProofWorkflow,
    setHostingMode,
  } = useApp();

  const [copied, setCopied] = React.useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = React.useState(false);

  const handleCopy = async () => {
    if (!currentMatch) return;
    const success = await copyMatch(currentMatch);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const totalRegular = currentDailyData.schedule?.totalRegularMatches || 49;
  const completed = currentDailyData.completedCount || 0;
  const totalEarnings = currentDailyData.totalEarnings || 0;

  return (
    <div className="min-h-screen bg-[var(--background)] text-slate-900 dark:text-slate-100 p-4 sm:p-6 flex flex-col justify-between max-w-2xl mx-auto space-y-4 transition-colors">
      {/* Top Banner with Exit Button */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white/80 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            HOSTING MODE ACTIVE
          </span>
        </div>

        <button
          onClick={() => setHostingMode(false)}
          className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition-all flex items-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          <span>EXIT HOSTING MODE</span>
        </button>
      </div>

      {/* Main Focus Area: Current Match */}
      {currentMatch ? (
        <div className="rounded-3xl p-6 bg-white/85 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xl backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">
              CURRENT MATCH · MATCH #{currentMatch.slot + 1}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {currentMatch.time}
            </span>
          </div>

          {/* Big Match Number & Sequential Hosting Count */}
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-4xl sm:text-6xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
                  {currentMatch.matchNumber}
                </span>
                <span className="text-xl sm:text-2xl font-extrabold font-mono text-teal-600 dark:text-teal-400 bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/25 dark:border-teal-500/30 px-3 py-1 rounded-2xl">
                  {formatMatchSequentialDisplay(currentMatch)}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                Status:{' '}
                <span className="font-bold text-teal-600 dark:text-teal-400">
                  {currentMatch.isCompleted ? 'COMPLETED (+₹3)' : currentMatch.isCancelled ? 'CANCELLED' : 'IN PROGRESS'}
                </span>
              </p>
            </div>

            <button
              onClick={handleCopy}
              title="Copy Match Number & #Count (e.g. 112233#1)"
              className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              {copied ? <Check className="w-6 h-6 text-emerald-500" /> : <Copy className="w-6 h-6" />}
            </button>
          </div>

          {/* Large Action Buttons for Mobile Thumbs */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => openIdp(currentMatch)}
              className="py-4 px-4 rounded-2xl text-sm font-extrabold bg-sky-500/15 hover:bg-sky-500/25 text-sky-700 dark:text-sky-300 border border-sky-500/30 dark:border-sky-500/40 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span>IDP PAGE</span>
            </button>

            <button
              onClick={() => openWinning(currentMatch)}
              className="py-4 px-4 rounded-2xl text-sm font-extrabold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 dark:border-amber-500/40 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Trophy className="w-4 h-4" />
              <span>WIN</span>
            </button>

            <button
              onClick={() => completeMatch(currentMatch.id)}
              disabled={currentMatch.isCompleted}
              className={`py-4 px-4 rounded-2xl text-sm font-extrabold transition-all flex items-center justify-center gap-2 active:scale-95 ${
                currentMatch.isCompleted
                  ? 'bg-emerald-500/20 text-emerald-500/50 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{currentMatch.isCompleted ? 'COMPLETED' : 'COMPLETE (+₹3)'}</span>
            </button>

            <button
              onClick={() => setConfirmCancelOpen(true)}
              disabled={currentMatch.isCancelled}
              className={`py-4 px-4 rounded-2xl text-sm font-extrabold transition-all flex items-center justify-center gap-2 active:scale-95 ${
                currentMatch.isCancelled
                  ? 'bg-rose-500/20 text-rose-500/50 cursor-not-allowed'
                  : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-500/30 dark:border-rose-500/40'
              }`}
            >
              <XCircle className="w-5 h-5" />
              <span>{currentMatch.isCancelled ? 'CANCELLED' : 'CANCEL'}</span>
            </button>
          </div>

          {/* Quick Proof Workflow */}
          <button
            onClick={() => executeProofWorkflow(currentMatch)}
            className="w-full py-3 px-4 rounded-2xl text-xs font-bold bg-teal-500/15 hover:bg-teal-500/25 text-teal-700 dark:text-teal-300 border border-teal-500/30 dark:border-teal-500/40 transition-all flex items-center justify-center gap-2"
          >
            <FileCheck className="w-4 h-4" />
            <span>Copy Proof & Complete Match</span>
          </button>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-white/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">All regular matches completed</p>
        </div>
      )}

      {/* Next Match Bar */}
      {nextMatch && (
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              NEXT MATCH (#{nextMatch.slot + 1})
            </span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
              #{nextMatch.matchNumber} · {nextMatch.time}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Starts in</span>
            <span className="text-lg font-extrabold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
              {formatSecondsCountdown(secondsToNextMatch)}
            </span>
          </div>
        </div>
      )}

      {/* Bottom Summary Bar */}
      <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-center">
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block">TODAY'S PROGRESS</span>
          <span className="text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">
            {completed} / {totalRegular}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block">TODAY'S EARNINGS</span>
          <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
            ₹{totalEarnings}
          </span>
        </div>
      </div>

      {/* Cancel Confirmation Modal with optional reason */}
      {currentMatch && (
        <CancelConfirmModal
          isOpen={confirmCancelOpen}
          match={currentMatch}
          onConfirm={(reason) => {
            setConfirmCancelOpen(false);
            cancelMatch(currentMatch.id, reason);
          }}
          onCancel={() => setConfirmCancelOpen(false)}
        />
      )}
    </div>
  );
};
