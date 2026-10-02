import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ExternalLink,
  Trophy,
  FileCheck,
  Copy,
  PlusCircle,
  SlidersHorizontal,
  Check,
} from 'lucide-react';
import { formatMatchSequentialDisplay } from '../utils/matchGenerator';

interface QuickActionsProps {
  onOpenExtraModal: () => void;
  onOpenDailySetup: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onOpenExtraModal,
  onOpenDailySetup,
}) => {
  const {
    currentMatch,
    openIdp,
    openWinning,
    executeProofWorkflow,
    copyMatch,
  } = useApp();

  const [copied, setCopied] = useState(false);

  const handleCopyCurrent = async () => {
    if (!currentMatch) return;
    const success = await copyMatch(currentMatch);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-3xl p-5 bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          QUICK ACTIONS
        </h3>
        {currentMatch && (
          <span className="text-[11px] font-semibold text-slate-400 font-mono tabular-nums">
            Target: {currentMatch.matchNumber} {formatMatchSequentialDisplay(currentMatch)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {/* Quick IDP */}
        <button
          onClick={() => currentMatch && openIdp(currentMatch)}
          disabled={!currentMatch}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed group active:scale-95"
        >
          <ExternalLink className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-bold">Quick IDP</span>
        </button>

        {/* Quick WIN */}
        <button
          onClick={() => currentMatch && openWinning(currentMatch)}
          disabled={!currentMatch}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed group active:scale-95"
        >
          <Trophy className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-bold">WIN</span>
        </button>

        {/* Quick Proof Workflow */}
        <button
          onClick={() => currentMatch && executeProofWorkflow(currentMatch)}
          disabled={!currentMatch}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed group active:scale-95"
        >
          <FileCheck className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-bold">Proof</span>
        </button>

        {/* Quick Copy */}
        <button
          onClick={handleCopyCurrent}
          disabled={!currentMatch}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed group active:scale-95"
        >
          {copied ? (
            <Check className="w-5 h-5 mb-1 text-emerald-500" />
          ) : (
            <Copy className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-[11px] font-bold">{copied ? 'Copied!' : 'Copy #'}</span>
        </button>

        {/* Add Extra Matches */}
        <button
          onClick={onOpenExtraModal}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50 transition-all group active:scale-95"
        >
          <PlusCircle className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform text-amber-500" />
          <span className="text-[11px] font-bold">Extra</span>
        </button>

        {/* Daily Setup */}
        <button
          onClick={onOpenDailySetup}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50 transition-all group active:scale-95"
        >
          <SlidersHorizontal className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform text-indigo-500" />
          <span className="text-[11px] font-bold">Setup</span>
        </button>
      </div>
    </div>
  );
};
