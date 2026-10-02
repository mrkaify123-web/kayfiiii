import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Bell, CheckCheck, Clock, IndianRupee, AlertCircle, Play, Trophy, ChevronRight } from 'lucide-react';
import { DailySummaryModal } from './DailySummaryModal';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'earning':
        return <IndianRupee className="w-4 h-4 text-emerald-500" />;
      case 'match':
        return <Play className="w-4 h-4 text-sky-500" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      default:
        return <Bell className="w-4 h-4 text-teal-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Notification Center
              </h3>
              <p className="text-[11px] text-slate-400">Match alerts & earning updates</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={markAllNotificationsRead}
                title="Mark all as read"
                className="p-1.5 rounded-lg text-slate-400 hover:text-teal-500 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Daily Summary Action Card in Notifications */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-teal-500" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Daily Performance Summary
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Check matches, earnings & completion rate
              </span>
            </div>
          </div>
          <button
            onClick={() => setSummaryModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1 active:scale-95 transition-all shrink-0"
            style={{ backgroundColor: 'var(--primary-accent, #14b8a6)' }}
          >
            <span>View</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Bell className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-xs text-slate-400">No notifications yet</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => markNotificationRead(item.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  item.isRead
                    ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/60 opacity-75'
                    : 'bg-white dark:bg-slate-800 border-teal-500/30 shadow-xs'
                }`}
              >
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <DailySummaryModal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
      />
    </div>
  );
};
