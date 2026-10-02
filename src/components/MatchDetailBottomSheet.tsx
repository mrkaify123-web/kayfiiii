import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  ExternalLink,
  Trophy,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  FileCheck,
  Share2,
  Calendar,
  Clock,
  Layers,
  IndianRupee,
} from 'lucide-react';
import { formatDateDisplay } from '../utils/ist';
import { formatMatchSequentialDisplay } from '../utils/matchGenerator';
import { CancelConfirmModal } from './CancelConfirmModal';
import { Pin, PinOff } from 'lucide-react';

export const MatchDetailBottomSheet: React.FC = () => {
  const {
    selectedMatchForDetail,
    setSelectedMatchForDetail,
    openIdp,
    openWinning,
    completeMatch,
    cancelMatch,
    uncancelMatch,
    copyMatch,
    copyProofAction,
    shareProofAction,
    executeProofWorkflow,
    togglePinMatch,
    idpLogs,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  if (!selectedMatchForDetail) return null;
  const match = selectedMatchForDetail;
  const matchIdpLog = idpLogs.find((l) => l.matchId === match.id);

  const handleCopy = async () => {
    const success = await copyMatch(match);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto -mt-2 mb-2 sm:hidden" />

        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              MATCH DETAILS
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <span className="font-mono tabular-nums">{match.matchNumber}</span>
              <span className="font-mono text-sm px-2.5 py-0.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 font-bold">
                {formatMatchSequentialDisplay(match)}
              </span>
              <button
                onClick={handleCopy}
                title="Copy match number & #count (e.g. 112233#1)"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => togglePinMatch(match.id)}
              title={match.isPinned ? 'Unpin match' : 'Pin match'}
              className={`p-2 rounded-full transition-colors ${
                match.isPinned
                  ? 'text-amber-500 bg-amber-500/10'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {match.isPinned ? <Pin className="w-5 h-5 fill-current" /> : <Pin className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setSelectedMatchForDetail(null)}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Date</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
              {formatDateDisplay(match.date)}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Time (IST)</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
              {match.time}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Layers className="w-3.5 h-3.5" />
              <span>Match Slot</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
              Slot #{match.slot + 1}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <IndianRupee className="w-3.5 h-3.5" />
              <span>Earning Status</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
              <span className={match.isCompleted ? 'text-emerald-500' : match.isCancelled ? 'text-rose-500' : 'text-slate-500'}>
                ₹{match.earning}
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                ({match.isCompleted ? 'Completed' : match.isCancelled ? 'Cancelled' : 'Pending'})
              </span>
            </p>
          </div>

          {match.isCancelled && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 col-span-2">
              <span className="text-[10px] text-rose-500 font-bold uppercase block">
                Cancel Reason
              </span>
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                {match.cancelReason ? match.cancelReason : 'No reason specified'}
              </p>
            </div>
          )}

          {/* IDP Time Log Badge */}
          {matchIdpLog && (
            <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/25 col-span-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  IDP Given Time
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    matchIdpLog.diffType === 'early'
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : matchIdpLog.diffType === 'on_time'
                      ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400'
                      : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {matchIdpLog.diffFormatted}
                </span>
              </div>
              <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                {matchIdpLog.idpClickTime} IST
                {matchIdpLog.totalClicks > 1 && (
                  <span className="text-[10px] text-slate-400 font-normal ml-2">
                    ({matchIdpLog.totalClicks} clicks recorded)
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Proof Actions */}
        <div className="p-3 rounded-2xl bg-teal-500/5 dark:bg-teal-500/10 border border-teal-500/20 space-y-2">
          <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 block">
            Proof Actions
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => copyProofAction(match)}
              className="py-2 px-3 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 bg-white dark:bg-slate-800 border border-teal-500/20 hover:bg-teal-500/10 transition-colors flex items-center justify-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Copy Proof</span>
            </button>
            <button
              onClick={() => shareProofAction(match)}
              className="py-2 px-3 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 bg-white dark:bg-slate-800 border border-teal-500/20 hover:bg-teal-500/10 transition-colors flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Proof</span>
            </button>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => openIdp(match)}
              className="py-3 px-4 rounded-2xl text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open IDP Page</span>
            </button>
            <button
              onClick={() => openWinning(match)}
              className="py-3 px-4 rounded-2xl text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              <span>Open WIN Page</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                completeMatch(match.id);
                setSelectedMatchForDetail(null);
              }}
              disabled={match.isCompleted}
              className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                match.isCompleted
                  ? 'bg-emerald-500/10 text-emerald-500/50 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{match.isCompleted ? 'Already Completed' : 'Mark Completed (+₹3)'}</span>
            </button>
            {match.isCancelled ? (
              <button
                onClick={() => {
                  uncancelMatch(match.id);
                  setSelectedMatchForDetail(null);
                }}
                className="py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/30 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Restore / Uncancel Match</span>
              </button>
            ) : (
              <button
                onClick={() => setConfirmCancelOpen(true)}
                className="py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 active:scale-95"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel Match (₹0)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal with optional reason */}
      <CancelConfirmModal
        isOpen={confirmCancelOpen}
        match={match}
        onConfirm={(reason) => {
          setConfirmCancelOpen(false);
          cancelMatch(match.id, reason);
          setSelectedMatchForDetail(null);
        }}
        onCancel={() => setConfirmCancelOpen(false)}
      />
    </div>
  );
};
