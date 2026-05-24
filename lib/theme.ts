/**
 * FlowBase Design System & Theme Tokens
 * Dark mode first, glassmorphism accents, violet/cyan palette
 */

export const colors = {
  // Backgrounds
  bgPrimary: '#0a0a0f',
  bgSecondary: '#111118',
  bgCard: '#16161f',
  bgElevated: '#1c1c28',

  // Borders
  border: 'rgba(255, 255, 255, 0.06)',
  borderAccent: 'rgba(139, 92, 246, 0.3)',

  // Text
  textPrimary: '#f0f0f5',
  textSecondary: '#8b8b9a',
  textMuted: '#525261',

  // Accents
  accentPrimary: '#7c3aed', // violet
  accentSecondary: '#06b6d4', // cyan
  accentGreen: '#10b981',
  accentAmber: '#f59e0b',
  accentRose: '#f43f5e',

  // Effects
  glow: 'rgba(124, 58, 237, 0.15)',
}

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
}

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
}

export const shadows = {
  subtle: '0 4px 24px rgba(0, 0, 0, 0.3)',
  glow: '0 0 24px rgba(124, 58, 237, 0.15)',
}

export const typography = {
  displayFont: 'Syne',
  bodyFont: 'DM Sans',
  monoFont: 'JetBrains Mono',
}

export const sidebarDimensions = {
  expanded: 260,
  collapsed: 68,
}

export const zIndex = {
  hidden: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
}

export default {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  sidebarDimensions,
  zIndex,
}
