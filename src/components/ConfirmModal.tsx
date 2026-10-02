import React from 'react';
import { AlertCircle, CheckCircle2, XCircle, Trash2, HelpCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger' | 'warning' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <XCircle className="w-6 h-6 text-rose-500" />,
          btn: 'bg-rose-500 hover:bg-rose-600 text-white',
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-6 h-6 text-amber-500" />,
          btn: 'bg-amber-500 hover:bg-amber-600 text-white',
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
          btn: 'bg-emerald-500 hover:bg-emerald-600 text-white',
        };
      default:
        return {
          icon: <HelpCircle className="w-6 h-6 text-teal-500" />,
          btn: 'text-white',
        };
    }
  };

  const style = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
            {style.icon}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={variant === 'primary' ? { backgroundColor: 'var(--primary-accent, #14b8a6)' } : undefined}
            className={`px-4 py-2 text-xs font-semibold rounded-xl shadow-sm transition-all ${style.btn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
