import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Edit3, Check, X } from 'lucide-react';
import { formatDateDisplay } from '../utils/ist';

export const DailyNotesWidget: React.FC = () => {
  const { currentDailyData, selectedDate, setDailyNotes, setToastMessage } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [notesText, setNotesText] = useState(currentDailyData.notes || '');

  useEffect(() => {
    setNotesText(currentDailyData.notes || '');
    setIsEditing(false);
  }, [selectedDate, currentDailyData.notes]);

  const handleSave = () => {
    setDailyNotes(selectedDate, notesText.trim());
    setIsEditing(false);
    setToastMessage({ text: 'Daily notes saved successfully.' });
  };

  const handleCancel = () => {
    setNotesText(currentDailyData.notes || '');
    setIsEditing(false);
  };

  return (
    <div className="rounded-3xl p-5 bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              DAILY NOTES ({formatDateDisplay(selectedDate)})
            </h3>
            <p className="text-[11px] text-slate-400">Personal remarks, shift logs & reminders</p>
          </div>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-2.5 py-1 rounded-xl text-xs font-bold text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 transition-colors flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{currentDailyData.notes ? 'Edit' : 'Add Note'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCancel}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              className="px-2.5 py-1 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors flex items-center gap-1 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            rows={3}
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            placeholder="e.g. Aaj shaam ko 2 extra matches kiye, room issue match #12 pe hua tha..."
            className="w-full p-3 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            autoFocus
          />
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          {currentDailyData.notes ? (
            <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {currentDailyData.notes}
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No notes for today yet. Click "Add Note" to log reminders, issues, or shift observations.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
