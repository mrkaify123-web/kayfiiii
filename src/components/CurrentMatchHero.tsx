import React, { useState } from 'react';
import { Match } from '../types';
import { useApp } from '../context/AppContext';
import {
  ExternalLink,
  Trophy,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  FileCheck,
  Pin,
  Share2,
} from 'lucide-react';
import { CancelConfirmModal } from './CancelConfirmModal';

import { formatMatchSequentialDisplay } from '../utils/matchGenerator';

interface CurrentMatchHeroProps {
  match: Match | null;
  matchCount: number;
}

export const CurrentMatchHero: React.FC<CurrentMatchHeroProps> = ({ match, matchCount }) => {
  const {
    openIdp,
    openWinning,
    completeMatch,
    cancelMatch,
    executeProofWorkflow,
    copyMatch,
    togglePinMatch,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  if (!match) {
    return (
      <div className="rounded-3xl p-6 bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md text-center py-10 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-500 mx-auto flex items-center justify-center mb-3">
          <Trophy className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
          All Regular Matches Completed
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Great job! Today's regular schedule is done. You can add extra matches or review today's earnings.
        </p>
      </div>
    );
  }

  const handleCopy = async () => {
    const success = await copyMatch(match);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusColor = () => {
    if (match.isCompleted) return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    if (match.isCancelled) return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
    if (match.status === 'CURRENT') return 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30 animate-pulse';
    if (match.status === 'STARTING_SOON') return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
    return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30';
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl p-4 sm:p-6 bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 shadow-md backdrop-blur-xl transition-all">
        {/* Subtle decorative accent glow */}
        <div
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: 'var(--primary-accent, #14b8a6)' }}
        />

        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full text-white shadow-xs"
              style={{ backgroundColor: 'var(--primary-accent, #14b8a6)' }}
            >
              CURRENT MATCH
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Match #{match.slot + 1}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getStatusColor()}`}
            >
              {match.status}
            </span>

            <button
              onClick={() => togglePinMatch(match.id)}
              title={match.isPinned ? 'Unpin match' : 'Pin match'}
              className={`p-1.5 rounded-lg transition-colors ${
                match.isPinned
                  ? 'text-teal-500 bg-teal-500/10'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Pin className={`w-3.5 h-3.5 ${match.isPinned ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Big Match Number & Time Banner */}
        <div className="py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums font-mono">
                {match.matchNumber}
              </span>
              <span className="text-base sm:text-xl font-extrabold font-mono text-teal-600 dark:text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-xl">
                {formatMatchSequentialDisplay(match)}
              </span>
              <button
                onClick={handleCopy}
                title="Copy Match Number & #Count (e.g. 112233#1)"
                className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0 flex items-center gap-1 text-xs font-bold"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span className="text-[11px] hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1.5">
              <span className="text-slate-700 dark:text-slate-300 font-bold">{match.time}</span>
              <span>·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {match.isCompleted ? `Earned: ₹${match.earning}` : match.isCancelled ? '₹0' : 'Worth: ₹3'}
              </span>
              {match.isCancelled && match.cancelReason && (
                <>
                  <span>·</span>
                  <span className="text-[11px] font-semibold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">
                    {match.cancelReason}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick Proof Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => executeProofWorkflow(match)}
              title="Run Proof & Complete workflow"
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-slate-800 dark:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 transition-all border border-slate-200/50 dark:border-slate-700/50 shadow-xs"
            >
              <FileCheck className="w-4 h-4 text-teal-500" />
              <span>Proof Workflow</span>
            </button>
          </div>
        </div>

        {/* 4 Primary Action Buttons in 2x2 Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {/* IDP Button */}
          <button
            onClick={() => openIdp(match)}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 transition-all active:scale-[0.98]"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>IDP</span>
          </button>

          {/* WIN Button */}
          <button
            onClick={() => openWinning(match)}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-all active:scale-[0.98]"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>WIN</span>
          </button>

          {/* COMPLETE Button */}
          <button
            onClick={() => completeMatch(match.id)}
            disabled={match.isCompleted}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all active:scale-[0.98] ${
              match.isCompleted
                ? 'bg-emerald-500/10 text-emerald-500/60 border border-emerald-500/10 cursor-not-allowed'
                : 'bg-emerald-500 text-white shadow-xs hover:bg-emerald-600'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{match.isCompleted ? 'COMPLETED' : 'COMPLETE (+₹3)'}</span>
          </button>

          {/* CANCEL Button */}
          <button
            onClick={() => setConfirmCancelOpen(true)}
            disabled={match.isCancelled}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all active:scale-[0.98] ${
              match.isCancelled
                ? 'bg-rose-500/10 text-rose-500/60 border border-rose-500/10 cursor-not-allowed'
                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>{match.isCancelled ? 'CANCELLED' : 'CANCEL'}</span>
          </button>
        </div>
      </div>

      {/* Cancel Confirmation Modal with optional reason */}
      <CancelConfirmModal
        isOpen={confirmCancelOpen}
        match={match}
        onConfirm={(reason) => {
          setConfirmCancelOpen(false);
          cancelMatch(match.id, reason);
        }}
        onCancel={() => setConfirmCancelOpen(false)}
      />
    </>
  );
};
