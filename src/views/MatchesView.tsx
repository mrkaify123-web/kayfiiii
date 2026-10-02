import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MatchCard } from '../components/MatchCard';
import { Search, Pin, Radio, ArrowUp, SlidersHorizontal, Filter } from 'lucide-react';

interface MatchesViewProps {
  onOpenDailySetup: () => void;
}

export const MatchesView: React.FC<MatchesViewProps> = ({ onOpenDailySetup }) => {
  const { currentDailyData, currentMatch, settings } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [showJumpToCurrent, setShowJumpToCurrent] = useState(false);

  const currentMatchRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll on initial mount if enabled
  useEffect(() => {
    if (settings.display.autoScrollToCurrent && currentMatchRef.current) {
      currentMatchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [settings.display.autoScrollToCurrent]);

  // Window scroll listener for floating Jump to Current button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowJumpToCurrent(true);
      } else {
        setShowJumpToCurrent(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleJumpToCurrent = () => {
    if (currentMatchRef.current) {
      currentMatchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Filter & Search matches
  const { pinnedMatches, regularMatches } = useMemo(() => {
    const all = currentDailyData.matches || [];
    const q = searchQuery.trim().toLowerCase();

    const filtered = all.filter((m) => {
      // Status filter
      if (statusFilter === 'COMPLETED' && !m.isCompleted) return false;
      if (statusFilter === 'CANCELLED' && !m.isCancelled) return false;
      if (statusFilter === 'UPCOMING' && (m.isCompleted || m.isCancelled)) return false;

      // Search query
      if (q) {
        const matchesNum = m.matchNumber.toLowerCase().includes(q);
        const matchesTime = m.time.toLowerCase().includes(q);
        const matchesStatus = m.status.toLowerCase().includes(q);
        const matchesSlot = String(m.slot + 1) === q;
        const matchesCount = m.sequentialCount != null ? `#${m.sequentialCount}`.toLowerCase().includes(q) || String(m.sequentialCount) === q : false;
        return matchesNum || matchesTime || matchesStatus || matchesSlot || matchesCount;
      }
      return true;
    });

    return {
      pinnedMatches: filtered.filter((m) => m.isPinned),
      regularMatches: filtered.filter((m) => !m.isPinned),
    };
  }, [currentDailyData.matches, searchQuery, statusFilter]);

  const totalMatchesCount = currentDailyData.matches.length;

  return (
    <div className="space-y-4 sm:space-y-5 pb-24">
      {/* Top Controls: Search & Setup */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search match number, slot, time..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 shadow-xs"
          />
        </div>

        {/* Daily Setup Trigger */}
        <button
          onClick={onOpenDailySetup}
          className="h-10 px-3.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shrink-0"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-teal-500" />
          <span>Setup Schedule ({totalMatchesCount})</span>
        </button>
      </div>

      {/* Pastel Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            statusFilter === 'ALL'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800'
          }`}
        >
          All ({totalMatchesCount})
        </button>

        <button
          onClick={() => setStatusFilter('UPCOMING')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            statusFilter === 'UPCOMING'
              ? 'bg-sky-500 text-white shadow-xs'
              : 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20'
          }`}
        >
          Upcoming ({currentDailyData.matches.filter((m) => !m.isCompleted && !m.isCancelled).length})
        </button>

        <button
          onClick={() => setStatusFilter('COMPLETED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            statusFilter === 'COMPLETED'
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
          }`}
        >
          Completed ({currentDailyData.completedCount})
        </button>

        <button
          onClick={() => setStatusFilter('CANCELLED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            statusFilter === 'CANCELLED'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
          }`}
        >
          Cancelled ({currentDailyData.cancelledCount})
        </button>
      </div>

      {/* Pinned Section */}
      {pinnedMatches.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 px-1">
            <Pin className="w-3.5 h-3.5 fill-current" />
            <span>PINNED MATCHES ({pinnedMatches.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {pinnedMatches.map((m) => (
              <MatchCard key={m.id} match={m} isCurrent={currentMatch?.id === m.id} />
            ))}
          </div>
        </div>
      )}

      {/* Regular Matches Section */}
      <div className="space-y-2">
        {pinnedMatches.length > 0 && (
          <span className="text-xs font-bold text-slate-400 px-1 block">
            ALL SCHEDULED MATCHES
          </span>
        )}

        {regularMatches.length === 0 && pinnedMatches.length === 0 ? (
          <div className="rounded-3xl p-8 bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 text-center py-12">
            <Filter className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No matches found
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search query or filter selection.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {regularMatches.map((m) => {
              const isCurrent = currentMatch?.id === m.id;
              return (
                <div
                  key={m.id}
                  ref={isCurrent ? currentMatchRef : undefined}
                >
                  <MatchCard match={m} isCurrent={isCurrent} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Jump to Current Match Button */}
      {showJumpToCurrent && currentMatch && (
        <div className="fixed bottom-24 right-4 z-30 animate-in fade-in slide-in-from-bottom-2">
          <button
            onClick={handleJumpToCurrent}
            style={{ backgroundColor: 'var(--primary-accent, #14b8a6)' }}
            className="flex items-center gap-2 py-2.5 px-4 rounded-full text-white font-bold text-xs shadow-lg shadow-teal-500/25 hover:opacity-95 active:scale-95 transition-all"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Current Match (#{currentMatch.matchNumber})</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
