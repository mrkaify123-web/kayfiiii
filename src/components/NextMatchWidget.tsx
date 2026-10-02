import React from 'react';
import { Match } from '../types';
import { useApp } from '../context/AppContext';
import { Clock, Play, Copy, Check } from 'lucide-react';
import { formatSecondsCountdown } from '../utils/ist';
import { formatMatchSequentialDisplay } from '../utils/matchGenerator';

interface NextMatchWidgetProps {
  match: Match | null;
  secondsRemaining: number;
}

export const NextMatchWidget: React.FC<NextMatchWidgetProps> = ({
  match,
  secondsRemaining,
}) => {
  const { copyMatch } = useApp();
  const [copied, setCopied] = React.useState(false);

  if (!match) return null;

  const handleCopy = async () => {
    const success = await copyMatch(match);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isStartingSoon = secondsRemaining > 0 && secondsRemaining <= 300; // 5 mins

  return (
    <div className="rounded-2xl p-4 sm:p-5 bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs transition-all">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            NEXT MATCH
          </span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Slot #{match.slot + 1}
          </span>
        </div>

        {/* Live Countdown Badge */}
        <div className="flex items-center gap-1.5">
          <Clock className={`w-3.5 h-3.5 ${isStartingSoon ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Starts in:</span>
          <span
            className={`font-mono font-bold text-xs sm:text-sm tabular-nums px-2 py-0.5 rounded-md ${
              isStartingSoon
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
            }`}
          >
            {formatSecondsCountdown(secondsRemaining)}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
            <Play className="w-4 h-4 ml-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tabular-nums font-mono">
                {match.matchNumber}
              </span>
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                {formatMatchSequentialDisplay(match)}
              </span>
              <button
                onClick={handleCopy}
                title="Copy Match Number & #Count (e.g. 112233#1)"
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center gap-1 text-[11px] font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Scheduled: <span className="font-semibold text-slate-700 dark:text-slate-300">{match.time}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
