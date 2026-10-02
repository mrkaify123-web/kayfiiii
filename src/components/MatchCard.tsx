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
  Pin,
  IndianRupee,
  Clock,
} from 'lucide-react';
import { CancelConfirmModal } from './CancelConfirmModal';
import { formatMatchSequentialDisplay } from '../utils/matchGenerator';

interface MatchCardProps {
  match: Match;
  isCurrent?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, isCurrent }) => {
  const {
    openIdp,
    openWinning,
    getIdpUrl,
    getWinUrl,
    completeMatch,
    cancelMatch,
    togglePinMatch,
    copyMatch,
    setSelectedMatchForDetail,
    settings,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const isCompact = settings.display.density === 'compact';

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyMatch(match);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadge = () => {
    if (match.isCompleted) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          COMPLETED (+₹{match.earning})
        </span>
      );
    }
    if (match.isCancelled) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
          CANCELLED (₹0)
        </span>
      );
    }
    if (isCurrent) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30 animate-pulse">
          CURRENT
        </span>
      );
    }
    if (match.status === 'STARTING_SOON') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          STARTING SOON
        </span>
      );
    }
    return (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
        UPCOMING
      </span>
    );
  };

  const countDisplay = formatMatchSequentialDisplay(match);

  return (
    <>
      <div
        onClick={() => setSelectedMatchForDetail(match)}
        className={`group relative rounded-2xl bg-white/80 dark:bg-slate-900/80 border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
          isCurrent
            ? 'border-teal-500/50 shadow-teal-500/5'
            : match.isCompleted
            ? 'border-slate-200/70 dark:border-slate-800/80 opacity-95'
            : match.isCancelled
            ? 'border-rose-200/50 dark:border-rose-950/40 opacity-70 bg-rose-50/20 dark:bg-rose-950/10'
            : 'border-slate-200/80 dark:border-slate-800/80'
        } ${isCompact ? 'p-3' : 'p-4'}`}
      >
        {/* Top Header: Time, Status, Earning, Pin */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {match.time}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Slot {match.slot + 1}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {getStatusBadge()}

            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePinMatch(match.id);
              }}
              title={match.isPinned ? 'Unpin' : 'Pin to top'}
              className={`p-1 rounded-lg transition-colors ${
                match.isPinned
                  ? 'text-teal-500 bg-teal-500/10'
                  : 'text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400'
              }`}
            >
              <Pin className={`w-3.5 h-3.5 ${match.isPinned ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Middle Row: Two Distinct Numbers (Match Number & Sequential Count) */}
        <div className="flex items-center justify-between gap-2 py-1.5">
          <div className="flex items-baseline gap-2.5">
            {/* 1. MATCH NUMBER */}
            <span className="text-lg sm:text-xl font-extrabold font-mono tracking-tight tabular-nums text-slate-900 dark:text-white">
              {match.matchNumber}
            </span>

            {/* 2. SEQUENTIAL HOSTING COUNT */}
            <span
              className={`text-xs sm:text-sm font-extrabold font-mono px-2 py-0.5 rounded-lg border ${
                match.isCancelled
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 line-through'
                  : match.isCompleted
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20'
              }`}
              title="Sequential Hosting Count (cancelling shifts active sequence)"
            >
              {countDisplay}
            </span>
          </div>

          {/* Earning pill */}
          <div className="flex flex-col items-end gap-0.5 text-xs font-extrabold font-mono tabular-nums">
            <span className={match.isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
              {match.isCompleted ? `+₹${match.earning}` : match.isCancelled ? '₹0' : '₹3'}
            </span>
            {match.isCancelled && match.cancelReason && (
              <span className="text-[10px] font-sans font-medium text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">
                {match.cancelReason}
              </span>
            )}
          </div>
        </div>

        {/* Buttons Row: IDP, WIN, COPY, COMPLETE, CANCEL */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-5 gap-1"
        >
          {/* IDP */}
          <button
            onClick={() => openIdp(match)}
            title={`Open IDP: ${getIdpUrl(match.matchNumber)}`}
            className="py-1.5 px-1.5 rounded-xl text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 transition-colors flex items-center justify-center gap-1 active:scale-95"
          >
            <ExternalLink className="w-3 h-3 shrink-0" />
            <span className="truncate">IDP</span>
          </button>

          {/* WIN */}
          <button
            onClick={() => openWinning(match)}
            title={`Open WIN: ${getWinUrl(match.matchNumber)}`}
            className="py-1.5 px-1.5 rounded-xl text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-colors flex items-center justify-center gap-1 active:scale-95"
          >
            <Trophy className="w-3 h-3 shrink-0" />
            <span className="truncate">WIN</span>
          </button>

          {/* COPY (Copies MatchNumber#Count e.g. 332212#1) */}
          <button
            onClick={handleCopy}
            title="Copy Match Number & #Count (e.g. 112233#1)"
            className={`py-1.5 px-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 active:scale-95 ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            {copied ? <Check className="w-3 h-3 text-white shrink-0" /> : <Copy className="w-3 h-3 shrink-0" />}
            <span className="truncate">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* COMPLETE */}
          <button
            onClick={() => completeMatch(match.id)}
            disabled={match.isCompleted}
            className={`py-1.5 px-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 active:scale-95 ${
              match.isCompleted
                ? 'bg-emerald-500/10 text-emerald-500/50 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span className="truncate">{match.isCompleted ? 'Done' : 'Done'}</span>
          </button>

          {/* CANCEL */}
          <button
            onClick={() => setConfirmCancelOpen(true)}
            disabled={match.isCancelled}
            className={`py-1.5 px-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 active:scale-95 ${
              match.isCancelled
                ? 'bg-rose-500/10 text-rose-500/50 cursor-not-allowed'
                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20'
            }`}
          >
            <XCircle className="w-3 h-3 shrink-0" />
            <span className="truncate">{match.isCancelled ? 'Canc' : 'Cancel'}</span>
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
