import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Match } from '../types';
import { Search, History, CheckCircle2, XCircle, Clock, Copy, Check, FileCheck, ArrowUpDown } from 'lucide-react';
import { formatDateDisplay } from '../utils/ist';

export const HistoryView: React.FC = () => {
  const { allDailyData, setSelectedMatchForDetail, copyMatchNumber, executeProofWorkflow, idpLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED' | 'UPCOMING'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const idpLogMap = useMemo(() => {
    const map: Record<string, (typeof idpLogs)[0]> = {};
    for (const log of idpLogs) {
      if (log.matchId && !map[log.matchId]) {
        map[log.matchId] = log;
      }
    }
    return map;
  }, [idpLogs]);

  // Flatten all matches across all dates
  const allMatchesList = useMemo(() => {
    const list: Match[] = [];
    // Sort dates descending
    const sortedDates = Object.keys(allDailyData).sort().reverse();
    for (const d of sortedDates) {
      const day = allDailyData[d];
      if (day?.matches) {
        list.push(...day.matches);
      }
    }
    return list;
  }, [allDailyData]);

  // Filter matches
  const filteredMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allMatchesList.filter((m) => {
      // Status filter
      if (statusFilter === 'COMPLETED' && !m.isCompleted) return false;
      if (statusFilter === 'CANCELLED' && !m.isCancelled) return false;
      if (statusFilter === 'UPCOMING' && (m.isCompleted || m.isCancelled)) return false;

      // Search filter
      if (q) {
        const matchesNum = m.matchNumber.toLowerCase().includes(q);
        const matchesDate = m.date.toLowerCase().includes(q);
        const matchesTime = m.time.toLowerCase().includes(q);
        const matchesStatus = m.status.toLowerCase().includes(q);
        return matchesNum || matchesDate || matchesTime || matchesStatus;
      }

      return true;
    });
  }, [allMatchesList, searchQuery, statusFilter]);

  const handleCopy = async (e: React.MouseEvent, m: Match) => {
    e.stopPropagation();
    const success = await copyMatchNumber(m.matchNumber);
    if (success) {
      setCopiedId(m.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-24">
      {/* Header Banner */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Match History
              </h2>
              <p className="text-[11px] text-slate-400">Search and review past match logs</p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-500 font-mono tabular-nums">
            {filteredMatches.length} Matches
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search match number, date (YYYY-MM-DD), time, status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {(['ALL', 'COMPLETED', 'CANCELLED', 'UPCOMING'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 capitalize ${
                statusFilter === st
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {st.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Matches List Table / Cards */}
      <div className="space-y-2">
        {filteredMatches.length === 0 ? (
          <div className="rounded-3xl p-8 bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 text-center py-12">
            <History className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No history found
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Adjust your filters or host more matches to populate history.
            </p>
          </div>
        ) : (
          filteredMatches.map((m) => (
            <div
              key={m.id}
              onClick={() => setSelectedMatchForDetail(m)}
              className="p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/80 hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                    m.isCompleted
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : m.isCancelled
                      ? 'bg-rose-500/15 text-rose-500'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {m.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : m.isCancelled ? (
                    <XCircle className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                      #{m.matchNumber}
                    </span>
                    <button
                      onClick={(e) => handleCopy(e, m)}
                      title="Copy match number"
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <span className="text-[10px] text-slate-400">
                      Match #{m.slot + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="font-semibold">{m.date}</span>
                    <span>·</span>
                    <span>{m.time}</span>
                    {idpLogMap[m.id] && (
                      <>
                        <span>·</span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded ${
                            idpLogMap[m.id].diffType === 'early'
                              ? 'text-emerald-600 bg-emerald-500/10'
                              : idpLogMap[m.id].diffType === 'on_time'
                              ? 'text-sky-600 bg-sky-500/10'
                              : 'text-rose-600 bg-rose-500/10'
                          }`}
                        >
                          <Clock className="w-2.5 h-2.5" />
                          IDP: {idpLogMap[m.id].idpClickTime} ({idpLogMap[m.id].diffFormatted})
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="text-left sm:text-right">
                  <span
                    className={`text-xs font-extrabold tabular-nums block ${
                      m.isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {m.isCompleted ? `+₹${m.earning}` : '₹0'}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    {m.isCompleted ? 'Completed' : m.isCancelled ? 'Cancelled' : 'Pending'}
                  </span>
                  {m.isCancelled && m.cancelReason && (
                    <span className="text-[10px] font-medium text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded block mt-0.5 max-w-[160px] truncate">
                      {m.cancelReason}
                    </span>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    executeProofWorkflow(m);
                  }}
                  className="px-2.5 py-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 rounded-xl flex items-center gap-1"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Proof</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
