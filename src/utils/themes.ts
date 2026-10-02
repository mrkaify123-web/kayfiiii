import { PastelThemeName, ThemeConfig } from '../types';
import { findPastelBackground } from './pastelBackgrounds';

export const PASTEL_THEMES: Record<PastelThemeName, ThemeConfig> = {
  'Sky Blue': {
    name: 'Sky Blue',
    primary: '#38bdf8', // sky-400
    primaryLight: '#bae6fd',
    primaryDark: '#0284c7',
    bgLight: '#f0f9ff',
    cardLight: '#ffffff',
    cardDark: '#0f172a',
    accentSoft: 'rgba(56, 189, 248, 0.15)',
  },
  'Mint': {
    name: 'Mint',
    primary: '#34d399', // emerald-400
    primaryLight: '#a7f3d0',
    primaryDark: '#059669',
    bgLight: '#f0fdf4',
    cardLight: '#ffffff',
    cardDark: '#0d1f18',
    accentSoft: 'rgba(52, 211, 153, 0.15)',
  },
  'Aqua': {
    name: 'Aqua',
    primary: '#2dd4bf', // teal-400
    primaryLight: '#99f6e4',
    primaryDark: '#0d9488',
    bgLight: '#f0fdfa',
    cardLight: '#ffffff',
    cardDark: '#0b1d1c',
    accentSoft: 'rgba(45, 212, 191, 0.15)',
  },
  'Teal': {
    name: 'Teal',
    primary: '#14b8a6', // teal-500
    primaryLight: '#5eead4',
    primaryDark: '#0f766e',
    bgLight: '#f2fbf9',
    cardLight: '#ffffff',
    cardDark: '#091d1c',
    accentSoft: 'rgba(20, 184, 166, 0.15)',
  },
  'Peach': {
    name: 'Peach',
    primary: '#fb923c', // orange-400
    primaryLight: '#fed7aa',
    primaryDark: '#c2410c',
    bgLight: '#fff7ed',
    cardLight: '#ffffff',
    cardDark: '#1c1511',
    accentSoft: 'rgba(251, 146, 60, 0.15)',
  },
  'Coral': {
    name: 'Coral',
    primary: '#f87171', // red-400
    primaryLight: '#fecaca',
    primaryDark: '#dc2626',
    bgLight: '#fef2f2',
    cardLight: '#ffffff',
    cardDark: '#1c1212',
    accentSoft: 'rgba(248, 113, 113, 0.15)',
  },
  'Soft Pink': {
    name: 'Soft Pink',
    primary: '#f472b6', // pink-400
    primaryLight: '#fbcfe8',
    primaryDark: '#db2777',
    bgLight: '#fdf2f8',
    cardLight: '#ffffff',
    cardDark: '#1f1118',
    accentSoft: 'rgba(244, 114, 182, 0.15)',
  },
  'Sage': {
    name: 'Sage',
    primary: '#84cc16', // lime-500 muted
    primaryLight: '#bef264',
    primaryDark: '#4d7c0f',
    bgLight: '#f7fee7',
    cardLight: '#ffffff',
    cardDark: '#141a0f',
    accentSoft: 'rgba(132, 204, 22, 0.15)',
  },
  'Warm Yellow': {
    name: 'Warm Yellow',
    primary: '#eab308', // yellow-500
    primaryLight: '#fef08a',
    primaryDark: '#a16207',
    bgLight: '#fefce8',
    cardLight: '#ffffff',
    cardDark: '#1c1a0e',
    accentSoft: 'rgba(234, 179, 8, 0.15)',
  },
  'Soft Orange': {
    name: 'Soft Orange',
    primary: '#f97316', // orange-500
    primaryLight: '#ffedd5',
    primaryDark: '#c2410c',
    bgLight: '#fffaf5',
    cardLight: '#ffffff',
    cardDark: '#1c140e',
    accentSoft: 'rgba(249, 115, 22, 0.15)',
  },
  'Cream': {
    name: 'Cream',
    primary: '#d97706', // amber-600 soft
    primaryLight: '#fde68a',
    primaryDark: '#92400e',
    bgLight: '#fdfbf7',
    cardLight: '#ffffff',
    cardDark: '#1c1813',
    accentSoft: 'rgba(217, 119, 6, 0.15)',
  },
  'Beige': {
    name: 'Beige',
    primary: '#a8a29e', // stone-400
    primaryLight: '#e7e5e4',
    primaryDark: '#57534e',
    bgLight: '#fafaf9',
    cardLight: '#ffffff',
    cardDark: '#1c1b1a',
    accentSoft: 'rgba(168, 162, 158, 0.15)',
  },
  'Ocean Blue': {
    name: 'Ocean Blue',
    primary: '#0ea5e9', // sky-500
    primaryLight: '#7dd3fc',
    primaryDark: '#0369a1',
    bgLight: '#f0f8ff',
    cardLight: '#ffffff',
    cardDark: '#0b1623',
    accentSoft: 'rgba(14, 165, 233, 0.15)',
  },
  'Soft Green': {
    name: 'Soft Green',
    primary: '#22c55e', // green-500
    primaryLight: '#86efac',
    primaryDark: '#15803d',
    bgLight: '#f0fdf4',
    cardLight: '#ffffff',
    cardDark: '#0e1d13',
    accentSoft: 'rgba(34, 197, 94, 0.15)',
  },
};

export function applyThemeToDocument(
  themeName: PastelThemeName,
  isDark: boolean,
  customAccentColor?: string | null,
  customPastelBackground?: string | null
) {
  const theme = PASTEL_THEMES[themeName] || PASTEL_THEMES['Teal'];
  const root = document.documentElement;

  const primaryColor = customAccentColor || theme.primary;

  root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  root.classList.toggle('dark', isDark);
  root.classList.toggle('light', !isDark);

  // Core accent tokens
  root.style.setProperty('--primary-accent', primaryColor);
  root.style.setProperty('--primary-light', theme.primaryLight);
  root.style.setProperty('--primary-dark', theme.primaryDark);
  root.style.setProperty('--accent', primaryColor);
  root.style.setProperty('--accent-color', primaryColor);
  root.style.setProperty('--accent-soft', customAccentColor ? `${customAccentColor}26` : theme.accentSoft);
  root.style.setProperty('--accent-strong', isDark ? theme.primaryLight : theme.primaryDark);

  const themeMeta = document.querySelector('meta[name="theme-color"]');

  if (isDark) {
    // Dark mode tokens (independent of pastel background)
    root.style.setProperty('--app-background', '#0b0f19');
    root.style.setProperty('--background', '#0b0f19');
    root.style.setProperty('--surface', 'rgba(15, 23, 42, 0.90)');
    root.style.setProperty('--card-background', 'rgba(15, 23, 42, 0.90)');
    root.style.setProperty('--surface-secondary', '#131b2e');
    root.style.setProperty('--surface-elevated', '#1e293b');
    root.style.setProperty('--surface-hover', '#233149');
    root.style.setProperty('--text-primary', '#f8fafc');
    root.style.setProperty('--text-secondary', '#cbd5e1');
    root.style.setProperty('--text-muted', '#94a3b8');
    root.style.setProperty('--text-disabled', '#64748b');
    root.style.setProperty('--border-color', '#334155');
    root.style.setProperty('--border', '#334155');
    root.style.setProperty('--border-subtle', '#1e293b');
    root.style.setProperty('--icon', '#cbd5e1');
    root.style.setProperty('--icon-muted', '#64748b');
    root.style.setProperty('--button', '#1e293b');
    root.style.setProperty('--button-text', '#f8fafc');
    root.style.setProperty('--button-secondary', '#0f172a');
    root.style.setProperty('--button-secondary-text', '#cbd5e1');
    root.style.setProperty('--input', '#131b2e');
    root.style.setProperty('--input-text', '#f8fafc');
    root.style.setProperty('--input-placeholder', '#64748b');
    root.style.setProperty('--input-border', '#334155');
    root.style.setProperty('--nav-background', 'rgba(15, 23, 42, 0.88)');
    root.style.setProperty('--nav-border', 'rgba(51, 65, 85, 0.8)');
    root.style.setProperty('--shadow', '0 4px 20px -2px rgba(0, 0, 0, 0.5)');
    root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.5)');
    root.style.setProperty('--shadow-soft', '0 2px 8px rgba(0, 0, 0, 0.4)');
    root.style.setProperty('--overlay', 'rgba(3, 7, 18, 0.75)');
    root.style.setProperty('--success', '#34d399');
    root.style.setProperty('--success-background', 'rgba(52, 211, 153, 0.15)');
    root.style.setProperty('--warning', '#fbbf24');
    root.style.setProperty('--warning-background', 'rgba(251, 191, 36, 0.15)');
    root.style.setProperty('--danger', '#f87171');
    root.style.setProperty('--danger-background', 'rgba(248, 113, 113, 0.15)');

    root.style.backgroundColor = '#0b0f19';
    root.style.color = '#f8fafc';
    if (themeMeta) {
      themeMeta.setAttribute('content', '#0b0f19');
    }
  } else {
    // Light mode tokens - with custom soft pastel background support
    const bgOption = findPastelBackground(customPastelBackground);
    const bgHex = bgOption ? bgOption.hex : theme.bgLight;
    const surfaceSec = bgOption ? bgOption.surfaceSecondary : '#f0f6f5';
    const borderCol = bgOption ? bgOption.borderColor : '#e2e8f0';

    root.style.setProperty('--app-background', bgHex);
    root.style.setProperty('--background', bgHex);
    root.style.setProperty('--surface', 'rgba(255, 255, 255, 0.92)');
    root.style.setProperty('--card-background', 'rgba(255, 255, 255, 0.92)');
    root.style.setProperty('--surface-secondary', surfaceSec);
    root.style.setProperty('--surface-elevated', '#ffffff');
    root.style.setProperty('--surface-hover', 'rgba(255, 255, 255, 0.7)');
    root.style.setProperty('--text-primary', '#0f172a');
    root.style.setProperty('--text-secondary', '#334155');
    root.style.setProperty('--text-muted', '#64748b');
    root.style.setProperty('--text-disabled', '#94a3b8');
    root.style.setProperty('--border-color', borderCol);
    root.style.setProperty('--border', borderCol);
    root.style.setProperty('--border-subtle', 'rgba(226, 232, 240, 0.75)');
    root.style.setProperty('--icon', '#475569');
    root.style.setProperty('--icon-muted', '#94a3b8');
    root.style.setProperty('--button', '#ffffff');
    root.style.setProperty('--button-text', '#0f172a');
    root.style.setProperty('--button-secondary', '#f1f5f9');
    root.style.setProperty('--button-secondary-text', '#334155');
    root.style.setProperty('--input', '#ffffff');
    root.style.setProperty('--input-text', '#0f172a');
    root.style.setProperty('--input-placeholder', '#94a3b8');
    root.style.setProperty('--input-border', '#cbd5e1');
    root.style.setProperty('--nav-background', 'rgba(255, 255, 255, 0.88)');
    root.style.setProperty('--nav-border', borderCol);
    root.style.setProperty('--shadow', '0 4px 20px -2px rgba(0, 0, 0, 0.05)');
    root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.05)');
    root.style.setProperty('--shadow-soft', '0 2px 8px rgba(0, 0, 0, 0.04)');
    root.style.setProperty('--overlay', 'rgba(15, 23, 42, 0.45)');
    root.style.setProperty('--success', '#10b981');
    root.style.setProperty('--success-background', 'rgba(16, 185, 129, 0.12)');
    root.style.setProperty('--warning', '#f59e0b');
    root.style.setProperty('--warning-background', 'rgba(245, 158, 11, 0.12)');
    root.style.setProperty('--danger', '#ef4444');
    root.style.setProperty('--danger-background', 'rgba(239, 68, 68, 0.12)');

    root.style.backgroundColor = bgHex;
    root.style.color = '#0f172a';
    if (themeMeta) {
      themeMeta.setAttribute('content', bgHex);
    }
  }
}
