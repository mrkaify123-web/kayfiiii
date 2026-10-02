import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Plus, Minus, Layers, AlertTriangle } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface ExtraMatchesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExtraMatchesModal: React.FC<ExtraMatchesModalProps> = ({ isOpen, onClose }) => {
  const { currentDailyData, selectedDate, setExtraMatches, settings } = useApp();

  const [count, setCount] = useState<number>(currentDailyData.extraMatches || 0);
  const [notes, setNotes] = useState<string>(currentDailyData.extraMatchesNotes || '');
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  if (!isOpen) return null;

  const rate = settings.hosting.earningRate || 3;
  const extraEarnings = Math.max(0, count) * rate;

  const handleSave = () => {
    setExtraMatches(selectedDate, Math.max(0, count), notes);
    onClose();
  };

  const handleRemove = () => {
    setExtraMatches(selectedDate, 0, '');
    setCount(0);
    setNotes('');
    setConfirmRemoveOpen(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
        <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Extra Matches
                </h3>
                <p className="text-xs text-slate-400">Date: {selectedDate}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Counter Controls */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Number of Extra Matches
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                ₹{rate} / match
              </span>
            </div>

            <div className="flex items-center justify-center gap-4 py-2">
              <button
                onClick={() => setCount((c) => Math.max(0, c - 1))}
                className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs active:scale-95"
              >
                <Minus className="w-4 h-4" />
              </button>

              <input
                type="number"
                min="0"
                value={count}
                onChange={(e) => setCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-20 text-center text-2xl font-extrabold font-mono text-slate-900 dark:text-white bg-transparent outline-none"
              />

              <button
                onClick={() => setCount((c) => c + 1)}
                className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Total Extra Earning Preview */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                Extra Earnings: <span className="font-extrabold text-sm">₹{extraEarnings}</span>
              </span>
            </div>
          </div>

          {/* Notes field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Aaj 5 extra matches kiye sham ko"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {currentDailyData.extraMatches > 0 ? (
              <button
                onClick={() => setConfirmRemoveOpen(true)}
                className="px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
              >
                Remove Extra
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{ backgroundColor: 'var(--primary-accent, #14b8a6)' }}
                className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs hover:opacity-90"
              >
                Save Extra Matches
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmRemoveOpen}
        title="Remove Extra Matches"
        message="Are you sure you want to remove all extra matches for today? This will deduct the extra earnings."
        confirmText="Yes, Remove"
        variant="danger"
        onConfirm={handleRemove}
        onCancel={() => setConfirmRemoveOpen(false)}
      />
    </>
  );
};
