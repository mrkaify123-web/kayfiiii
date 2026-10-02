import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DailyScheduleConfig, Match } from '../types';
import { calculateScheduleSlots, formatDateDisplay, getISTDateString } from '../utils/ist';
import { generateMatchesForDate } from '../utils/matchGenerator';
import { X, SlidersHorizontal, RefreshCw, Check, ExternalLink, Trophy, Eye } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface DailySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailySetupModal: React.FC<DailySetupModalProps> = ({ isOpen, onClose }) => {
  const {
    selectedDate,
    setSelectedDate,
    currentDailyData,
    generateScheduleForDate,
    getIdpUrl,
    getWinUrl,
  } = useApp();

  const initialSchedule: DailyScheduleConfig = currentDailyData.schedule || {
    startTime: '10:00',
    endTime: '22:00',
    intervalMinutes: 15,
    base10AM: '332212',
    base11AM: '336612',
    overwrite1115: '',
    overwrite1130: '',
    overwrite1145: '',
    totalRegularMatches: 49,
  };

  const [date, setDate] = useState<string>(selectedDate || getISTDateString());
  const [startTime, setStartTime] = useState(initialSchedule.startTime || '10:00');
  const [endTime, setEndTime] = useState(initialSchedule.endTime || '22:00');
  const [interval, setInterval] = useState(initialSchedule.intervalMinutes || 15);

  const [base10AM, setBase10AM] = useState(initialSchedule.base10AM || '332212');
  const [base11AM, setBase11AM] = useState(initialSchedule.base11AM || '336612');

  const [overwrite1115, setOverwrite1115] = useState(initialSchedule.overwrite1115 || '');
  const [overwrite1130, setOverwrite1130] = useState(initialSchedule.overwrite1130 || '');
  const [overwrite1145, setOverwrite1145] = useState(initialSchedule.overwrite1145 || '');
  const [startCount, setStartCount] = useState<number>(initialSchedule.startCount || 1);

  const [confirmRegenerateOpen, setConfirmRegenerateOpen] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(true);

  // Live generated match preview
  const previewMatches: Match[] = useMemo(() => {
    const slots = calculateScheduleSlots(startTime, endTime, interval);
    const config: DailyScheduleConfig = {
      startTime,
      endTime,
      intervalMinutes: interval,
      base10AM: base10AM.trim() || '332212',
      base11AM: base11AM.trim() || '336612',
      overwrite1115: overwrite1115.trim(),
      overwrite1130: overwrite1130.trim(),
      overwrite1145: overwrite1145.trim(),
      startCount: Number(startCount) || 1,
      totalRegularMatches: slots.length,
    };
    return generateMatchesForDate(date, config, currentDailyData.matches || []);
  }, [date, startTime, endTime, interval, base10AM, base11AM, overwrite1115, overwrite1130, overwrite1145, startCount, currentDailyData.matches]);

  if (!isOpen) return null;

  const handleGenerateAndSave = (overwrite = false) => {
    const config: DailyScheduleConfig = {
      startTime,
      endTime,
      intervalMinutes: interval,
      base10AM: base10AM.trim() || '332212',
      base11AM: base11AM.trim() || '336612',
      overwrite1115: overwrite1115.trim(),
      overwrite1130: overwrite1130.trim(),
      overwrite1145: overwrite1145.trim(),
      startCount: Number(startCount) || 1,
      totalRegularMatches: previewMatches.length,
    };

    if (date !== selectedDate) {
      setSelectedDate(date);
    }

    generateScheduleForDate(date, config, overwrite);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
        <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-5 max-h-[94vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Match Setup & Number Generation
                </h3>
                <p className="text-xs text-slate-400">
                  Target: {formatDateDisplay(date)} (IST)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* 1. Schedule Timing */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                1. Daily Schedule Parameters
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                    Date (IST)
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                    Interval
                  </label>
                  <select
                    value={interval}
                    onChange={(e) => setInterval(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value={10}>10 min</option>
                    <option value={15}>15 min (Default)</option>
                    <option value={20}>20 min</option>
                    <option value={30}>30 min</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                    Start Count #
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={startCount}
                    onChange={(e) => setStartCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">Total Calculated Matches:</span>
                <span className="font-extrabold text-teal-600 dark:text-teal-400 tabular-nums">
                  {previewMatches.length} Regular Matches
                </span>
              </div>
            </div>

            {/* 2. Required 10:00 AM & 11:00 AM Match Numbers */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                2. Required Match Numbers
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-900 dark:text-white">
                      10:00 AM Match Number <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                      +1 each 15m
                    </span>
                  </div>
                  <input
                    type="text"
                    value={base10AM}
                    onChange={(e) => setBase10AM(e.target.value)}
                    placeholder="332212"
                    required
                    className="w-full px-3 py-2 text-sm font-extrabold font-mono rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    10:00 → {base10AM || '332212'}, 10:15 → {(parseInt(base10AM, 10) || 332212) + 1}, 10:30 → {(parseInt(base10AM, 10) || 332212) + 2}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-900 dark:text-white">
                      11:00 AM Match Number <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                      +12 pattern / +1/hr
                    </span>
                  </div>
                  <input
                    type="text"
                    value={base11AM}
                    onChange={(e) => setBase11AM(e.target.value)}
                    placeholder="336612"
                    required
                    className="w-full px-3 py-2 text-sm font-extrabold font-mono rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    11:00 → {base11AM || '336612'}, 11:15 → {(parseInt(base11AM, 10) || 336612) + 12}, 12:00 → {(parseInt(base11AM, 10) || 336612) + 1}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Optional Manual Overwrites for 11:15, 11:30, 11:45 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  3. Optional Manual Overwrites
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Leave blank to use auto-calculated numbers
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                    11:15 AM Overwrite
                  </label>
                  <input
                    type="text"
                    value={overwrite1115}
                    onChange={(e) => setOverwrite1115(e.target.value)}
                    placeholder={`Auto: ${(parseInt(base11AM, 10) || 336612) + 12}`}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                    11:30 AM Overwrite
                  </label>
                  <input
                    type="text"
                    value={overwrite1130}
                    onChange={(e) => setOverwrite1130(e.target.value)}
                    placeholder={`Auto: ${(parseInt(base11AM, 10) || 336612) + 24}`}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                    11:45 AM Overwrite
                  </label>
                  <input
                    type="text"
                    value={overwrite1145}
                    onChange={(e) => setOverwrite1145(e.target.value)}
                    placeholder={`Auto: ${(parseInt(base11AM, 10) || 336612) + 36}`}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  />
                </div>
              </div>
            </div>

            {/* 4. Live Generated Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Eye className="w-3.5 h-3.5 text-teal-500" />
                  <span>Generated Matches Preview ({previewMatches.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFullPreview(!showFullPreview)}
                  className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  {showFullPreview ? 'Collapse Preview' : 'Show All Matches'}
                </button>
              </div>

              {showFullPreview && (
                <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  {previewMatches.slice(0, 16).map((m) => (
                    <div
                      key={m.id}
                      className="px-3 py-2 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 w-16">
                          {m.time}
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {m.matchNumber}
                        </span>
                        <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                          {m.sequentialCount != null ? `#${m.sequentialCount}` : 'CANCELLED'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={getIdpUrl(m.matchNumber)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 flex items-center gap-1"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>IDP</span>
                        </a>

                        <a
                          href={getWinUrl(m.matchNumber)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 flex items-center gap-1"
                        >
                          <Trophy className="w-2.5 h-2.5" />
                          <span>WIN</span>
                        </a>

                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800">
                          {m.status}
                        </span>
                      </div>
                    </div>
                  ))}

                  {previewMatches.length > 16 && (
                    <div className="p-2 text-center text-[11px] text-slate-400">
                      + {previewMatches.length - 16} more matches generated continuing through {endTime}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button
              onClick={() => setConfirmRegenerateOpen(true)}
              className="px-3 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate Schedule</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleGenerateAndSave(false)}
                style={{ backgroundColor: 'var(--primary-accent, #14b8a6)' }}
                className="px-5 py-2 text-xs font-extrabold text-white rounded-xl shadow-xs hover:opacity-90 active:scale-95 transition-all"
              >
                GENERATE MATCHES
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmRegenerateOpen}
        title="Regenerate Day's Schedule"
        message={`Are you sure you want to regenerate all matches for ${date}? This will recompute all match numbers using 10 AM: ${base10AM} and 11 AM: ${base11AM}.`}
        confirmText="Yes, Regenerate"
        variant="warning"
        onConfirm={() => {
          setConfirmRegenerateOpen(false);
          handleGenerateAndSave(true);
        }}
        onCancel={() => setConfirmRegenerateOpen(false)}
      />
    </>
  );
};
