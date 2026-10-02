import React, { useState } from 'react';
import { XCircle, AlertCircle, Home, User, Wrench, MoreHorizontal } from 'lucide-react';
import { Match } from '../types';

interface CancelConfirmModalProps {
  isOpen: boolean;
  match: Match | null;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

const COMMON_REASONS = [
  { label: 'Room issue', icon: Home },
  { label: 'Personal', icon: User },
  { label: 'Technical issue', icon: Wrench },
  { label: 'Other', icon: MoreHorizontal },
];

export const CancelConfirmModal: React.FC<CancelConfirmModalProps> = ({
  isOpen,
  match,
  onConfirm,
  onCancel,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');

  if (!isOpen || !match) return null;

  const handleSelectReason = (reason: string) => {
    if (selectedReason === reason) {
      setSelectedReason('');
      setCustomReason('');
    } else {
      setSelectedReason(reason);
      if (reason !== 'Other') {
        setCustomReason('');
      }
    }
  };

  const handleConfirm = () => {
    let finalReason: string | undefined = undefined;
    if (selectedReason === 'Other') {
      finalReason = customReason.trim() || 'Other';
    } else if (selectedReason) {
      finalReason = selectedReason;
    }
    onConfirm(finalReason);
    setSelectedReason('');
    setCustomReason('');
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Header with Danger Icon */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Cancel Match
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Are you sure you want to cancel this match?
            </p>
          </div>
        </div>

        {/* Target Match Badge */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">TARGET MATCH</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
              #{match.matchNumber}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 dark:text-slate-400 font-medium block">{match.time}</span>
            <span className="text-[11px] font-bold text-rose-500">Earns: ₹0</span>
          </div>
        </div>

        {/* Optional Cancel Reason Selector */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Cancel Reason (Optional)</span>
            {selectedReason && (
              <button
                type="button"
                onClick={() => {
                  setSelectedReason('');
                  setCustomReason('');
                }}
                className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline font-normal"
              >
                Clear
              </button>
            )}
          </label>

          <div className="grid grid-cols-2 gap-1.5">
            {COMMON_REASONS.map(({ label, icon: IconComponent }) => {
              const isSelected = selectedReason === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleSelectReason(label)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all text-left ${
                    isSelected
                      ? 'bg-rose-500 text-white shadow-xs font-bold'
                      : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50'
                  }`}
                >
                  <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </div>

          {selectedReason === 'Other' && (
            <input
              type="text"
              placeholder="Specify custom reason..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              autoFocus
            />
          )}
        </div>

        {/* Action Buttons: KEEP MATCH / CANCEL MATCH */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={handleClose}
            className="py-2.5 px-3 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          >
            KEEP MATCH
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="py-2.5 px-3 text-xs font-bold rounded-xl text-white bg-rose-500 hover:bg-rose-600 shadow-sm shadow-rose-500/20 transition-all active:scale-95"
          >
            CANCEL MATCH
          </button>
        </div>
      </div>
    </div>
  );
};
