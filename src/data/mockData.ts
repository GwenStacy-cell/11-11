import { Friend } from '../types';

export const INITIAL_FRIENDS: Friend[] = [];

export const SOUNDBOARD_ITEMS = [
  { id: 'roger', label: '10-4 Roger', icon: 'Radio', soundType: 'roger' as const },
  { id: 'siren', label: 'Code Red Siren', icon: 'Siren', soundType: 'siren' as const },
  { id: 'alert', label: 'Triple Ping', icon: 'Bell', soundType: 'alert' as const },
  { id: 'wakeup', label: 'Wake Up Drop', icon: 'Sun', soundType: 'wakeup' as const },
];
