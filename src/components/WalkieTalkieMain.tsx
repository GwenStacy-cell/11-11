import React, { useState } from 'react';
import {
  Radio,
  Mic,
  Bell,
  BellOff,
  Lock,
  Unlock,
  Hand,
  Volume2,
  Users,
  Info,
  History,
  Sparkles,
  Sliders,
  Edit3,
  Edit2,
  Check,
  X,
  QrCode,
  Download,
  Plus,
  UserPlus,
  Settings as SettingsIcon,
  Share2,
  Smartphone,
  Ban
} from 'lucide-react';
import { Friend, VoiceFilter, UserProfile, AppTheme, FriendRequest } from '../types';
import { LiveWaveform } from './LiveWaveform';
import { VerticalVolumeSlider } from './VerticalVolumeSlider';
import { DynamicSignalIndicator } from './DynamicSignalIndicator';
import { VoiceAvatarHalo } from './VoiceAvatarHalo';
import { audioEngine } from '../utils/audioEffects';

interface WalkieTalkieMainProps {
  activeFriend: Friend | null;
  friends: Friend[];
  onSelectFriend: (friend: Friend) => void;
  isTransmitting: boolean;
  isLockedOnAir: boolean;
  isReceiving: boolean;
  incomingSender: string | null;
  onPttStart: () => void;
  onPttStop: () => void;
  onToggleLockOnAir: () => void;
  onSendPoke: () => void;
  onOpenSoundboard: () => void;
  onOpenFriendManager: () => void;
  onOpenAbout: () => void;
  onOpenHistory: () => void;
  onOpenLockScreenGuide: () => void;
  onOpenSettings: () => void;
  onShareApp: () => void;
  isDnd: boolean;
  onToggleDnd: () => void;
  voiceFilter: VoiceFilter;
  onChangeVoiceFilter: (filter: VoiceFilter) => void;
  myPin: string;
  hasMicPermission: boolean;
  onRequestMic: () => void;
  transmissionDuration: number;
  volume: number;
  onChangeVolume: (vol: number) => void;
  userProfile: UserProfile;
  onOpenProfileEdit: () => void;
  activeTheme: AppTheme;
  onOpenQrCode?: (targetFriend?: { name: string; pin: string }) => void;
  onOpenInstallModal?: () => void;
  blockedPins?: string[];
  onBlockFriend?: (pin: string) => void;
  onUnblockFriend?: (pin: string) => void;
  onMuteCurrentSender?: () => void;
  onRenameFriend?: (id: string, newNickname: string) => void;
  incomingRequests?: FriendRequest[];
  onAcceptRequest?: (req: FriendRequest) => void;
  onDeclineRequest?: (pin: string) => void;
}

const getBannerStyle = (bannerStr: string) => {
  if (!bannerStr) return 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)';
  if (
    bannerStr.startsWith('url(') ||
    bannerStr.startsWith('linear-gradient') ||
    bannerStr.startsWith('radial-gradient')
  ) {
    return bannerStr;
  }
  return `url("${bannerStr}") center/cover no-repeat`;
};

export const WalkieTalkieMain: React.FC<WalkieTalkieMainProps> = ({
  activeFriend,
  friends,
  onSelectFriend,
  isTransmitting,
  isLockedOnAir,
  isReceiving,
  incomingSender,
  onPttStart,
  onPttStop,
  onToggleLockOnAir,
  onSendPoke,
  onOpenSoundboard,
  onOpenFriendManager,
  onOpenAbout,
  onOpenHistory,
  onOpenLockScreenGuide,
  onOpenSettings,
  onShareApp,
  isDnd,
  onToggleDnd,
  voiceFilter,
  onChangeVoiceFilter,
  myPin,
  hasMicPermission,
  onRequestMic,
  transmissionDuration,
  volume,
  onChangeVolume,
  userProfile,
  onOpenProfileEdit,
  activeTheme,
  onOpenQrCode,
  onOpenInstallModal,
  blockedPins = [],
  onBlockFriend,
  onUnblockFriend,
  onMuteCurrentSender,
  onRenameFriend,
  incomingRequests = [],
  onAcceptRequest,
  onDeclineRequest,
}) => {
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const filters: { id: VoiceFilter; label: string; desc: string }[] = [
    { id: 'classic-walkie', label: 'Classic CB Radio', desc: 'Analog 300Hz-3.4kHz bandpass filter with squelch' },
    { id: 'crisp', label: 'Crisp Studio', desc: 'Natural high-definition direct microphone audio' },
    { id: 'megaphone', label: 'Megaphone', desc: 'Resonant horn acoustic reflection' },
    { id: 'deep-radio', label: 'Tactical Radio', desc: 'Low-frequency dispatcher tone' },
  ];

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isHolding = isTransmitting || isLockedOnAir;
  const targetLabel = activeFriend ? activeFriend.name.toUpperCase() : 'NO FRIEND SELECTED';

  return (
    <div className="w-full h-full flex flex-col justify-between text-white select-none relative overflow-y-auto overflow-x-hidden scrollbar-none">
      
      {/* Ambient Avatar Glow Background (Active strictly while transmitting or receiving) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <img
          key={activeFriend ? activeFriend.id : 'self'}
          src={activeFriend ? activeFriend.avatar : userProfile.avatar}
          alt=""
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover scale-110 filter blur-[6px] transition-all duration-500 ease-out ${
            isTransmitting || isReceiving || isLockedOnAir ? 'opacity-70 scale-115' : 'opacity-0'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/85 via-zinc-950/50 to-zinc-950/95" />
      </div>

      {/* Active Incoming Speaker Notification Banner with 5-Minute Mute Button */}
      {isReceiving && incomingSender && (
        <div className="absolute top-3 inset-x-4 z-50 p-2.5 bg-zinc-900/95 border border-amber-500/60 rounded-2xl shadow-2xl flex items-center justify-between backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-black text-white truncate flex items-center gap-1.5">
                <span>🎙️ {incomingSender} is speaking live...</span>
              </div>
              <div className="text-[10px] text-amber-300 font-semibold">
                Hold PTT button to reply back
              </div>
            </div>
          </div>
          {onMuteCurrentSender && (
            <button
              onClick={onMuteCurrentSender}
              className="px-3 py-1 bg-zinc-800 hover:bg-rose-950/60 text-rose-300 hover:text-rose-200 border border-rose-500/30 rounded-xl text-xs font-bold shrink-0 transition-all active:scale-95 flex items-center gap-1 shadow-sm cursor-pointer"
              title="Mute this person for 5 minutes"
            >
              <BellOff className="w-3.5 h-3.5 text-rose-400" />
              <span>Mute 5m</span>
            </button>
          )}
        </div>
      )}

      {/* Floating Incoming Friend Request Notification */}
      {incomingRequests && incomingRequests.length > 0 && !isReceiving && (
        <div className="absolute top-3 inset-x-4 z-50 p-3 bg-zinc-900/95 border border-amber-500/60 rounded-2xl shadow-2xl flex items-center justify-between backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={incomingRequests[0].avatar}
              alt={incomingRequests[0].name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border-2 border-amber-500 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                <span>Friend Request: {incomingRequests[0].name}</span>
                <span className="text-[10px] font-mono text-amber-400">#{incomingRequests[0].pin}</span>
              </div>
              <div className="text-[10px] text-zinc-400 truncate">Tap Accept to connect and talk live</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              onClick={() => onAcceptRequest?.(incomingRequests[0])}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow transition-all active:scale-95 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept</span>
            </button>
            <button
              onClick={() => onDeclineRequest?.(incomingRequests[0].pin)}
              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl text-xs transition-colors cursor-pointer"
              title="Decline"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Transmitting Status Overlay */}
      <div
        className={`absolute top-3 inset-x-4 z-40 pointer-events-none flex flex-col items-center justify-center transition-all duration-300 ${
          isHolding ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
      >
        <div className="px-5 py-2 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 font-mono text-xs font-bold flex items-center gap-2 shadow-2xl backdrop-blur-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span>TRANSMITTING TO {targetLabel} ({formatTimer(transmissionDuration)})</span>
        </div>
        <span className="text-[10px] text-zinc-400 mt-1 font-medium tracking-wide">
          {isLockedOnAir ? 'Hands-free active · Tap button or Mic to release' : 'Release button to send transmission'}
        </span>
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex flex-col h-full justify-between max-w-lg mx-auto w-full px-4 sm:px-6 py-2 sm:py-3.5">
        
        {/* Top Header Row */}
        <div className="flex flex-col gap-2">
          <div
            className={`flex items-center justify-between pb-2 border-b border-zinc-800/60 transition-opacity duration-300 ${
              isHolding ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            {/* Branding + PIN Badge */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center font-black text-xs text-black shadow-lg shadow-amber-500/20">
                11:11
              </div>
              <div>
                <div className="text-sm font-extrabold tracking-tight text-white flex items-center gap-2">
                  <span>11:11</span>
                  {onOpenQrCode ? (
                    <button
                      onClick={() => onOpenQrCode()}
                      className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                      title="Show My QR Code & PIN"
                    >
                      <QrCode className="w-3 h-3 text-amber-400" />
                      <span>#{myPin}</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800">
                      PIN: #{myPin}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono mt-0.5">
                  <span className="text-amber-400 font-bold">CH 11·11</span>
                  <span className="text-zinc-600">·</span>
                  <span>462.562 MHz</span>
                </div>
              </div>
            </div>

            {/* Top Action Icons */}
            <div className="flex items-center gap-1.5">
              {/* Dynamic Signal */}
              <div className="hidden xs:flex mr-1">
                <DynamicSignalIndicator
                  isTransmitting={isTransmitting}
                  isReceiving={isReceiving}
                  isLockedOnAir={isLockedOnAir}
                />
              </div>

              {/* Direct Download App Button (Vercel PWA) */}
              {onOpenInstallModal && (
                <button
                  onClick={onOpenInstallModal}
                  className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-amber-500/25 hover:from-amber-500/40 hover:to-orange-500/35 text-amber-300 hover:text-amber-200 border border-amber-500/50 rounded-xl transition-all active:scale-95 shadow-sm shadow-amber-500/15 flex items-center gap-1.5 shrink-0"
                  title="Download & Install App directly from Vercel"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-black tracking-tight">Download</span>
                </button>
              )}

              {/* Share App */}
              <button
                onClick={onShareApp}
                className="p-2 bg-zinc-900/90 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 border border-amber-500/30 rounded-xl transition-all active:scale-95 shadow-sm"
                title="Share 11:11 with friends"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Settings Button */}
              <button
                onClick={onOpenSettings}
                className="p-2 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl transition-colors active:scale-95"
                title="Settings & Options"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>

              {/* Silent / DND Toggle */}
              <button
                onClick={onToggleDnd}
                className={`p-2 rounded-xl text-xs font-medium transition-all ${
                  isDnd
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm shadow-rose-950/40'
                    : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
                title={isDnd ? 'Silent Mode Active' : 'Silent Mode Off'}
              >
                {isDnd ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              </button>

              {/* Transmission History */}
              <button
                onClick={onOpenHistory}
                className="p-2 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl transition-colors"
                title="Transmission History"
              >
                <History className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* User Profile Card (Discord-Style Profile Banner) */}
          <div
            className={`transition-opacity duration-300 ${
              isHolding ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <div
              onClick={onOpenProfileEdit}
              className="relative rounded-3xl overflow-hidden border border-zinc-800/90 hover:border-zinc-700 bg-zinc-900/90 transition-all cursor-pointer group shadow-xl"
            >
              {/* Big Discord Profile Banner */}
              <div
                className="h-28 sm:h-36 w-full relative transition-all duration-300 overflow-hidden"
                style={{
                  background: getBannerStyle(userProfile.banner),
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Subtle dark gradient overlay at bottom for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/25 to-black/30" />

                {/* Floating Edit Badge (Discord Style) */}
                <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-semibold border border-white/15 flex items-center gap-1.5 transition-all shadow-md group-hover:scale-105">
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit Profile</span>
                </div>
              </div>

              {/* Profile Details Bar overlapping the banner bottom */}
              <div className="px-4 pb-3.5 pt-0 relative flex items-start gap-3.5">
                {/* Large Avatar overlapping bottom of banner */}
                <div className="relative -mt-9 sm:-mt-11 shrink-0">
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-zinc-950 shadow-2xl transition-transform group-hover:scale-105"
                    style={{ outline: `2.5px solid ${userProfile.accentColor || '#f59e0b'}` }}
                  />
                  <span className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow" />
                </div>

                {/* Name, Note & Bio */}
                <div className="flex-1 min-w-0 pt-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm sm:text-base font-extrabold text-white truncate">
                        {userProfile.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-800 text-amber-400 border border-amber-500/30 shrink-0">
                        #{myPin}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-amber-300 font-medium flex items-center gap-1.5 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{userProfile.noteStatus}</span>
                  </div>

                  {userProfile.bio && (
                    <div className="text-[11px] text-zinc-400 mt-1 line-clamp-1 leading-relaxed">
                      {userProfile.bio}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Friend Circles Section */}
          <div
            className={`transition-opacity duration-300 ${
              isHolding ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Friend Circles {friends.length > 0 && `(${friends.length})`}
              </span>
              <button
                onClick={onOpenFriendManager}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Manage Friends</span>
              </button>
            </div>

            {/* Friend List or Empty State */}
            {friends.length === 0 ? (
              <div className="p-3 bg-zinc-900/60 border border-dashed border-zinc-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-200">No friends added yet</div>
                    <div className="text-[10px] text-zinc-400">Add friends with their 4-digit PIN or QR</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={onShareApp}
                    className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold text-xs rounded-xl flex items-center gap-1 transition-all active:scale-95 border border-zinc-700"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={onOpenFriendManager}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all active:scale-95 shadow-md shadow-emerald-950/40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {friends.map((f) => {
                  const isSelected = activeFriend?.id === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => onSelectFriend(f)}
                      className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
                    >
                      <div
                        className={`relative p-0.5 rounded-full transition-all ${
                          isSelected
                            ? 'ring-2 ring-emerald-400 scale-105 shadow-md shadow-emerald-950/50'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={f.avatar}
                          alt={f.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-full object-cover border border-zinc-700"
                        />
                        {blockedPins.includes(f.pin) && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[9px] font-bold ring-1 ring-zinc-950">
                            🚫
                          </span>
                        )}
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-950 ${
                            f.onlineStatus === 'online'
                              ? 'bg-emerald-500'
                              : f.onlineStatus === 'in-class'
                              ? 'bg-amber-500'
                              : 'bg-zinc-600'
                          }`}
                        />
                      </div>
                      <span
                        className={`text-[10px] font-medium transition-colors ${
                          isSelected ? 'text-white font-bold' : 'text-zinc-400'
                        }`}
                      >
                        {f.name}
                      </span>
                    </button>
                  );
                })}

                <button
                  onClick={onOpenFriendManager}
                  className="flex flex-col items-center gap-1 shrink-0 opacity-80 hover:opacity-100"
                  title="Add Friend by PIN"
                >
                  <div className="w-11 h-11 rounded-full bg-zinc-900 border border-dashed border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors">
                    <span className="text-lg font-bold">+</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">Add</span>
                </button>
              </div>
            )}
          </div>

          {/* Active Target Friend Card */}
          <div
            className={`transition-opacity duration-300 ${
              isHolding ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            {activeFriend ? (
              <div className="p-3 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={activeFriend.avatar}
                      alt={activeFriend.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border-2"
                      style={{ borderColor: activeFriend.accentColor }}
                    />
                    {isReceiving && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">{activeFriend.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 shrink-0">
                        #{activeFriend.pin}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate max-w-[170px] mt-0.5">
                      {activeFriend.statusText}
                    </div>
                  </div>
                </div>

                {/* Quick Friend Actions */}
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {onOpenQrCode && (
                    <button
                      onClick={() => onOpenQrCode({ name: activeFriend.name, pin: activeFriend.pin })}
                      className="p-2 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/80 rounded-xl text-zinc-300 hover:text-amber-400 text-xs font-medium flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                      title={`Show ${activeFriend.name}'s QR Code`}
                    >
                      <QrCode className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  )}

                  <button
                    onClick={onSendPoke}
                    className="px-2.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                    title="Poke friend with vibration alert"
                  >
                    <Hand className="w-3.5 h-3.5" />
                    <span>Poke</span>
                  </button>

                  {/* Rename Friend Button */}
                  {onRenameFriend && (
                    <button
                      onClick={() => {
                        const newName = window.prompt(
                          `Rename ${activeFriend.realName || activeFriend.name}:`,
                          activeFriend.name
                        );
                        if (newName !== null && newName.trim()) {
                          onRenameFriend(activeFriend.id, newName.trim());
                          audioEngine.playPokeSound();
                        }
                      }}
                      className="px-2 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-zinc-300 hover:text-amber-400 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      title="Set custom nickname"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Rename</span>
                    </button>
                  )}

                  {/* Block / Unblock Friend Button */}
                  <button
                    onClick={() => {
                      if (blockedPins.includes(activeFriend.pin)) {
                        onUnblockFriend?.(activeFriend.pin);
                      } else {
                        onBlockFriend?.(activeFriend.pin);
                      }
                      audioEngine.playPokeSound();
                    }}
                    className={`p-2 border rounded-xl text-xs font-medium flex items-center gap-1 transition-all active:scale-95 shadow-sm ${
                      blockedPins.includes(activeFriend.pin)
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                        : 'bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700/80 text-zinc-400 hover:text-rose-400'
                    }`}
                    title={blockedPins.includes(activeFriend.pin) ? 'Unblock friend' : 'Block friend'}
                  >
                    <Ban className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={onOpenFriendManager}
                className="p-3 bg-zinc-900/60 hover:bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center justify-between cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Add Friends to Start Talking</span>
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Tap here to enter friend PIN or scan their QR code
                    </div>
                  </div>
                </div>

                <span className="text-xs font-bold text-amber-400 group-hover:translate-x-0.5 transition-transform">
                  Add +
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Central Talk Area: Waveform + Center PTT + Vertical Gain Slider */}
        <div className="my-auto py-2 flex flex-col items-center justify-center gap-2.5 w-full">
          
          {/* Live Waveform Status Banner */}
          <div
            className={`w-full max-w-sm h-11 bg-zinc-900/50 rounded-2xl border border-zinc-800/70 flex flex-col items-center justify-center relative overflow-hidden transition-opacity duration-300 ${
              isHolding ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <div className="text-[10px] font-mono font-bold tracking-wider mb-0.5">
              {isTransmitting ? (
                <span className="text-rose-400 animate-pulse flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  TRANSMITTING LIVE ({formatTimer(transmissionDuration)})
                </span>
              ) : isReceiving ? (
                <span className="text-amber-400 animate-pulse flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  {incomingSender?.toUpperCase()} IS SPEAKING · HOLD PTT TO REPLY
                </span>
              ) : isLockedOnAir ? (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  HANDS-FREE ON AIR ({formatTimer(transmissionDuration)})
                </span>
              ) : activeFriend ? (
                <span className="text-zinc-300 flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-emerald-400" />
                  CONNECTED TO {activeFriend.name.toUpperCase()} · HOLD BUTTON TO SPEAK
                </span>
              ) : (
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <UserPlus className="w-3 h-3 text-amber-400" />
                  ENTER 4-DIGIT PIN TO TALK LIVE
                </span>
              )}
            </div>

            <LiveWaveform
              isActive={isTransmitting || isReceiving || isLockedOnAir}
              color={isTransmitting ? '#f43f5e' : isReceiving ? '#f59e0b' : '#10b981'}
              isReceiving={isReceiving}
            />
          </div>

          {/* Center PTT + Side Volume Controls Row */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 w-full max-w-sm">
            
            {/* Main PTT Button Centerpiece */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center">
                
                {/* Real-time Dynamic Voice Halo Rings */}
                <VoiceAvatarHalo
                  friend={activeFriend}
                  isTransmitting={isTransmitting}
                  isReceiving={isReceiving}
                  isLockedOnAir={isLockedOnAir}
                  theme={activeTheme}
                  volume={volume}
                />

                {/* Animated radar rings when transmitting */}
                {(isTransmitting || isLockedOnAir) && (
                  <>
                    <div
                      className="absolute w-[180px] h-[180px] rounded-full border animate-signal-wave pointer-events-none z-0"
                      style={{ borderColor: activeTheme.radarBorder }}
                    />
                    <div
                      className="absolute w-[150px] h-[150px] rounded-full border animate-signal-wave [animation-delay:400ms] pointer-events-none z-0"
                      style={{ borderColor: activeTheme.radarBorder }}
                    />
                  </>
                )}

                {isReceiving && (
                  <div className="absolute w-[180px] h-[180px] rounded-full border border-amber-500/40 animate-signal-wave pointer-events-none z-0" />
                )}

                {/* Push-To-Talk Button */}
                <button
                  onPointerDown={(e) => {
                    e.preventDefault();
                    if (isLockedOnAir) {
                      onToggleLockOnAir(); // Tapping PTT while locked immediately ends it!
                      return;
                    }
                    if (!activeFriend) {
                      onOpenFriendManager();
                      return;
                    }
                    onPttStart();
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault();
                    if (!isLockedOnAir) onPttStop();
                  }}
                  onPointerLeave={() => {
                    if (isTransmitting && !isLockedOnAir) onPttStop();
                  }}
                  className={`relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center transition-all duration-150 select-none shadow-2xl focus:outline-none ${
                    isTransmitting || isLockedOnAir
                      ? 'text-white scale-95 ring-4'
                      : isReceiving
                      ? 'bg-zinc-800 text-amber-400 ring-4 ring-amber-500/50'
                      : 'bg-gradient-to-b from-zinc-800 to-zinc-900 text-zinc-100 hover:from-zinc-700 hover:to-zinc-800 border-2 border-zinc-700/80 shadow-black'
                  }`}
                  style={{
                    background: (isTransmitting || isLockedOnAir) ? activeTheme.pttGradient : undefined,
                    boxShadow: (isTransmitting || isLockedOnAir) ? activeTheme.glowShadow : undefined,
                    borderColor: (isTransmitting || isLockedOnAir) ? activeTheme.pttBorder : undefined,
                  }}
                >
                  <div className="absolute inset-1.5 rounded-full border border-white/10 pointer-events-none" />
                  
                  <div className="mb-1">
                    {isTransmitting || isLockedOnAir ? (
                      <Radio className="w-8 h-8 sm:w-9 sm:h-9 text-white animate-bounce" />
                    ) : isReceiving ? (
                      <Volume2 className="w-8 h-8 sm:w-9 sm:h-9 text-amber-400 animate-pulse" />
                    ) : (
                      <Mic className="w-8 h-8 sm:w-9 sm:h-9 text-zinc-200" />
                    )}
                  </div>

                  <div className="text-center px-1">
                    <div className="text-xs font-black tracking-wider uppercase">
                      {isTransmitting
                        ? 'TALKING'
                        : isLockedOnAir
                        ? 'ON AIR'
                        : isReceiving
                        ? 'INCOMING'
                        : activeFriend
                        ? 'HOLD TALK'
                        : 'ADD FRIEND'}
                    </div>
                    <div className="text-[9px] text-zinc-400 font-medium leading-none mt-0.5 truncate max-w-[90px]">
                      {isTransmitting
                        ? 'Live Voice'
                        : isLockedOnAir
                        ? 'Tap to Stop'
                        : isReceiving
                        ? 'Hold to Reply'
                        : activeFriend
                        ? `to ${activeFriend.name}`
                        : 'Enter PIN'}
                    </div>
                  </div>
                </button>
              </div>

              {/* Lock Hands-Free Button - ALWAYS ACCESSIBLE & CLEAR */}
              <div className="mt-3 flex items-center justify-center z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!activeFriend && !isLockedOnAir) {
                      onOpenFriendManager();
                      return;
                    }
                    onToggleLockOnAir();
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md ${
                    isLockedOnAir
                      ? 'bg-rose-600 hover:bg-rose-500 text-white ring-4 ring-rose-500/40 animate-pulse'
                      : 'bg-zinc-900/90 text-zinc-300 hover:text-white border border-zinc-800'
                  }`}
                  style={{
                    backgroundColor: isLockedOnAir ? '#e11d48' : undefined,
                  }}
                >
                  {isLockedOnAir ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{isLockedOnAir ? '🔴 End Hands-Free (Release)' : 'Lock Hands-Free'}</span>
                </button>
              </div>
            </div>

            {/* Vertical Volume Slider for Incoming Broadcasts */}
            <div
              className={`bg-zinc-900/70 border border-zinc-800/80 rounded-3xl p-2.5 flex flex-col items-center justify-center shadow-lg transition-opacity duration-300 shrink-0 ${
                isHolding ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              <VerticalVolumeSlider
                volume={volume}
                onChangeVolume={onChangeVolume}
                themeGradient={activeTheme.faderGradient}
                themeColor={activeTheme.primary}
              />
            </div>
          </div>
        </div>

        {/* Bottom Utility Bar */}
        <div
          className={`flex flex-col gap-2 pt-1 border-t border-zinc-900/80 transition-opacity duration-300 ${
            isHolding ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {/* Add to Lock Screen Button */}
          <button
            onClick={onOpenLockScreenGuide}
            className="w-full py-2 px-3 bg-gradient-to-r from-purple-950/40 via-zinc-900/80 to-amber-950/40 hover:from-purple-900/50 hover:to-amber-900/50 border border-purple-500/30 rounded-xl flex items-center justify-between text-left transition-all active:scale-[0.99] group shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Smartphone className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Add as Lock Screen App</span>
                  <span className="text-[9px] bg-purple-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                    PWA
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400">
                  Play incoming friend audio over lock screen
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-400 group-hover:translate-x-0.5 transition-transform shrink-0">
              Setup →
            </span>
          </button>

          {/* Quick Controls Grid */}
          <div className="grid grid-cols-3 gap-2">
            {/* Soundboard */}
            <button
              onClick={onOpenSoundboard}
              className="py-2.5 px-2 bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
            >
              <Volume2 className="w-4 h-4 text-rose-400" />
              <span className="text-[10px] font-bold text-white">Soundboard</span>
            </button>

            {/* Radio Filter */}
            <button
              onClick={() => setFilterMenuOpen(!filterMenuOpen)}
              className={`py-2.5 px-2 border rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                filterMenuOpen
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-zinc-900/90 hover:bg-zinc-850 border-zinc-800 text-white'
              }`}
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-bold">Radio Filter</span>
            </button>

            {/* Mic Permission */}
            <button
              onClick={onRequestMic}
              className={`py-2.5 px-2 border rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                hasMicPermission
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400'
                  : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span className="text-[10px] font-bold">
                {hasMicPermission ? 'Mic Ready' : 'Enable Mic'}
              </span>
            </button>
          </div>

          {/* Filter Selection Drawer */}
          {filterMenuOpen && (
            <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl animate-in fade-in duration-150">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 px-1">
                Walkie Radio Filter
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      onChangeVoiceFilter(f.id);
                      setFilterMenuOpen(false);
                    }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      voiceFilter === f.id
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold'
                        : 'bg-zinc-950 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="text-xs">{f.label}</div>
                    <div className="text-[9px] text-zinc-400 line-clamp-1">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
