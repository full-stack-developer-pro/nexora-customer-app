/**
 * Nexora Design System - Shared Customer Mobile Design Tokens
 * 100% synchronized with Nexora Brand Ecosystem
 * Primary: #084e8a (Deep Navy) | Accent: #e90402 (Signal Red) | Canvas: #f8fafc
 */

import { Platform } from 'react-native';

export const NexoraColors = {
  // Brand Core
  primary: '#084e8a',
  primaryHover: '#063c6a',
  primaryDark: '#041e3a',
  primaryLight: '#eef5fc',
  primaryBorder: '#bdd8f2',
  primaryRgb: '8, 78, 138',

  // Brand Accent (Signature Red Dot & Urgent Badges)
  accent: '#e90402',
  accentHover: '#c40301',
  accentLight: '#fef2f2',
  accentBorder: '#fecaca',
  accentRgb: '233, 4, 2',

  // Canvas & Surfaces
  canvas: '#f8fafc',
  surface: '#ffffff',
  surfaceElevated: '#f1f5f9',
  surfaceCard: '#ffffff',
  midnightHeader: '#0b192c',
  midnightDark: '#041427',
  sidebarBg: '#0b192c',

  // Typography
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  textInverted: '#ffffff',

  // Borders & Dividers
  border: '#e2e8f0',
  borderMedium: '#cbd5e1',
  borderFocus: '#084e8a',

  // Status Colors
  statusApproved: '#10b981',
  statusApprovedBg: '#ecfdf5',
  statusApprovedBorder: '#a7f3d0',

  statusPending: '#f59e0b',
  statusPendingBg: '#fffbeb',
  statusPendingBorder: '#fde68a',

  statusRejected: '#ef4444',
  statusRejectedBg: '#fef2f2',
  statusRejectedBorder: '#fecaca',

  statusSuspended: '#64748b',
  statusSuspendedBg: '#f1f5f9',
  statusSuspendedBorder: '#cbd5e1',

  statusInfo: '#0284c7',
  statusInfoBg: '#f0f9ff',
  statusInfoBorder: '#bae6fd',
} as const;

export const Colors = {
  light: {
    text: NexoraColors.textPrimary,
    background: NexoraColors.canvas,
    backgroundElement: '#f1f5f9',
    backgroundSelected: '#e2e8f0',
    textSecondary: NexoraColors.textSecondary,
    tint: NexoraColors.primary,
    tabIconDefault: '#94a3b8',
    tabIconSelected: NexoraColors.primary,
  },
  dark: {
    text: '#ffffff',
    background: NexoraColors.midnightHeader,
    backgroundElement: '#1e293b',
    backgroundSelected: '#334155',
    textSecondary: '#cbd5e1',
    tint: '#38bdf8',
    tabIconDefault: '#64748b',
    tabIconSelected: '#38bdf8',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const MaxContentWidth = 800;

export const Radius = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Typography = {
  titleLg: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: NexoraColors.textPrimary,
    letterSpacing: -0.5,
  },
  titleMd: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: NexoraColors.textPrimary,
    letterSpacing: -0.3,
  },
  titleSm: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: NexoraColors.textPrimary,
  },
  body: {
    fontSize: 14,
    color: NexoraColors.textSecondary,
    lineHeight: 20,
  },
  bodySm: {
    fontSize: 12,
    color: NexoraColors.textMuted,
    lineHeight: 16,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  card: {
    shadowColor: '#084e8a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  floating: {
    shadowColor: '#084e8a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
};

