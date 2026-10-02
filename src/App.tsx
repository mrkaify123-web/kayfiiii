import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { GlassNavbar } from './components/GlassNavbar';
import { MatchDetailBottomSheet } from './components/MatchDetailBottomSheet';
import { ExtraMatchesModal } from './components/ExtraMatchesModal';
import { DailySetupModal } from './components/DailySetupModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { HostingModeView } from './components/HostingModeView';

import { HomeView } from './views/HomeView';
import { MatchesView } from './views/MatchesView';
import { EarningsView } from './views/EarningsView';
import { CalendarView } from './views/CalendarView';
import { StatsView } from './views/StatsView';
import { HistoryView } from './views/HistoryView';
import { SettingsView } from './views/SettingsView';
import { WellnessView } from './views/WellnessView';
import { IdpLogView } from './views/IdpLogView';
import { FocusModeView } from './views/FocusModeView';
import { WellnessBreakPopup } from './components/WellnessBreakPopup';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    hostingMode,
    focusMode,
    wellnessPopupOpen,
    closeWellnessPopup,
    recordBreakAction,
    snoozeWellnessBreak,
    toastMessage,
    setToastMessage,
  } = useApp();

  const [extraModalOpen, setExtraModalOpen] = useState(false);
  const [dailySetupModalOpen, setDailySetupModalOpen] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);

  // If Focus Mode is active, render distraction-free screen
  if (focusMode) {
    return (
      <>
        <FocusModeView />
        <WellnessBreakPopup
          isOpen={wellnessPopupOpen}
          onClose={closeWellnessPopup}
          onDone={(checklist) => recordBreakAction('done', checklist)}
          onSnooze={(mins) => snoozeWellnessBreak(mins)}
          onSkip={() => recordBreakAction('skipped')}
        />
        <MatchDetailBottomSheet />
        {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="flex items-center gap-3 py-2 px-4 rounded-full bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-semibold shadow-xl backdrop-blur-md">
              <span>{toastMessage.text}</span>
            </div>
          </div>
        )}
      </>
    );
  }

  // If hosting mode is active, render the dedicated streamlined interface
  if (hostingMode) {
    return (
      <>
        <HostingModeView />
        <WellnessBreakPopup
          isOpen={wellnessPopupOpen}
          onClose={closeWellnessPopup}
          onDone={(checklist) => recordBreakAction('done', checklist)}
          onSnooze={(mins) => snoozeWellnessBreak(mins)}
          onSkip={() => recordBreakAction('skipped')}
        />
        <MatchDetailBottomSheet />
      </>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView
            onOpenExtraModal={() => setExtraModalOpen(true)}
            onOpenDailySetup={() => setDailySetupModalOpen(true)}
          />
        );
      case 'matches':
        return (
          <MatchesView
            onOpenDailySetup={() => setDailySetupModalOpen(true)}
          />
        );
      case 'earnings':
        return (
          <EarningsView
            onOpenExtraModal={() => setExtraModalOpen(true)}
          />
        );
      case 'calendar':
        return <CalendarView />;
      case 'wellness':
        return <WellnessView />;
      case 'idplog':
        return <IdpLogView />;
      case 'stats':
        return <StatsView />;
      case 'history':
        return <HistoryView />;
      case 'settings':
        return <SettingsView />;
      case 'setup':
        return (
          <HomeView
            onOpenExtraModal={() => setExtraModalOpen(true)}
            onOpenDailySetup={() => setDailySetupModalOpen(true)}
          />
        );
      default:
        return (
          <HomeView
            onOpenExtraModal={() => setExtraModalOpen(true)}
            onOpenDailySetup={() => setDailySetupModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors selection:bg-teal-500/20 selection:text-teal-700 dark:selection:text-teal-300">
      {/* Top Header */}
      <Header
        onOpenNotifications={() => setNotifModalOpen(true)}
        onOpenDailySetup={() => setDailySetupModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-20">
        {renderActiveView()}
      </main>

      {/* iPhone Floating Glass Bottom Navigation */}
      <GlassNavbar />

      {/* Floating Bottom Sheet Detail Modal */}
      <MatchDetailBottomSheet />

      {/* Extra Matches Modal */}
      <ExtraMatchesModal
        isOpen={extraModalOpen}
        onClose={() => setExtraModalOpen(false)}
      />

      {/* Daily Setup Modal */}
      <DailySetupModal
        isOpen={dailySetupModalOpen}
        onClose={() => setDailySetupModalOpen(false)}
      />

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={notifModalOpen}
        onClose={() => setNotifModalOpen(false)}
      />

      {/* Global Interactive Toast Notification with Undo */}
      {toastMessage && (
        <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-3 py-2.5 px-4 rounded-full bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 text-xs sm:text-sm font-semibold shadow-xl shadow-slate-950/20 backdrop-blur-md border border-white/10 dark:border-slate-800/10">
            <span>{toastMessage.text}</span>
            {toastMessage.actionText && toastMessage.onAction && (
              <button
                onClick={() => {
                  toastMessage.onAction?.();
                  setToastMessage(null);
                }}
                className="px-2.5 py-1 rounded-full text-xs font-bold text-teal-400 dark:text-teal-600 bg-teal-500/20 hover:bg-teal-500/30 transition-colors uppercase tracking-wider"
              >
                {toastMessage.actionText}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
