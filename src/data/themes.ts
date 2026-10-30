export type ThemeId = 'cyberpunk' | 'vintage' | 'mono' | 'amber';

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
  amber: {
    id: 'amber',
    name: 'Sunset Amber',
    tagline: '11:11 Signature viral glow',
    primary: '#f59e0b',
    secondary: '#f43f5e',
    glowShadow: '0 0 35px rgba(245, 158, 11, 0.45), 0 0 15px rgba(244, 63, 94, 0.3)',
    radarBorder: 'rgba(245, 158, 11, 0.35)',
    pttGradient: 'linear-gradient(135deg, #f43f5e 0%, #ea580c 50%, #f59e0b 100%)',
    pttBorder: '#f59e0b',
    faderGradient: 'linear-gradient(to top, #10b981 0%, #f59e0b 60%, #f43f5e 100%)',
    bannerStyle: 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    accentBadgeBorder: 'rgba(245, 158, 11, 0.4)',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Neon Cyberpunk',
    tagline: 'Electric cyan & neon magenta',
    primary: '#06b6d4',
    secondary: '#ec4899',
    glowShadow: '0 0 35px rgba(6, 182, 212, 0.5), 0 0 15px rgba(236, 72, 153, 0.4)',
    radarBorder: 'rgba(6, 182, 212, 0.4)',
    pttGradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #06b6d4 100%)',
    pttBorder: '#06b6d4',
    faderGradient: 'linear-gradient(to top, #06b6d4 0%, #8b5cf6 55%, #ec4899 100%)',
    bannerStyle: 'linear-gradient(135deg, #06b6d4 0%, #ec4899 100%)',
    badgeBg: 'rgba(6, 182, 212, 0.15)',
    accentBadgeBorder: 'rgba(6, 182, 212, 0.4)',
  },
  vintage: {
    id: 'vintage',
    name: 'Vintage Radio',
    tagline: 'Tactical brass & analog military green',
    primary: '#d97706',
    secondary: '#84cc16',
    glowShadow: '0 0 35px rgba(217, 119, 6, 0.4), 0 0 15px rgba(132, 204, 22, 0.3)',
    radarBorder: 'rgba(217, 119, 6, 0.35)',
    pttGradient: 'linear-gradient(135deg, #d97706 0%, #65a30d 50%, #ca8a04 100%)',
    pttBorder: '#ca8a04',
    faderGradient: 'linear-gradient(to top, #84cc16 0%, #ca8a04 60%, #d97706 100%)',
    bannerStyle: 'linear-gradient(135deg, #27272a 0%, #713f12 50%, #3f6212 100%)',
    badgeBg: 'rgba(217, 119, 6, 0.15)',
    accentBadgeBorder: 'rgba(217, 119, 6, 0.4)',
  },
  mono: {
    id: 'mono',
    name: 'Minimalist Mono',
    tagline: 'Clean studio platinum & obsidian',
    primary: '#f8fafc',
    secondary: '#94a3b8',
    glowShadow: '0 0 30px rgba(255, 255, 255, 0.35), 0 0 10px rgba(148, 163, 184, 0.25)',
    radarBorder: 'rgba(248, 250, 252, 0.3)',
    pttGradient: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 50%, #475569 100%)',
    pttBorder: '#f8fafc',
    faderGradient: 'linear-gradient(to top, #64748b 0%, #cbd5e1 60%, #ffffff 100%)',
    bannerStyle: 'linear-gradient(135deg, #09090b 0%, #27272a 50%, #52525b 100%)',
    badgeBg: 'rgba(255, 255, 255, 0.12)',
    accentBadgeBorder: 'rgba(255, 255, 255, 0.3)',
  },
};
