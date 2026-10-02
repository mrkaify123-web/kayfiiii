import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PastelThemeName } from '../types';
import { PASTEL_THEMES } from '../utils/themes';
import { PASTEL_BACKGROUNDS } from '../utils/pastelBackgrounds';
import { playNotificationSound, triggerHaptic } from '../utils/audio';
import { downloadCsvFile, downloadJsonFile, generateCsvData } from '../utils/export';
import { DEFAULT_IDP_BASE_URL, DEFAULT_WIN_BASE_URL, getIdpUrl, getWinUrl } from '../utils/matchGenerator';
import {
  Palette,
  Bell,
  Sliders,
  Layout,
  Database,
  Moon,
  Sun,
  Volume2,
  Vibrate,
  RotateCcw,
  Download,
  Upload,
  FileSpreadsheet,
  Trash2,
  Check,
  Radio,
  Sparkles,
  Link,
  ExternalLink,
  Search,
  X,
  Heart,
  Utensils,
  Droplets,
  Coffee,
  Plus,
  Target,
} from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    allDailyData,
    importDataBackup,
    resetAllData,
    setToastMessage,
    addNotification,
    wellnessSettings,
    updateWellnessSettings,
    focusMode,
    setFocusMode,
    triggerManualBreak,
  } = useApp();

  const [newMealLabel, setNewMealLabel] = useState('');
  const [newMealTime, setNewMealTime] = useState('13:00');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [pendingRestoreJson, setPendingRestoreJson] = useState<string | null>(null);

  const themeList = Object.keys(PASTEL_THEMES) as PastelThemeName[];

  // Pastel Background Filter State
  const [bgSearch, setBgSearch] = useState('');
  const [bgCategory, setBgCategory] = useState<'all' | 'blue' | 'green' | 'teal' | 'peach' | 'pink' | 'cream' | 'gray'>('all');

  const filteredBackgrounds = useMemo(() => {
    let list = PASTEL_BACKGROUNDS;
    if (bgCategory !== 'all') {
      list = list.filter((b) => b.category === bgCategory);
    }
    if (bgSearch.trim()) {
      const q = bgSearch.trim().toLowerCase();
      list = list.filter((b) => b.name.toLowerCase().includes(q) || b.categoryLabel.toLowerCase().includes(q));
    }
    return list;
  }, [bgCategory, bgSearch]);

  const handleSelectBackground = (bgName: string) => {
    updateSettings((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, pastelBackground: bgName },
    }));
    setToastMessage({ text: `Background updated to ${bgName}` });
  };

  const handleResetBackground = () => {
    updateSettings((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, pastelBackground: null },
    }));
    setToastMessage({ text: 'Background reset to theme default' });
  };

  // SkillClash Links State
  const [idpUrlInput, setIdpUrlInput] = useState(
    settings.hosting.idpBaseUrl || DEFAULT_IDP_BASE_URL
  );
  const [winningUrlInput, setWinningUrlInput] = useState(
    settings.hosting.winningBaseUrl || DEFAULT_WIN_BASE_URL
  );

  useEffect(() => {
    setIdpUrlInput(settings.hosting.idpBaseUrl || DEFAULT_IDP_BASE_URL);
    setWinningUrlInput(settings.hosting.winningBaseUrl || DEFAULT_WIN_BASE_URL);
  }, [settings.hosting.idpBaseUrl, settings.hosting.winningBaseUrl]);

  const handleSaveLinks = () => {
    const cleanIdp = idpUrlInput.trim() || DEFAULT_IDP_BASE_URL;
    const cleanWin = winningUrlInput.trim() || DEFAULT_WIN_BASE_URL;

    updateSettings((prev) => ({
      ...prev,
      hosting: {
        ...prev.hosting,
        idpBaseUrl: cleanIdp,
        winningBaseUrl: cleanWin,
      },
    }));
    setIdpUrlInput(cleanIdp);
    setWinningUrlInput(cleanWin);
    setToastMessage({ text: 'SkillClash links saved successfully!' });
  };

  const handleResetLinks = () => {
    setIdpUrlInput(DEFAULT_IDP_BASE_URL);
    setWinningUrlInput(DEFAULT_WIN_BASE_URL);
    updateSettings((prev) => ({
      ...prev,
      hosting: {
        ...prev.hosting,
        idpBaseUrl: DEFAULT_IDP_BASE_URL,
        winningBaseUrl: DEFAULT_WIN_BASE_URL,
      },
    }));
    setToastMessage({ text: 'SkillClash links restored to default values.' });
  };

  const handleTestIdp = () => {
    const sampleMatch = '332212';
    const url = getIdpUrl(sampleMatch, idpUrlInput);
    window.open(url, '_blank', 'noopener,noreferrer');
    setToastMessage({ text: `Testing IDP link: ${url}` });
  };

  const handleTestWinning = () => {
    const sampleMatch = '332212';
    const url = getWinUrl(sampleMatch, winningUrlInput);
    window.open(url, '_blank', 'noopener,noreferrer');
    setToastMessage({ text: `Testing Winning link: ${url}` });
  };

  // Appearance handlers
  const handleModeChange = (mode: 'light' | 'dark') => {
    updateSettings((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, mode },
    }));
    setToastMessage({ text: `Theme set to ${mode === 'light' ? 'Light' : 'Dark'} Mode` });
  };

  const handleThemeChange = (themeName: PastelThemeName) => {
    updateSettings((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, pastelTheme: themeName, customAccentColor: null },
    }));
  };

  const handleCustomColor = (color: string) => {
    updateSettings((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, customAccentColor: color },
    }));
  };

  const handleResetAppearance = () => {
    updateSettings((prev) => ({
      ...prev,
      appearance: {
        mode: 'dark',
        pastelTheme: 'Teal',
        customAccentColor: null,
        pastelBackground: null,
      },
    }));
    setToastMessage({ text: 'Appearance reset to default' });
  };

  // Test Notification
  const handleTestNotification = () => {
    playNotificationSound(settings.notifications.sound);
    triggerHaptic(settings.notifications.vibration);
    addNotification(
      'Test Notification',
      'This is a preview of your match notification sound and settings.',
      'info'
    );
    setToastMessage({ text: 'Notification preview triggered!' });
  };

  // Export JSON Backup
  const handleExportJson = () => {
    const payload = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      allDailyData,
      settings,
    };
    downloadJsonFile(payload, `ff_hosting_backup_${new Date().toISOString().slice(0, 10)}.json`);
    setToastMessage({ text: 'Backup downloaded successfully!' });
  };

  // Export CSV
  const handleExportCsv = () => {
    const csv = generateCsvData(allDailyData);
    downloadCsvFile(csv, `ff_hosting_export_${new Date().toISOString().slice(0, 10)}.csv`);
    setToastMessage({ text: 'CSV export downloaded!' });
  };

  // Restore file trigger
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setPendingRestoreJson(content);
        setConfirmRestoreOpen(true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const executeRestore = () => {
    if (pendingRestoreJson) {
      const success = importDataBackup(pendingRestoreJson);
      if (!success) {
        setToastMessage({ text: 'Failed to restore: Invalid backup file.' });
      }
      setPendingRestoreJson(null);
    }
    setConfirmRestoreOpen(false);
  };

  return (
    <div className="space-y-5 pb-24 max-w-3xl mx-auto">
      {/* 1. APPEARANCE SETTINGS */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Appearance
              </h2>
              <p className="text-[11px] text-slate-400">Theme, light/dark mode & colors</p>
            </div>
          </div>

          <button
            onClick={handleResetAppearance}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to Default</span>
          </button>
        </div>

        {/* Light / Dark Mode Toggle */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Color Scheme
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleModeChange('light')}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                settings.appearance.mode === 'light'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-200 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Light Mode</span>
            </button>

            <button
              onClick={() => handleModeChange('dark')}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                settings.appearance.mode === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Moon className="w-4 h-4 text-sky-400" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        {/* 14 Pastel Themes Palette */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Pastel Themes (No Purple)
            </span>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold">
              Active: {settings.appearance.pastelTheme}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {themeList.map((th) => {
              const cfg = PASTEL_THEMES[th];
              const isSelected = settings.appearance.pastelTheme === th && !settings.appearance.customAccentColor;

              return (
                <button
                  key={th}
                  onClick={() => handleThemeChange(th)}
                  className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'border-slate-900 dark:border-white shadow-xs bg-slate-50 dark:bg-slate-800'
                      : 'border-slate-200/60 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: cfg.primary }}
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {th}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Accent Color */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Custom Accent Color (Optional)
            </span>
            {settings.appearance.customAccentColor && (
              <button
                onClick={() => handleCustomColor('')}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear Custom
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.appearance.customAccentColor || '#14b8a6'}
              onChange={(e) => handleCustomColor(e.target.value)}
              className="w-9 h-9 rounded-xl border-0 cursor-pointer bg-transparent"
            />
            <span className="text-xs font-mono text-slate-500">
              {settings.appearance.customAccentColor || 'Using theme default'}
            </span>
          </div>
        </div>

        {/* Dedicated Appearance -> Background Section (Feature: Custom Pastel Background Selector) */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Pastel Background (Light Mode)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  {settings.appearance.pastelBackground ? settings.appearance.pastelBackground : `Default (${settings.appearance.pastelTheme})`}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Choose a soothing non-white pastel background. Automatically harmonizes cards, borders and text.
              </p>
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleResetBackground}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1 border border-slate-200/60 dark:border-slate-700"
                title="Use active theme's default pastel background"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Default</span>
              </button>
              {settings.appearance.pastelBackground && (
                <button
                  type="button"
                  onClick={handleResetBackground}
                  className="px-2.5 py-1 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors border border-rose-500/20"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search pastel background (e.g. mint, peach, sky, cream)..."
                value={bgSearch}
                onChange={(e) => setBgSearch(e.target.value)}
                className="w-full pl-8.5 pr-8 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              />
              {bgSearch && (
                <button
                  onClick={() => setBgSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'all', label: 'All (37)' },
                { id: 'blue', label: 'Blue & Sky' },
                { id: 'green', label: 'Green & Mint' },
                { id: 'teal', label: 'Teal & Aqua' },
                { id: 'peach', label: 'Peach & Coral' },
                { id: 'pink', label: 'Pink & Rose' },
                { id: 'cream', label: 'Cream & Warm' },
                { id: 'gray', label: 'Slate & Gray' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setBgCategory(cat.id as any)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                    bgCategory === cat.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Swatches Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1">
            {filteredBackgrounds.map((bg) => {
              const isSelected =
                settings.appearance.pastelBackground === bg.name ||
                settings.appearance.pastelBackground?.toLowerCase() === bg.name.toLowerCase();

              return (
                <button
                  key={bg.name}
                  onClick={() => handleSelectBackground(bg.name)}
                  className={`p-2 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'border-teal-500 ring-2 ring-teal-500/30 bg-teal-500/10 shadow-xs'
                      : 'border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-6 h-6 rounded-xl shrink-0 shadow-xs border border-slate-300/60"
                      style={{ backgroundColor: bg.hex }}
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                        {bg.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">
                        {bg.hex}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-teal-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {filteredBackgrounds.length === 0 && (
            <p className="text-xs text-slate-400 py-3 text-center">
              No pastel backgrounds matched "{bgSearch}".
            </p>
          )}

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 text-[11px] text-slate-500 dark:text-slate-400">
            💡 <strong>Soft Pastel Atmosphere:</strong> Light Mode always uses non-white soft pastel tones (#FFFFFF full-page glare is eliminated). In Dark Mode, an independent deep slate interface is preserved.
          </div>
        </div>
      </div>

      {/* 2. NOTIFICATIONS SETTINGS */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Notifications & Alerts
              </h2>
              <p className="text-[11px] text-slate-400">Match reminders, audio chime & haptics</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications.enabled}
              onChange={(e) =>
                updateSettings((prev) => ({
                  ...prev,
                  notifications: { ...prev.notifications, enabled: e.target.checked },
                }))
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500" />
          </label>
        </div>

        {/* Notify Before Options */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Notify Before Match
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[1, 2, 3, 5, 10, 15].map((mins) => (
              <button
                key={mins}
                onClick={() =>
                  updateSettings((prev) => ({
                    ...prev,
                    notifications: { ...prev.notifications, notifyBeforeMinutes: mins },
                  }))
                }
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  settings.notifications.notifyBeforeMinutes === mins
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs border-transparent'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {mins} min
              </button>
            ))}
          </div>
        </div>

        {/* Sound Selection & Vibration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Sound Chime
            </label>
            <select
              value={settings.notifications.sound}
              onChange={(e) => {
                const snd = e.target.value as 'default' | 'soft' | 'bell' | 'none';
                updateSettings((prev) => ({
                  ...prev,
                  notifications: { ...prev.notifications, sound: snd },
                }));
                playNotificationSound(snd);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="default">Default Chime</option>
              <option value="soft">Soft Droplet</option>
              <option value="bell">Crystal Bell</option>
              <option value="none">None (Mute)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Haptic / Vibration
            </label>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-600 dark:text-slate-400">Vibrate on actions</span>
              <input
                type="checkbox"
                checked={settings.notifications.vibration}
                onChange={(e) =>
                  updateSettings((prev) => ({
                    ...prev,
                    notifications: { ...prev.notifications, vibration: e.target.checked },
                  }))
                }
                className="w-4 h-4 rounded text-teal-600"
              />
            </div>
          </div>
        </div>

        {/* Test Notification Trigger */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={handleTestNotification}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Volume2 className="w-3.5 h-3.5 text-teal-500" />
            <span>TEST NOTIFICATION</span>
          </button>
        </div>
      </div>

      {/* 2.5 WELLNESS SETTINGS */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Wellness & Health Reminders
              </h2>
              <p className="text-[11px] text-slate-400">Regular breaks, meals, hydration, and rest intervals</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={wellnessSettings.enabled}
              onChange={(e) =>
                updateWellnessSettings((prev) => ({
                  ...prev,
                  enabled: e.target.checked,
                }))
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500" />
          </label>
        </div>

        {/* Break Interval Options */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Break Reminder Interval
            </span>
            <span className="text-[11px] text-slate-400">
              During hosting hours (delayed if match starts ≤ 2 min)
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() =>
                updateWellnessSettings((prev) => ({
                  ...prev,
                  breakIntervalType: '2h',
                  breakIntervalMinutes: 120,
                }))
              }
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                wellnessSettings.breakIntervalType === '2h'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs border-transparent'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Every 2 Hours
            </button>
            <button
              type="button"
              onClick={() =>
                updateWellnessSettings((prev) => ({
                  ...prev,
                  breakIntervalType: '3h',
                  breakIntervalMinutes: 180,
                }))
              }
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                wellnessSettings.breakIntervalType === '3h'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs border-transparent'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Every 3 Hours
            </button>
            <button
              type="button"
              onClick={() =>
                updateWellnessSettings((prev) => ({
                  ...prev,
                  breakIntervalType: 'custom',
                }))
              }
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                wellnessSettings.breakIntervalType === 'custom'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs border-transparent'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Custom
            </button>
          </div>

          {wellnessSettings.breakIntervalType === 'custom' && (
            <div className="flex items-center gap-3 pt-1">
              <label className="text-xs text-slate-500 shrink-0">Interval (minutes):</label>
              <input
                type="number"
                min="15"
                max="480"
                step="15"
                value={wellnessSettings.breakIntervalMinutes}
                onChange={(e) => {
                  const val = Math.max(15, parseInt(e.target.value, 10) || 120);
                  updateWellnessSettings((prev) => ({
                    ...prev,
                    breakIntervalMinutes: val,
                  }));
                }}
                className="w-28 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
              />
              <span className="text-xs text-slate-400 font-medium">
                ({Math.round((wellnessSettings.breakIntervalMinutes / 60) * 10) / 10} hours)
              </span>
            </div>
          )}
        </div>

        {/* 1. Food Timing & Meal Schedule */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Food Reminders & Fixed Meal Times
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={wellnessSettings.foodEnabled}
                onChange={(e) =>
                  updateWellnessSettings((prev) => ({
                    ...prev,
                    foodEnabled: e.target.checked,
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
            </label>
          </div>

          {/* List of Configured Meal Times */}
          <div className="space-y-2">
            {(wellnessSettings.mealTimes || []).map((meal) => (
              <div
                key={meal.id}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-800"
              >
                <input
                  type="checkbox"
                  checked={meal.enabled}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    updateWellnessSettings((prev) => ({
                      ...prev,
                      mealTimes: prev.mealTimes.map((m) =>
                        m.id === meal.id ? { ...m, enabled: checked } : m
                      ),
                    }));
                  }}
                  className="w-4 h-4 rounded text-amber-500"
                />
                <input
                  type="text"
                  value={meal.label}
                  onChange={(e) => {
                    const text = e.target.value;
                    updateWellnessSettings((prev) => ({
                      ...prev,
                      mealTimes: prev.mealTimes.map((m) =>
                        m.id === meal.id ? { ...m, label: text } : m
                      ),
                    }));
                  }}
                  placeholder="Meal Name (e.g. Lunch)"
                  className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                />
                <input
                  type="time"
                  value={meal.time}
                  onChange={(e) => {
                    const timeVal = e.target.value;
                    updateWellnessSettings((prev) => ({
                      ...prev,
                      mealTimes: prev.mealTimes.map((m) =>
                        m.id === meal.id ? { ...m, time: timeVal } : m
                      ),
                    }));
                  }}
                  className="px-2 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    updateWellnessSettings((prev) => ({
                      ...prev,
                      mealTimes: prev.mealTimes.filter((m) => m.id !== meal.id),
                    }));
                  }}
                  title="Remove meal time"
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Add New Meal Row */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="New meal (e.g. Snack, Dinner)"
                value={newMealLabel}
                onChange={(e) => setNewMealLabel(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              />
              <input
                type="time"
                value={newMealTime}
                onChange={(e) => setNewMealTime(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newMealLabel.trim()) {
                    setToastMessage({ text: 'Please enter a meal name' });
                    return;
                  }
                  const newMeal = {
                    id: `meal_${Date.now()}`,
                    label: newMealLabel.trim(),
                    time: newMealTime || '17:00',
                    enabled: true,
                  };
                  updateWellnessSettings((prev) => ({
                    ...prev,
                    mealTimes: [...(prev.mealTimes || []), newMeal],
                  }));
                  setNewMealLabel('');
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Water Hydration Reminders */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Water Hydration Reminders
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={wellnessSettings.waterEnabled}
                onChange={(e) =>
                  updateWellnessSettings((prev) => ({
                    ...prev,
                    waterEnabled: e.target.checked,
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500" />
            </label>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-500 shrink-0">Remind every:</label>
            <input
              type="number"
              min="15"
              max="240"
              step="15"
              value={wellnessSettings.waterIntervalMinutes}
              onChange={(e) => {
                const val = Math.max(15, parseInt(e.target.value, 10) || 60);
                updateWellnessSettings((prev) => ({
                  ...prev,
                  waterIntervalMinutes: val,
                }));
              }}
              className="w-24 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
            />
            <span className="text-xs text-slate-400">minutes (default: 60 min)</span>
          </div>
        </div>

        {/* 3. Rest & Eye-Break Reminders */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Rest & Eye-Break Reminders
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={wellnessSettings.restEnabled}
                onChange={(e) =>
                  updateWellnessSettings((prev) => ({
                    ...prev,
                    restEnabled: e.target.checked,
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Rest Duration:</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={wellnessSettings.restDurationMinutes}
                  onChange={(e) => {
                    const val = Math.max(5, parseInt(e.target.value, 10) || 10);
                    updateWellnessSettings((prev) => ({
                      ...prev,
                      restDurationMinutes: val,
                    }));
                  }}
                  className="w-24 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                />
                <span className="text-xs text-slate-400">minutes (default: 10)</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1">Rest Interval:</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="30"
                  max="360"
                  step="30"
                  value={wellnessSettings.restIntervalMinutes}
                  onChange={(e) => {
                    const val = Math.max(30, parseInt(e.target.value, 10) || 120);
                    updateWellnessSettings((prev) => ({
                      ...prev,
                      restIntervalMinutes: val,
                    }));
                  }}
                  className="w-24 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                />
                <span className="text-xs text-slate-400">minutes</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Sound & Vibration Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Sound Chime
            </label>
            <select
              value={wellnessSettings.sound}
              onChange={(e) => {
                const snd = e.target.value as 'default' | 'soft' | 'bell' | 'none';
                updateWellnessSettings((prev) => ({
                  ...prev,
                  sound: snd,
                }));
                playNotificationSound(snd);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="bell">Crystal Bell</option>
              <option value="soft">Soft Droplet</option>
              <option value="default">Default Chime</option>
              <option value="none">None (Mute)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Haptics / Vibration
            </label>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-600 dark:text-slate-400">Vibrate on break</span>
              <input
                type="checkbox"
                checked={wellnessSettings.vibration}
                onChange={(e) =>
                  updateWellnessSettings((prev) => ({
                    ...prev,
                    vibration: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded text-teal-600"
              />
            </div>
          </div>

          <div className="space-y-1.5 flex flex-col justify-end">
            <button
              type="button"
              onClick={() => {
                if (wellnessSettings.soundEnabled && wellnessSettings.sound !== 'none') {
                  playNotificationSound(wellnessSettings.sound);
                }
                if (wellnessSettings.vibration) {
                  triggerHaptic(true);
                }
                triggerManualBreak();
              }}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/25 transition-all flex items-center justify-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>TEST REMINDER POPUP</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2.6 FOCUS MODE SETTINGS */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Focus Mode (Distraction-Free)
              </h2>
              <p className="text-[11px] text-slate-400">
                Streamlined view with only Current & Next match, quick actions, and earnings
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={focusMode}
              onChange={(e) => setFocusMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500" />
          </label>
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* AMOLED Pure Black */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                AMOLED Pure Black Theme
              </span>
              <span className="text-[11px] text-slate-400">
                True #000000 background in Focus Mode for battery saving and high contrast
              </span>
            </div>
            <input
              type="checkbox"
              checked={!!settings.hosting.focusModeAmoled}
              onChange={(e) =>
                updateSettings((prev) => ({
                  ...prev,
                  hosting: { ...prev.hosting, focusModeAmoled: e.target.checked },
                }))
              }
              className="w-4 h-4 rounded text-teal-600"
            />
          </div>

          {/* Auto Enable Focus Mode before matches */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Auto-Enable Before Match
                </span>
                <span className="text-[11px] text-slate-400">
                  Automatically switch to Focus Mode when next match is about to start
                </span>
              </div>
              <input
                type="checkbox"
                checked={!!settings.hosting.focusModeAutoEnable}
                onChange={(e) =>
                  updateSettings((prev) => ({
                    ...prev,
                    hosting: { ...prev.hosting, focusModeAutoEnable: e.target.checked },
                  }))
                }
                className="w-4 h-4 rounded text-teal-600"
              />
            </div>

            {settings.hosting.focusModeAutoEnable && (
              <div className="flex items-center gap-2 pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                <span className="text-xs text-slate-500">Activate before:</span>
                {[1, 2, 3, 5, 10].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() =>
                      updateSettings((prev) => ({
                        ...prev,
                        hosting: { ...prev.hosting, focusModeAutoMinutes: mins },
                      }))
                    }
                    className={`py-1 px-2.5 rounded-lg text-xs font-bold border transition-all ${
                      (settings.hosting.focusModeAutoMinutes || 5) === mins
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. HOSTING SETTINGS */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              Hosting Configuration
            </h2>
            <p className="text-[11px] text-slate-400">Earning rates, daily targets, and endpoints</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Earning Rate per Match (₹)
            </label>
            <input
              type="number"
              min="1"
              value={settings.hosting.earningRate}
              onChange={(e) =>
                updateSettings((prev) => ({
                  ...prev,
                  hosting: { ...prev.hosting, earningRate: Math.max(1, parseInt(e.target.value, 10) || 3) },
                }))
              }
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Daily Target (₹)
            </label>
            <input
              type="number"
              min="1"
              value={settings.hosting.dailyTarget}
              onChange={(e) =>
                updateSettings((prev) => ({
                  ...prev,
                  hosting: { ...prev.hosting, dailyTarget: Math.max(1, parseInt(e.target.value, 10) || 147) },
                }))
              }
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* 4. SKILLCLASH LINKS */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Link className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                SKILLCLASH LINKS
              </h2>
              <p className="text-[11px] text-slate-400">
                Configure base URLs used by IDP and WINNING buttons across the app
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetLinks}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET TO DEFAULT LINKS</span>
          </button>
        </div>

        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* IDP Base URL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                IDP Base URL
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                Default: {DEFAULT_IDP_BASE_URL}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={idpUrlInput}
                onChange={(e) => setIdpUrlInput(e.target.value)}
                placeholder={DEFAULT_IDP_BASE_URL}
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              />
              <button
                type="button"
                onClick={handleTestIdp}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 flex items-center justify-center gap-1.5 transition-colors shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>TEST IDP LINK</span>
              </button>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 text-[11px] text-slate-500 flex items-center justify-between gap-2">
              <span className="shrink-0 text-slate-400">Sample URL (Match 332212):</span>
              <span className="font-mono text-sky-600 dark:text-sky-400 truncate text-right">
                {getIdpUrl('332212', idpUrlInput)}
              </span>
            </div>
          </div>

          {/* Winning Base URL */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Winning Base URL
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                Default: {DEFAULT_WIN_BASE_URL}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={winningUrlInput}
                onChange={(e) => setWinningUrlInput(e.target.value)}
                placeholder={DEFAULT_WIN_BASE_URL}
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              />
              <button
                type="button"
                onClick={handleTestWinning}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 flex items-center justify-center gap-1.5 transition-colors shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>TEST WINNING LINK</span>
              </button>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 text-[11px] text-slate-500 flex items-center justify-between gap-2">
              <span className="shrink-0 text-slate-400">Sample URL (Match 332212):</span>
              <span className="font-mono text-amber-600 dark:text-amber-400 truncate text-right">
                {getWinUrl('332212', winningUrlInput)}
              </span>
            </div>
          </div>

          {/* Action Buttons: SAVE LINKS & RESET TO DEFAULT LINKS */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleResetLinks}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET TO DEFAULT LINKS</span>
            </button>

            <button
              type="button"
              onClick={handleSaveLinks}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-teal-600 hover:bg-teal-500 shadow-sm shadow-teal-500/20 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>SAVE LINKS</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. DISPLAY SETTINGS */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
            <Layout className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              Display & Widgets
            </h2>
            <p className="text-[11px] text-slate-400">Card density & home screen customization</p>
          </div>
        </div>

        {/* Display Density */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Card Density
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                updateSettings((prev) => ({
                  ...prev,
                  display: { ...prev.display, density: 'comfortable' },
                }))
              }
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                settings.display.density === 'comfortable'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Comfortable
            </button>
            <button
              onClick={() =>
                updateSettings((prev) => ({
                  ...prev,
                  display: { ...prev.display, density: 'compact' },
                }))
              }
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                settings.display.density === 'compact'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Compact
            </button>
          </div>
        </div>

        {/* Auto Scroll */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Auto-Scroll to Current Match
            </span>
            <span className="text-[11px] text-slate-400">
              Center the active match on view opening
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.display.autoScrollToCurrent}
            onChange={(e) =>
              updateSettings((prev) => ({
                ...prev,
                display: { ...prev.display, autoScrollToCurrent: e.target.checked },
              }))
            }
            className="w-4 h-4 rounded text-teal-600"
          />
        </div>
      </div>

      {/* 5. DATA BACKUP & RESTORE */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              Data, Backup & Export
            </h2>
            <p className="text-[11px] text-slate-400">Persist, export CSV or restore full dataset</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Backup JSON */}
          <button
            onClick={handleExportJson}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Download className="w-4 h-4 text-teal-500" />
            <span>Backup JSON</span>
          </button>

          {/* Restore JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Upload className="w-4 h-4 text-sky-500" />
            <span>Restore JSON</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Reset All Data (Destructive) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => setConfirmResetOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset All App Data</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={confirmRestoreOpen}
        title="Restore Data Backup"
        message="Are you sure you want to restore this backup? It will merge with your current data and update your settings."
        confirmText="Yes, Restore"
        variant="warning"
        onConfirm={executeRestore}
        onCancel={() => {
          setConfirmRestoreOpen(false);
          setPendingRestoreJson(null);
        }}
      />

      <ConfirmModal
        isOpen={confirmResetOpen}
        title="Reset All Data"
        message="This will completely clear your stored match history, earnings, notes, and reset settings to default. This cannot be undone."
        confirmText="Yes, Reset Everything"
        variant="danger"
        onConfirm={() => {
          setConfirmResetOpen(false);
          resetAllData();
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </div>
  );
};
