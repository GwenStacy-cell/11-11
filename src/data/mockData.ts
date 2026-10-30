import { Friend } from '../types';

export const INITIAL_FRIENDS: Friend[] = [
  {
    id: 'f-maya',
    name: 'Maya',
    pin: '8492',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    statusText: 'In French class 🤫 dont talk loud!',
    onlineStatus: 'in-class',
    lastActive: 'Just now',
    accentColor: '#ec4899',
    genderVoice: 'female',
  },
  {
    id: 'f-leo',
    name: 'Leo',
    pin: '5021',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
    statusText: 'Skatepark with the squad 🛹',
    onlineStatus: 'online',
    lastActive: '2m ago',
    accentColor: '#3b82f6',
    genderVoice: 'male',
  },
  {
    id: 'f-chloe',
    name: 'Chloe',
    pin: '7730',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    statusText: 'Headphones on full blast 🎧',
    onlineStatus: 'online',
    lastActive: '5m ago',
    accentColor: '#10b981',
    genderVoice: 'female',
  },
  {
    id: 'f-alex',
    name: 'Alex',
    pin: '1099',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    statusText: 'Do Not Disturb 🔕 (math exam)',
    onlineStatus: 'dnd',
    lastActive: '30m ago',
    accentColor: '#f59e0b',
    genderVoice: 'male',
  },
];

export const FUN_VOICE_RESPONSES: Record<string, string[]> = {
  Maya: [
    "Shhh! I'm in the middle of class, don't blast my phone out loud!",
    "Omg you scared me, my phone was in my backpack!",
    "Are we getting boba after school? Over and out!",
    "Tell me you didn't just poke me three times in a row!",
  ],
  Leo: [
    "Yo! Just landed a kickflip, you coming to the park or what?",
    "Bro, your voice literally blasted through my pocket while I was ordering food!",
    "Roger that! Meet me at the stairs in ten minutes.",
    "Ten Ten walkie check! 1, 2, 3, reading you loud and clear!",
  ],
  Chloe: [
    "Hey! My lock screen just lit up with your voice haha!",
    "Turn up your mic a bit, you sound like a pilot!",
    "Send a poke right now if you're free!",
    "Copy that, copy that! Roger roger!",
  ],
  Alex: [
    "Dude I'm in silent mode, don't get me in trouble!",
    "Alex here, 10-4, transmission received.",
    "Wait, is this app playing audio even when locked? That's crazy!",
  ],
};

export const SOUNDBOARD_ITEMS = [
  { id: 'roger', label: '10-4 Roger', icon: 'Radio', soundType: 'roger' as const },
  { id: 'siren', label: 'Code Red Siren', icon: 'Siren', soundType: 'siren' as const },
  { id: 'alert', label: 'Triple Ping', icon: 'Bell', soundType: 'alert' as const },
  { id: 'wakeup', label: 'Wake Up Drop', icon: 'Sun', soundType: 'wakeup' as const },
];
