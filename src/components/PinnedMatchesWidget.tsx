import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Match } from '../types';
import {
  Pin,
  PinOff,
  ExternalLink,
  Trophy,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { formatMatchSequentialDisplay } from '../utils/matchGenerator';

export const PinnedMatchesWidget: React.FC = () => {
  const {
    currentDailyData,
    togglePinMatch,
    openIdp,
    openWinning,
    copyMatch,
    setSelectedMatchForDetail,
  } = useApp();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const pinnedMatches = currentDailyData.matches.filter((m) => m.isPinned);

  if (pinnedMatches.length === 0) return null;

  const handleCopy = async (e: React.MouseEvent, match: Match) => {
    e.stopPropagation();
    const success = await copyMatch(match);
    if (success) {
      setCopiedId(match.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="rounded-3xl p-5 bg-white/80 dark:bg-slate-900/85 border border-amber-500/30 dark:border-amber-500/30 backdrop-blur-xl shadow-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Pin className="w-4 h-4 fill-amber-500 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                PINNED IMPORTANT MATCHES
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                {pinnedMatches.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Quick access to prioritized matches</p>
          </div>
        </div>
      </div>

      {/* Pinned Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {pinnedMatches.map((match) => {
          const isCopied = copiedId === match.id;

          const getStatusBadge = () => {
            if (match.isCompleted) {
              return (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  DONE (+₹3)
                </span>
              );
            }
            if (match.isCancelled) {
              return (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500">
                  <XCircle className="w-3 h-3" />
                  CANCELLED
                </span>
              );
            }
            return (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Clock className="w-3 h-3" />
                UPCOMING
              </span>
            );
          };

          return (
            <div
              key={match.id}
              onClick={() => setSelectedMatchForDetail(match)}
              className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-amber-500/40 transition-all cursor-pointer space-y-3"
            >
              {/* Top Row: Match Number, Sequential Count, Time, Status, Unpin */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
                      #{match.matchNumber}
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                      {formatMatchSequentialDisplay(match)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{match.time}</span>
                    <span>·</span>
                    <span>Slot #{match.slot + 1}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {getStatusBadge()}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePinMatch(match.id);
                    }}
                    title="Unpin match"
                    className="p-1 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-colors"
                  >
                    <PinOff className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 3 Quick Action Buttons: IDP, WIN, COPY */}
              <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-700/50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openIdp(match);
                  }}
                  className="py-1.5 px-2 rounded-xl text-xs font-bold bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center gap-1 active:scale-95 transition-all"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>IDP</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openWinning(match);
                  }}
                  className="py-1.5 px-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center gap-1 active:scale-95 transition-all"
                >
                  <Trophy className="w-3 h-3" />
                  <span>WIN</span>
                </button>

                <button
                  onClick={(e) => handleCopy(e, match)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all ${
                    isCopied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {isCopied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
