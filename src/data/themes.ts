export type ThemeId = 'slate' | 'amber' | 'mono' | 'vintage' | 'cyberpunk';

export interface AppTheme {
  id: ThemeId;
  name: string;
  tagline: string;
  primary: string; // Hex for highlights & text
  secondary: string; // Complementary highlight
  glowShadow: string; // CSS box-shadow for PTT button
  radarBorder: string; // Radar ring color
  pttGradient: string; // CSS linear-gradient for active PTT
  pttBorder: string; // PTT button border color
  faderGradient: string; // Gradient for vertical volume fader
  bannerStyle: string; // Matching profile banner CSS gradient
  badgeBg: string; // Background class/style for badges
  accentBadgeBorder: string; // Hairline border
}

export const THEMES: Record<ThemeId, AppTheme> = {
  slate: {
    id: 'slate',
    name: 'Eye-Friendly Slate',
    tagline: 'Modern minimal indigo & smooth matte slate',
    primary: '#818cf8',
    secondary: '#94a3b8',
    glowShadow: '0 0 25px rgba(99, 102, 241, 0.25), 0 0 10px rgba(148, 163, 184, 0.15)',
    radarBorder: 'rgba(99, 102, 241, 0.25)',
    pttGradient: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 50%, #1e1b4b 100%)',
    pttBorder: '#6366f1',
    faderGradient: 'linear-gradient(to top, #38bdf8 0%, #818cf8 60%, #c084fc 100%)',
    bannerStyle: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #1e293b 100%)',
    badgeBg: 'rgba(99, 102, 241, 0.12)',
    accentBadgeBorder: 'rgba(99, 102, 241, 0.3)',
  },
  mono: {
    id: 'mono',
    name: 'Minimalist Mono',
    tagline: 'Clean studio platinum & obsidian',
    primary: '#f8fafc',
    secondary: '#94a3b8',
    glowShadow: '0 0 20px rgba(255, 255, 255, 0.2), 0 0 8px rgba(148, 163, 184, 0.15)',
    radarBorder: 'rgba(248, 250, 252, 0.25)',
    pttGradient: 'linear-gradient(135deg, #334155 0%, #1e293b 50%, #0f172a 100%)',
    pttBorder: '#64748b',
    faderGradient: 'linear-gradient(to top, #64748b 0%, #cbd5e1 60%, #ffffff 100%)',
    bannerStyle: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)',
    badgeBg: 'rgba(255, 255, 255, 0.1)',
    accentBadgeBorder: 'rgba(255, 255, 255, 0.2)',
  },
  amber: {
    id: 'amber',
    name: 'Warm Amber',
    tagline: 'Subtle warm amber',
    primary: '#f59e0b',
    secondary: '#d97706',
    glowShadow: '0 0 25px rgba(245, 158, 11, 0.3), 0 0 10px rgba(217, 119, 6, 0.2)',
    radarBorder: 'rgba(245, 158, 11, 0.25)',
    pttGradient: 'linear-gradient(135deg, #d97706 0%, #b45309 50%, #78350f 100%)',
    pttBorder: '#f59e0b',
    faderGradient: 'linear-gradient(to top, #10b981 0%, #f59e0b 60%, #f43f5e 100%)',
    bannerStyle: 'linear-gradient(135deg, #78350f 0%, #18181b 100%)',
    badgeBg: 'rgba(245, 158, 11, 0.12)',
    accentBadgeBorder: 'rgba(245, 158, 11, 0.3)',
  },
  vintage: {
    id: 'vintage',
    name: 'Vintage Radio',
    tagline: 'Tactical brass & analog military green',
    primary: '#d97706',
    secondary: '#84cc16',
    glowShadow: '0 0 25px rgba(217, 119, 6, 0.3), 0 0 10px rgba(132, 204, 22, 0.2)',
    radarBorder: 'rgba(217, 119, 6, 0.25)',
    pttGradient: 'linear-gradient(135deg, #3f6212 0%, #365314 50%, #1a2e05 100%)',
    pttBorder: '#65a30d',
    faderGradient: 'linear-gradient(to top, #84cc16 0%, #ca8a04 60%, #d97706 100%)',
    bannerStyle: 'linear-gradient(135deg, #1a2e05 0%, #18181b 100%)',
    badgeBg: 'rgba(217, 119, 6, 0.12)',
    accentBadgeBorder: 'rgba(217, 119, 6, 0.3)',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Neon Cyberpunk',
    tagline: 'Electric cyan & neon magenta',
    primary: '#06b6d4',
    secondary: '#ec4899',
    glowShadow: '0 0 25px rgba(6, 182, 212, 0.3), 0 0 10px rgba(236, 72, 153, 0.2)',
    radarBorder: 'rgba(6, 182, 212, 0.3)',
    pttGradient: 'linear-gradient(135deg, #0e7490 0%, #155e75 50%, #083344 100%)',
    pttBorder: '#06b6d4',
    faderGradient: 'linear-gradient(to top, #06b6d4 0%, #8b5cf6 55%, #ec4899 100%)',
    bannerStyle: 'linear-gradient(135deg, #083344 0%, #18181b 100%)',
    badgeBg: 'rgba(6, 182, 212, 0.12)',
    accentBadgeBorder: 'rgba(6, 182, 212, 0.3)',
  },
};
