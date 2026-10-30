export interface Friend {
  id: string;
  name: string;
  pin: string;
  avatar: string;
  statusText: string;
  onlineStatus: 'online' | 'in-class' | 'dnd' | 'offline';
  lastActive: string;
  accentColor: string;
  genderVoice?: 'female' | 'male';
}

export interface UserProfile {
  name: string;
  pin: string;
  avatar: string;
  banner: string; // gradient or image URL
  noteStatus: string;
  bio: string;
  accentColor: string;
  themeId?: 'cyberpunk' | 'vintage' | 'mono' | 'amber';
}

export type { ThemeId, AppTheme } from '../data/themes';

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
  type: 'ptt-start' | 'ptt-stop' | 'voice-message' | 'audio-chunk' | 'poke' | 'soundboard' | 'status-update';
  senderPin: string;
  senderName: string;
  targetPin?: string;
  audioData?: string; // base64 or audio snippet
  text?: string;
  duration?: number;
  timestamp: number;
}
