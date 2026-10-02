import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { IdpLogEntry } from '../types';
import { calculateIdpStats } from '../utils/idpLog';
import {
  FileText,
  Search,
  Download,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Filter,
  Calendar,
  X,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { formatDateDisplay } from '../utils/ist';
import { ConfirmModal } from '../components/ConfirmModal';

export const IdpLogView: React.FC = () => {
  const { idpLogs, deleteIdpLog, clearIdpLogs } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'early' | 'on_time' | 'late'>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedEntryForClicks, setSelectedEntryForClicks] = useState<IdpLogEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<IdpLogEntry | null>(null);
  const [clearAllConfirmOpen, setClearAllConfirmOpen] = useState(false);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return idpLogs.filter((entry) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.trim();
        const matchNumMatch = entry.matchNumber.includes(q);
        const countMatch = entry.sequentialCount ? String(entry.sequentialCount).includes(q) : false;
        if (!matchNumMatch && !countMatch) return false;
      }
      // Status filter
      if (filterType !== 'all' && entry.diffType !== filterType) {
        return false;
      }
      // Date filter
      if (dateFilter !== 'all' && entry.date !== dateFilter) {
        return false;
      }
      return true;
    });
  }, [idpLogs, searchQuery, filterType, dateFilter]);

  // Summary stats computed on filtered or all logs
  const stats = useMemo(() => {
    return calculateIdpStats(filteredLogs);
  }, [filteredLogs]);

  // Unique dates for date filter
  const uniqueDates = useMemo(() => {
    const set = new Set<string>();
    idpLogs.forEach((l) => set.add(l.date));
    return Array.from(set).sort().reverse();
  }, [idpLogs]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const map: Record<string, IdpLogEntry[]> = {};
    filteredLogs.forEach((entry) => {
      if (!map[entry.date]) map[entry.date] = [];
      map[entry.date].push(entry);
    });
    return map;
  }, [filteredLogs]);

  // Export CSV
  const handleExportCsv = () => {
    if (filteredLogs.length === 0) return;
    const headers = [
      'Date (IST)',
      'Match Number',
      'Sequential Count',
      'Scheduled Time',
      'IDP Given Time (IST)',
      'Difference',
      'Timing Status',
      'Total Clicks',
      'Match Type',
    ];

    const rows = filteredLogs.map((l) => [
      l.date,
      l.matchNumber,
      l.sequentialCount ? `#${l.sequentialCount}` : '—',
      l.scheduledMatchTime,
      l.idpClickTime,
      l.diffFormatted,
      l.diffType.toUpperCase(),
      l.totalClicks || 1,
      l.matchType,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IDP_Time_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-24">
      {/* 1. Header & Summary Stats */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 text-sky-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  REAL-TIME AUDIT
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {filteredLogs.length} Logged
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                IDP Given Time Log
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleExportCsv}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {idpLogs.length > 0 && (
              <button
                onClick={() => setClearAllConfirmOpen(true)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* On Time */}
          <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20">
            <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 uppercase block">
              ON-TIME ACCURACY
            </span>
            <span className="text-lg sm:text-2xl font-extrabold text-sky-600 dark:text-sky-400 tabular-nums">
              {stats.onTimePercent}%
            </span>
            <span className="text-[10px] text-sky-600/80 block mt-0.5">
              {stats.onTimeCount} matches on time
            </span>
          </div>

          {/* Early */}
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block">
              EARLY IDP
            </span>
            <span className="text-lg sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {stats.earlyCount}
            </span>
            <span className="text-[10px] text-emerald-600/80 block mt-0.5">
              Given ahead of schedule
            </span>
          </div>

          {/* Late */}
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase block">
              LATE IDP
            </span>
            <span className="text-lg sm:text-2xl font-extrabold text-rose-500 tabular-nums">
              {stats.lateCount}
            </span>
            <span className="text-[10px] text-rose-500/80 block mt-0.5">
              Delayed after time
            </span>
          </div>

          {/* Average */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              AVG IDP TIMING
            </span>
            <span className="text-base sm:text-xl font-extrabold text-slate-800 dark:text-slate-200 tabular-nums block">
              {stats.avgDiffFormatted}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Net avg vs scheduled
            </span>
          </div>
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search match # or sequential count (e.g. 332212, #5)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Timing Status Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'All' },
            { id: 'early', label: 'Early', color: 'emerald' },
            { id: 'on_time', label: 'On Time', color: 'sky' },
            { id: 'late', label: 'Late', color: 'rose' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterType(cat.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                filterType === cat.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Date Selector */}
        {uniqueDates.length > 1 && (
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Dates ({uniqueDates.length})</option>
            {uniqueDates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 3. Grouped Log List */}
      <div className="space-y-4">
        {Object.keys(groupedByDate).length === 0 ? (
          <div className="p-8 rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
            <Clock className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No IDP clicks logged yet
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Every time you tap the IDP button on any match card or in Focus Mode, it records the exact IST timestamp and scheduled difference here.
            </p>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([dateStr, entries]) => (
            <div
              key={dateStr}
              className="rounded-3xl p-4 sm:p-5 bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-3"
            >
              {/* Date Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-500" />
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                    {formatDateDisplay(dateStr)}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-400">
                  {entries.length} matches
                </span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {entries.map((entry) => {
                  return (
                    <div
                      key={entry.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-xl px-2 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {/* Match Number + Count */}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-mono font-extrabold text-slate-900 dark:text-white">
                              #{entry.matchNumber}
                            </span>
                            {entry.sequentialCount && (
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400">
                                #{entry.sequentialCount}
                              </span>
                            )}
                            <span className="text-[10px] font-semibold text-slate-400">
                              ({entry.matchType})
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            <span>Sched: {entry.scheduledMatchTime}</span>
                            <span>→</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              Given: {entry.idpClickTime}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Badge, Multi-click Indicator, and Delete */}
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {/* Status Badge */}
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 ${
                            entry.diffType === 'early'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25'
                              : entry.diffType === 'on_time'
                              ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/25'
                              : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/25'
                          }`}
                        >
                          {entry.diffType === 'early' && <TrendingUp className="w-3.5 h-3.5" />}
                          {entry.diffType === 'on_time' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {entry.diffType === 'late' && <TrendingDown className="w-3.5 h-3.5" />}
                          <span>{entry.diffFormatted}</span>
                        </span>

                        {/* Extra Clicks Badge */}
                        {entry.totalClicks > 1 && (
                          <button
                            onClick={() => setSelectedEntryForClicks(entry)}
                            className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                            title="View all click timestamps"
                          >
                            {entry.totalClicks} clicks
                          </button>
                        )}

                        {/* Delete entry */}
                        <button
                          onClick={() => setEntryToDelete(entry)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Extra Clicks Detail Modal */}
      {selectedEntryForClicks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">CLICK HISTORY</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Match #{selectedEntryForClicks.matchNumber}
                </h4>
              </div>
              <button
                onClick={() => setSelectedEntryForClicks(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              First click remains the main IDP timing. Additional clicks are recorded below:
            </p>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {selectedEntryForClicks.allClicks.map((time, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs"
                >
                  <span className="text-slate-400 font-semibold">
                    {idx === 0 ? '1st Click (Main)' : `Click #${idx + 1}`}
                  </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {time}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedEntryForClicks(null)}
              className="w-full py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Entry Confirmation */}
      {entryToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Delete IDP Log Entry?"
          message={`Are you sure you want to remove the IDP timing log for Match #${entryToDelete.matchNumber}?`}
          confirmText="Delete"
          variant="danger"
          onConfirm={() => {
            deleteIdpLog(entryToDelete.id);
            setEntryToDelete(null);
          }}
          onCancel={() => setEntryToDelete(null)}
        />
      )}

      {/* Clear All Confirmation */}
      {clearAllConfirmOpen && (
        <ConfirmModal
          isOpen={true}
          title="Clear All IDP Logs?"
          message="Are you sure you want to delete all recorded IDP timing logs? This cannot be undone."
          confirmText="Clear All"
          variant="danger"
          onConfirm={() => {
            clearIdpLogs();
            setClearAllConfirmOpen(false);
          }}
          onCancel={() => setClearAllConfirmOpen(false)}
        />
      )}
    </div>
  );
};
