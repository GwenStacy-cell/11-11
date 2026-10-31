export interface CachedProfile {
  pin: string;
  name: string;
  avatar?: string;
  banner?: string;
  age?: number;
  bio?: string;
  noteStatus?: string;
  accentColor?: string;
  lastSeen?: number;
}

const STORAGE_KEY = 'tenten_known_profiles';

export function getKnownProfiles(): Record<string, CachedProfile> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveKnownProfile(profile: Partial<CachedProfile> & { pin: string }) {
  if (typeof window === 'undefined' || !profile.pin) return;
  const cleanPin = profile.pin.replace(/[^0-9]/g, '');
  if (!cleanPin) return;

  try {
    const profiles = getKnownProfiles();
    const existing = profiles[cleanPin] || { pin: cleanPin, name: `User #${cleanPin}` };
    profiles[cleanPin] = {
      ...existing,
      ...profile,
      pin: cleanPin,
      name: profile.name?.trim() || existing.name || `User #${cleanPin}`,
      lastSeen: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.warn('Failed to save known profile to cache', e);
  }
}

export function getKnownProfile(pin: string): CachedProfile | null {
  const cleanPin = pin.replace(/[^0-9]/g, '');
  if (!cleanPin) return null;
  const profiles = getKnownProfiles();
  return profiles[cleanPin] || null;
}
