import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Utensils,
  Droplets,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  Coffee,
  ChevronDown,
  Smile,
} from 'lucide-react';

interface WellnessBreakPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onDone: (checklist: { food: boolean; water: boolean; rest: boolean }) => void;
  onSnooze: (minutes: number) => void;
  onSkip: () => void;
}

export const WellnessBreakPopup: React.FC<WellnessBreakPopupProps> = ({
  isOpen,
  onClose,
  onDone,
  onSnooze,
  onSkip,
}) => {
  const { wellnessTodayData } = useApp();

  const [food, setFood] = useState<boolean>(wellnessTodayData?.foodDone || false);
  const [water, setWater] = useState<boolean>(wellnessTodayData?.waterDone || false);
  const [rest, setRest] = useState<boolean>(wellnessTodayData?.restDone || false);
  const [snoozeMenuOpen, setSnoozeMenuOpen] = useState(false);

  if (!isOpen) return null;

  const handleDoneSubmit = () => {
    onDone({ food, water, rest });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-teal-500/30 shadow-2xl p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-lg shadow-xs">
              <Coffee className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  HOSTING WELLNESS
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Time for a break!
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          You've been hosting actively. Take 5-10 minutes to stretch, rehydrate, and refresh your mind.
        </p>

        {/* 3 Checklist Items */}
        <div className="space-y-2 pt-1">
          {/* 1. Food */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Food
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Did you eat?
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFood(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  food
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300/60'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setFood(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  !food
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                    : 'bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300/60'
                }`}
              >
                Not yet
              </button>
            </div>
          </div>

          {/* 2. Water */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-600 flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Water
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Did you drink water?
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setWater(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  water
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300/60'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setWater(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  !water
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                    : 'bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300/60'
                }`}
              >
                Not yet
              </button>
            </div>
          </div>

          {/* 3. Rest */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-teal-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Rest
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Did you take rest?
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRest(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  rest
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300/60'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setRest(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  !rest
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                    : 'bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300/60'
                }`}
              >
                Not yet
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons: Done, Snooze, Skip */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
          {/* Done Button */}
          <button
            type="button"
            onClick={handleDoneSubmit}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Done</span>
          </button>

          {/* Snooze Button with Menu */}
          <div className="relative w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setSnoozeMenuOpen(!snoozeMenuOpen)}
              className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Snooze</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {snoozeMenuOpen && (
              <div className="absolute bottom-full mb-1 left-0 right-0 sm:left-auto sm:right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1 z-10 flex flex-col gap-1 min-w-[120px]">
                {[5, 10, 15].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      setSnoozeMenuOpen(false);
                      onSnooze(mins);
                    }}
                    className="text-left px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-400 text-slate-700 dark:text-slate-300"
                  >
                    {mins} minutes
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Skip Button */}
          <button
            type="button"
            onClick={onSkip}
            className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};
