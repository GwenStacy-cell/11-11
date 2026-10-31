import type { ThemeId, AppTheme } from '../data/themes';
export type { ThemeId, AppTheme };

export interface Friend {
  id: string;
  name: string; // Displayed name (or user nickname)
  realName?: string; // Original name set by the friend
  pin: string;
  avatar: string; // Real uploaded gallery photo or profile avatar
  banner?: string; // Real uploaded gallery banner or theme
  noteStatus?: string;
  bio?: string;
  age?: number;
  statusText: string;
  onlineStatus: 'online' | 'in-class' | 'dnd' | 'offline';
  lastActive: string;
  accentColor: string;
  isPending?: boolean;
}

export interface FriendRequest {
  pin: string;
  name: string;
  avatar: string;
  banner?: string;
  noteStatus?: string;
  bio?: string;
  age?: number;
  accentColor?: string;
  timestamp: number;
}

export interface UserProfile {
  name: string; // Nickname
  pin: string;
  avatar: string;
  banner: string; // gradient or image URL
  noteStatus: string;
  bio: string;
  age?: number;
  accentColor: string;
  themeId?: ThemeId;
}

export interface FoundUser {
  pin: string;
  name: string;
  avatar: string;
  banner?: string;
  noteStatus?: string;
  bio?: string;
  age?: number;
  accentColor?: string;
}

export type VoiceFilter = 'classic-walkie' | 'crisp' | 'megaphone' | 'deep-radio';

export interface TransmissionLog {
  id: string;
  senderName: string;
  senderPin: string;
  isSelf: boolean;
  timestamp: Date;
  durationSec: number;
  transcript?: string;
  type: 'voice' | 'poke' | 'soundboard';
  audioBlobUrl?: string;
}

export interface BroadcastMessage {
  type:
    | 'ptt-start'
    | 'ptt-stop'
    | 'voice-message'
    | 'audio-chunk'
    | 'poke'
    | 'soundboard'
    | 'status-update'
    | 'friend-request'
    | 'friend-accept'
    | 'friend-decline'
    | 'friend-remove'
    | 'profile-update'
    | 'profile-query'
    | 'profile-response';
  senderPin: string;
  senderName: string;
  targetPin?: string;
  audioData?: string; // base64 or audio snippet
  text?: string;
  duration?: number;
  timestamp: number;
  profile?: {
    name: string;
    avatar: string;
    banner?: string;
    noteStatus?: string;
    bio?: string;
    age?: number;
    accentColor?: string;
  };
}
