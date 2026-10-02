import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CurrentMatchHero } from '../components/CurrentMatchHero';
import { NextMatchWidget } from '../components/NextMatchWidget';
import { ProgressAndEarningsWidget } from '../components/ProgressAndEarningsWidget';
import { QuickActions } from '../components/QuickActions';
import { RecentActivityWidget } from '../components/RecentActivityWidget';
import { PinnedMatchesWidget } from '../components/PinnedMatchesWidget';
import { DailyPerformanceWidget } from '../components/DailyPerformanceWidget';
import { DailyNotesWidget } from '../components/DailyNotesWidget';
import { DailySummaryModal } from '../components/DailySummaryModal';
import { PreviousDayModal } from '../components/PreviousDayModal';
import { formatDateDisplay } from '../utils/ist';
import { Calendar, ChevronRight, ArrowLeft, Trophy, Target } from 'lucide-react';

interface HomeViewProps {
  onOpenExtraModal: () => void;
  onOpenDailySetup: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenExtraModal,
  onOpenDailySetup,
}) => {
  const {
    currentMatch,
    nextMatch,
    secondsToNextMatch,
    currentDailyData,
    selectedDate,
    setActiveTab,
    settings,
    focusMode,
    setFocusMode,
  } = useApp();

  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [prevDayModalOpen, setPrevDayModalOpen] = useState(false);

  const widgets = settings.display.widgets;

  // Match count calculation
  const matchCount =
    currentDailyData.manualCountOverride !== null && currentDailyData.manualCountOverride !== undefined
      ? currentDailyData.manualCountOverride
      : currentDailyData.completedCount + 1;

  return (
    <div className="space-y-4 sm:space-y-5 pb-24">
      {/* Date & Quick Switch Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('calendar')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-teal-500" />
            <span>{formatDateDisplay(selectedDate)}</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Action Pills: Focus Mode, Previous Day & Daily Summary */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFocusMode(true)}
            title="Switch to distraction-free Focus Mode"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 transition-all active:scale-95 shadow-sm"
          >
            <Target className="w-3 h-3 text-teal-500" />
            <span>Focus Mode</span>
          </button>

          <button
            onClick={() => setPrevDayModalOpen(true)}
            title="Quick view yesterday's matches & earnings"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all active:scale-95"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Previous Day</span>
          </button>

          <button
            onClick={() => setSummaryModalOpen(true)}
            title="View today's performance report"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 transition-all active:scale-95"
          >
            <Trophy className="w-3 h-3" />
            <span>Summary</span>
          </button>
        </div>
      </div>

      {/* Feature 14: Pinned Important Matches Widget */}
      <PinnedMatchesWidget />

      {/* 1. Current Match Hero */}
      {widgets.currentMatch && (
        <CurrentMatchHero match={currentMatch} matchCount={matchCount} />
      )}

      {/* 2. Next Match Live Countdown Widget */}
      {widgets.nextMatch && nextMatch && (
        <NextMatchWidget match={nextMatch} secondsRemaining={secondsToNextMatch} />
      )}

      {/* 3. Today's Progress & Earnings */}
      {(widgets.todayEarnings || widgets.todayProgress || widgets.dailyTarget) && (
        <ProgressAndEarningsWidget onOpenExtraModal={onOpenExtraModal} />
      )}

      {/* Feature 7: Daily Performance Summary Widget */}
      <DailyPerformanceWidget onOpenSummaryModal={() => setSummaryModalOpen(true)} />

      {/* 4. Quick Actions Grid */}
      {widgets.quickActions && (
        <QuickActions
          onOpenExtraModal={onOpenExtraModal}
          onOpenDailySetup={onOpenDailySetup}
        />
      )}

      {/* Feature 8: Daily Notes Widget */}
      <DailyNotesWidget />

      {/* 5. Recent Activity */}
      {widgets.recentActivity && <RecentActivityWidget />}

      {/* Modals */}
      <DailySummaryModal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
      />

      <PreviousDayModal
        isOpen={prevDayModalOpen}
        onClose={() => setPrevDayModalOpen(false)}
      />
    </div>
  );
};
