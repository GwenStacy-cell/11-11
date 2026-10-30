import { Friend } from '../types';

export const INITIAL_FRIENDS: Friend[] = [];

export const DEFAULT_VOICE_RESPONSES = [
  "Yo! Reading you loud and clear on 11:11!",
  "10-4, transmission received! What's up?",
  "Roger that! Loud and clear!",
  "Copy that, over and out!",
  "Hey! Your voice just blasted through my speaker haha!",
  "Walkie check! 1, 2, 3, hearing you crystal clear!",
  "11:11 received! Hold on a second, what did you say?",
];

export const FUN_VOICE_RESPONSES: Record<string, string[]> = {};

export const SOUNDBOARD_ITEMS = [
  { id: 'roger', label: '10-4 Roger', icon: 'Radio', soundType: 'roger' as const },
  { id: 'siren', label: 'Code Red Siren', icon: 'Siren', soundType: 'siren' as const },
  { id: 'alert', label: 'Triple Ping', icon: 'Bell', soundType: 'alert' as const },
  { id: 'wakeup', label: 'Wake Up Drop', icon: 'Sun', soundType: 'wakeup' as const },
];
