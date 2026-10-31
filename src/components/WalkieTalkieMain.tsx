import React from 'react';
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
  History,
  Sparkles,
  Edit3,
  Edit2,
  Check,
  X,
  QrCode,
  Plus,
  Settings as SettingsIcon,
  Ban,
  Trash2,
  RotateCw,
} from 'lucide-react';
import { Friend, UserProfile, AppTheme, FriendRequest } from '../types';
import { LiveWaveform } from './LiveWaveform';
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
  onOpenFriendManager: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  isDnd: boolean;
  onToggleDnd: () => void;
  myPin: string;
  transmissionDuration: number;
  userProfile: UserProfile;
  onOpenProfileEdit: () => void;
  activeTheme: AppTheme;
  onOpenQrCode?: (targetFriend?: { name: string; pin: string }, tab?: 'my-code' | 'scanner') => void;
  blockedPins?: string[];
  onBlockFriend?: (pin: string) => void;
  onUnblockFriend?: (pin: string) => void;
  onMuteCurrentSender?: () => void;
  onRenameFriend?: (id: string, newNickname: string) => void;
  incomingRequests?: FriendRequest[];
  onAcceptRequest?: (req: FriendRequest) => void;
  onDeclineRequest?: (pin: string) => void;
  onDeleteFriend?: (id: string) => void;
  onRefreshFriend?: (pin: string) => void;
}

const getBannerStyle = (bannerStr: string) => {
  if (!bannerStr) return 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #1e293b 100%)';
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
  onOpenFriendManager,
  onOpenHistory,
  onOpenSettings,
  isDnd,
  onToggleDnd,
  myPin,
  transmissionDuration,
  userProfile,
  onOpenProfileEdit,
  activeTheme,
  onOpenQrCode,
  blockedPins = [],
  onBlockFriend,
  onUnblockFriend,
  onMuteCurrentSender,
  onRenameFriend,
  incomingRequests = [],
  onAcceptRequest,
  onDeclineRequest,
  onDeleteFriend,
  onRefreshFriend,
}) => {
  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isHolding = isTransmitting || isLockedOnAir;
  const targetLabel = activeFriend ? activeFriend.name.toUpperCase() : 'NO FRIEND SELECTED';

  return (
    <div className="w-full h-full flex flex-col justify-between text-white select-none relative overflow-y-auto overflow-x-hidden scrollbar-none">
      
      {/* Subtle Ambient Vignette (Gentle and eye-friendly, no neon lights) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/90 via-zinc-950/60 to-zinc-950/95" />
      </div>

      {/* Active Incoming Speaker Notification Banner */}
      {isReceiving && incomingSender && (
        <div className="absolute top-3 inset-x-4 z-50 p-3 bg-zinc-900/95 border border-indigo-500/50 rounded-2xl shadow-2xl flex items-center justify-between backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                <span>🎙️ {incomingSender} is speaking live...</span>
              </div>
              <div className="text-[10px] text-indigo-300 font-semibold">
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
        <div className="absolute top-3 inset-x-4 z-50 p-3 bg-zinc-900/95 border border-indigo-500/50 rounded-2xl shadow-2xl flex items-center justify-between backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={incomingRequests[0].avatar}
              alt={incomingRequests[0].name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                <span>Friend Request: {incomingRequests[0].name}</span>
                {incomingRequests[0].age && (
                  <span className="text-[10px] text-zinc-400">({incomingRequests[0].age})</span>
                )}
                <span className="text-[10px] font-mono text-indigo-400">#{incomingRequests[0].pin}</span>
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
          {isLockedOnAir ? 'Hands-free active · Tap button to release' : 'Release button to send transmission'}
        </span>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 max-w-md mx-auto">
        
        {/* Top Header & Profile Section */}
        <div className="flex flex-col gap-3">
          
          {/* Top Bar: Minimal & Eye-Friendly */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-xs text-white shadow-md">
                11:11
              </div>

              {/* PIN Code Button (Opens QR & Share Modal) */}
              <button
                onClick={() => onOpenQrCode?.()}
                className="px-2.5 py-1 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-indigo-400 hover:text-indigo-300 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                title="View your PIN & Share link"
              >
                <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                <span>#{myPin}</span>
              </button>
            </div>

            {/* Quick Actions Right */}
            <div className="flex items-center gap-1.5">
              <div className="hidden xs:flex mr-1">
                <DynamicSignalIndicator
                  isTransmitting={isTransmitting}
                  isReceiving={isReceiving}
                  isLockedOnAir={isLockedOnAir}
                />
              </div>

              {/* Silent / DND Toggle */}
              <button
                onClick={onToggleDnd}
                className={`p-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isDnd
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                    : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
                title={isDnd ? 'Silent Mode Active' : 'Silent Mode Off'}
              >
                {isDnd ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              </button>

              {/* Transmission History */}
              <button
                onClick={onOpenHistory}
                className="p-2 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl transition-colors cursor-pointer"
                title="Transmission History"
              >
                <History className="w-4 h-4" />
              </button>

              {/* Settings Button */}
              <button
                onClick={onOpenSettings}
                className="p-2 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl transition-colors cursor-pointer"
                title="Settings & Options"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* User Profile Card (Clean Discord/Instagram Style) */}
          <div
            className={`transition-opacity duration-300 ${
              isHolding ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <div
              onClick={onOpenProfileEdit}
              className="relative rounded-3xl overflow-hidden border border-zinc-800/90 hover:border-zinc-700 bg-zinc-900/90 transition-all cursor-pointer group shadow-lg"
            >
              {/* Profile Banner */}
              <div
                className="h-24 sm:h-28 w-full relative transition-all duration-300 overflow-hidden"
                style={{
                  background: getBannerStyle(userProfile.banner),
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-black/25" />

                <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-semibold border border-white/15 flex items-center gap-1.5 transition-all shadow-md group-hover:scale-105">
                  <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Edit Profile</span>
                </div>
              </div>

              {/* Profile Details Bar */}
              <div className="px-4 pb-3.5 pt-0 relative flex items-start gap-3.5">
                <div className="relative -mt-8 sm:-mt-10 shrink-0">
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover border-4 border-zinc-950 shadow-xl transition-transform group-hover:scale-105"
                    style={{ outline: `2.5px solid ${userProfile.accentColor || '#818cf8'}` }}
                  />
                  <span className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow" />
                </div>

                <div className="flex-1 min-w-0 pt-1.5">
                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                    <span className="text-sm sm:text-base font-extrabold text-white truncate">
                      {userProfile.name}
                    </span>
                    {userProfile.age && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {userProfile.age} yrs
                      </span>
                    )}
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-800 text-indigo-400 border border-indigo-500/30 shrink-0">
                      #{myPin}
                    </span>
                  </div>

                  <div className="text-xs text-indigo-300 font-medium flex items-center gap-1.5 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
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

          {/* Friend Circles Section (Clean, Non-Duplicated) */}
          <div
            className={`transition-opacity duration-300 ${
              isHolding ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Friends {friends.length > 0 && `(${friends.length})`}
              </span>
              <button
                onClick={onOpenFriendManager}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Manage Friends</span>
              </button>
            </div>

            {/* Friend List or Single Minimal Clean Empty Notice */}
            {friends.length === 0 ? (
              <div
                onClick={onOpenFriendManager}
                className="p-3 bg-zinc-900/60 hover:bg-zinc-900/80 border border-dashed border-zinc-800 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-300">No friends connected yet</div>
                    <div className="text-[10px] text-zinc-400">Tap Manage Friends to search by 4-digit PIN</div>
                  </div>
                </div>

                <span className="text-xs font-bold text-indigo-400">
                  Manage →
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {friends.map((f) => {
                  const isSelected = activeFriend?.id === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => onSelectFriend(f)}
                      className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none cursor-pointer"
                    >
                      <div
                        className={`relative p-0.5 rounded-full transition-all ${
                          isSelected
                            ? 'ring-2 ring-indigo-400 scale-105 shadow-md shadow-indigo-950/50'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={f.avatar}
                          alt={f.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-full object-cover border border-zinc-700"
                        />
                        {f.isPending ? (
                          <span
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center text-[9px] font-black ring-1 ring-zinc-950"
                            title="Pending connection request"
                          >
                            ⏳
                          </span>
                        ) : blockedPins.includes(f.pin) ? (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[9px] font-bold ring-1 ring-zinc-950">
                            🚫
                          </span>
                        ) : null}
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
                        className={`text-[10px] font-medium transition-colors truncate max-w-[55px] ${
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
                  className="flex flex-col items-center gap-1 shrink-0 opacity-80 hover:opacity-100 cursor-pointer"
                  title="Add Friend by PIN"
                >
                  <div className="w-11 h-11 rounded-full bg-zinc-900 border border-dashed border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-zinc-400">Add</span>
                </button>
              </div>
            )}
          </div>

          {/* Active Target Friend Bar (Shown only when a friend is active) */}
          <div
            className={`transition-opacity duration-300 ${
              isHolding ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            {activeFriend && (
              <div className="p-3 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={activeFriend.avatar}
                      alt={activeFriend.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border-2"
                      style={{ borderColor: activeFriend.accentColor || '#818cf8' }}
                    />
                    {isReceiving && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-white truncate">{activeFriend.name}</span>
                      {activeFriend.age && (
                        <span className="text-[10px] text-zinc-400">({activeFriend.age})</span>
                      )}
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
                  {/* Refresh / Reconnect Friend */}
                  {onRefreshFriend && (
                    <button
                      onClick={() => {
                        onRefreshFriend(activeFriend.pin);
                      }}
                      className="p-2 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/80 rounded-xl text-zinc-300 hover:text-indigo-400 text-xs font-medium flex items-center gap-1 transition-all active:scale-95 shadow-sm cursor-pointer"
                      title={`Refresh connection with ${activeFriend.name}`}
                    >
                      <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                    </button>
                  )}

                  {onOpenQrCode && (
                    <button
                      onClick={() => onOpenQrCode({ name: activeFriend.name, pin: activeFriend.pin })}
                      className="p-2 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/80 rounded-xl text-zinc-300 hover:text-indigo-400 text-xs font-medium flex items-center gap-1 transition-all active:scale-95 shadow-sm cursor-pointer"
                      title={`Show ${activeFriend.name}'s QR Code`}
                    >
                      <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                    </button>
                  )}

                  <button
                    onClick={onSendPoke}
                    className="px-2.5 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 rounded-xl text-indigo-300 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm cursor-pointer"
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
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-zinc-300 hover:text-indigo-400 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      title="Set custom nickname"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                    </button>
                  )}

                  {/* Remove Friend Button */}
                  {onDeleteFriend && (
                    <button
                      onClick={() => {
                        const confirmRemove = window.confirm(
                          `Remove ${activeFriend.name} (#${activeFriend.pin}) from your friend circle? You can re-add them anytime.`
                        );
                        if (confirmRemove) {
                          onDeleteFriend(activeFriend.id);
                        }
                      }}
                      className="p-2 bg-zinc-800/80 hover:bg-rose-950/60 border border-zinc-700/80 hover:border-rose-500/40 rounded-xl text-zinc-400 hover:text-rose-400 text-xs font-medium flex items-center gap-1 transition-all active:scale-95 shadow-sm cursor-pointer"
                      title={`Remove ${activeFriend.name} from circle`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
                    className={`p-2 border rounded-xl text-xs font-medium flex items-center gap-1 transition-all active:scale-95 shadow-sm cursor-pointer ${
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
            )}
          </div>
        </div>

        {/* Central Talk Area: Waveform + Center PTT (Clean, Centered, No Volume Slider) */}
        <div className="my-auto py-4 flex flex-col items-center justify-center gap-4 w-full">
          
          {/* Live Waveform Status Banner */}
          <div
            className={`w-full max-w-sm h-11 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 flex flex-col items-center justify-center relative overflow-hidden transition-opacity duration-300 ${
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
                <span className="text-indigo-300 animate-pulse flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  INCOMING LIVE AUDIO...
                </span>
              ) : isLockedOnAir ? (
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  HANDS-FREE LOCKED ON AIR
                </span>
              ) : activeFriend ? (
                <span className="text-zinc-400">
                  READY · HOLD BUTTON TO TALK
                </span>
              ) : (
                <span className="text-zinc-500">
                  SELECT A FRIEND TO TALK
                </span>
              )}
            </div>

            <div className="w-full px-4 h-3 flex items-center justify-center">
              <LiveWaveform
                isActive={isTransmitting || isReceiving || isLockedOnAir}
                color={isTransmitting || isLockedOnAir ? '#f43f5e' : '#818cf8'}
              />
            </div>
          </div>

          {/* Clean Centered PTT Button */}
          <div className="flex flex-col items-center justify-center w-full">
            <div className="relative flex items-center justify-center">
              
              {/* Dynamic Voice Halo Rings */}
              <VoiceAvatarHalo
                isTransmitting={isTransmitting}
                isReceiving={isReceiving}
                isLockedOnAir={isLockedOnAir}
                theme={activeTheme}
                volume={0.8}
              />

              {/* Pulsing Aura */}
              {(isTransmitting || isLockedOnAir) && (
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-25 pointer-events-none"
                  style={{
                    backgroundColor: activeTheme.primary,
                  }}
                />
              )}

              {/* THE PTT BUTTON */}
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  if (!activeFriend) {
                    onOpenFriendManager();
                    return;
                  }
                  if (isLockedOnAir) {
                    onToggleLockOnAir();
                    return;
                  }
                  onPttStart();
                }}
                onPointerUp={() => {
                  if (!isLockedOnAir) onPttStop();
                }}
                onPointerLeave={() => {
                  if (isTransmitting && !isLockedOnAir) onPttStop();
                }}
                className={`relative z-10 w-36 h-36 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center transition-all duration-150 select-none shadow-2xl focus:outline-none cursor-pointer ${
                  isTransmitting || isLockedOnAir
                    ? 'text-white scale-95 ring-4 ring-rose-500/50 bg-gradient-to-b from-rose-600 to-rose-800'
                    : isReceiving
                    ? 'bg-zinc-850 text-indigo-300 ring-4 ring-indigo-500/50'
                    : 'bg-gradient-to-b from-zinc-800 to-zinc-900 text-zinc-100 hover:from-zinc-750 hover:to-zinc-850 border-2 border-zinc-700/80 shadow-black'
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
                    <Radio className="w-9 h-9 sm:w-10 sm:h-10 text-white animate-bounce" />
                  ) : isReceiving ? (
                    <Volume2 className="w-9 h-9 sm:w-10 sm:h-10 text-indigo-400 animate-pulse" />
                  ) : (
                    <Mic className="w-9 h-9 sm:w-10 sm:h-10 text-zinc-200" />
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
                  <div className="text-[9px] text-zinc-400 font-medium leading-none mt-0.5 truncate max-w-[100px]">
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

            {/* Lock Hands-Free Button */}
            <div className="mt-4 flex items-center justify-center z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!activeFriend && !isLockedOnAir) {
                    onOpenFriendManager();
                    return;
                  }
                  onToggleLockOnAir();
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md cursor-pointer ${
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
        </div>

        {/* Minimal Footer Space */}
        <div className="h-2" />
      </div>
    </div>
  );
};
