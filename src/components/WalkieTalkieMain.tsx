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
  Wifi,
  Battery,
  PhoneCall,
  Sliders,
  UserCheck,
  Palette,
  Edit3,
  QrCode,
  Download
} from 'lucide-react';
import { Friend, VoiceFilter, UserProfile, AppTheme } from '../types';
import { LiveWaveform } from './LiveWaveform';
import { VerticalVolumeSlider } from './VerticalVolumeSlider';
import { DynamicSignalIndicator } from './DynamicSignalIndicator';
import { VoiceAvatarHalo } from './VoiceAvatarHalo';

interface WalkieTalkieMainProps {
  activeFriend: Friend;
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
  onTriggerFriendReply: () => void;
  onOpenSoundboard: () => void;
  onOpenFriendManager: () => void;
  onOpenAbout: () => void;
  onOpenHistory: () => void;
  onOpenLockScreen: () => void;
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
}

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
  onTriggerFriendReply,
  onOpenSoundboard,
  onOpenFriendManager,
  onOpenAbout,
  onOpenHistory,
  onOpenLockScreen,
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

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-full bg-zinc-950 text-white select-none overflow-y-auto scrollbar-none relative">
      
      {/* Ambient In-Chassis Blurred Avatar Glow (Visible strictly while transmitting or receiving) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <img
          key={activeFriend.id}
          src={activeFriend.avatar}
          alt=""
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover scale-110 filter blur-[4px] transition-all duration-500 ease-out ${
            isTransmitting || isReceiving || isLockedOnAir ? 'opacity-85 scale-115' : 'opacity-0'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/30 to-zinc-950/80" />
      </div>

      {/* Floating Transmitting Status Overlay (Appears smoothly when holding without shifting button) */}
      <div
        className={`absolute top-4 inset-x-5 z-30 pointer-events-none flex flex-col items-center justify-center transition-all duration-300 ${
          isHolding ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
      >
        <div className="px-4 py-2 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 font-mono text-xs font-bold flex items-center gap-2 shadow-lg backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span>TRANSMITTING TO {activeFriend.name.toUpperCase()} ({formatTimer(transmissionDuration)})</span>
        </div>
        <span className="text-[10px] text-zinc-400 mt-1.5 font-medium tracking-wide">
          {isLockedOnAir ? 'Hands-free locked · Tap button to stop' : 'Release button to send message'}
        </span>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Top Device Hardware Status Bar */}
        <div
          className={`flex items-center justify-between px-5 pt-3 pb-1.5 text-[11px] text-zinc-400 font-medium border-b border-zinc-900/60 transition-opacity duration-300 ${
            isHolding ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-amber-400 text-xs tracking-tight">CH 11·11</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400 text-[10px]">462.562 MHz</span>
          </div>

          <div className="flex items-center gap-2.5">
            <DynamicSignalIndicator
              isTransmitting={isTransmitting}
              isReceiving={isReceiving}
              isLockedOnAir={isLockedOnAir}
            />
            <div className="flex items-center gap-1 text-zinc-400 text-[10px]">
              <span>98%</span>
              <Battery className="w-3.5 h-3.5 text-zinc-300" />
            </div>
          </div>
        </div>

        {/* Main App Bar - Branding 11:11 */}
        <div
          className={`px-5 py-2.5 flex items-center justify-between border-b border-zinc-900/80 transition-opacity duration-300 ${
            isHolding ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center font-black text-xs text-black shadow-md shadow-amber-500/20">
              11:11
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>11:11</span>
                {onOpenQrCode ? (
                  <button
                    onClick={() => onOpenQrCode()}
                    className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-amber-400 border border-amber-500/30 flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                    title="Show My QR Code"
                  >
                    <QrCode className="w-3 h-3 text-amber-400" />
                    <span>#{myPin}</span>
                  </button>
                ) : (
                  <span className="text-[10px] font-mono font-normal px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                    PIN: #{myPin}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-1.5">
            {/* Download & Install App */}
            {onOpenInstallModal && (
              <button
                onClick={onOpenInstallModal}
                className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                title="Download & Install 11:11 App"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}

            {/* Silent / DND Toggle */}
            <button
              onClick={onToggleDnd}
              className={`p-2 rounded-xl text-xs font-medium transition-all ${
                isDnd
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
              title={isDnd ? 'Silent Mode Active' : 'Silent Mode Off'}
            >
              {isDnd ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            </button>

            {/* History */}
            <button
              onClick={onOpenHistory}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl transition-colors"
              title="Transmission History"
            >
              <History className="w-4 h-4" />
            </button>

            {/* About */}
            <button
              onClick={onOpenAbout}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl transition-colors"
              title="About 11:11"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User's Profile Banner & Status Note Card */}
        <div
          className={`px-5 pt-2.5 transition-opacity duration-300 ${
            isHolding ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div
            onClick={onOpenProfileEdit}
            className="relative rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group shadow-md"
          >
            {/* Customized Banner */}
            <div
              className="h-12 w-full transition-all"
              style={{ background: userProfile.banner }}
            />

            {/* Info row */}
            <div className="p-2.5 bg-zinc-900/90 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative -mt-6">
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border-2 border-zinc-950 shadow-md"
                    style={{ outline: `2px solid ${userProfile.accentColor}` }}
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-zinc-950" />
                </div>

                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{userProfile.name}</span>
                    <span className="text-[9px] text-zinc-400 font-normal">· tap to edit profile</span>
                  </div>
                  <div className="text-[11px] text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate max-w-[210px]">{userProfile.noteStatus}</span>
                  </div>
                </div>
              </div>

              <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 group-hover:text-white group-hover:bg-zinc-700 transition-colors">
                <Edit3 className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Viral Lock Screen Simulator Launch Banner */}
        <div
          className={`px-5 pt-2 transition-opacity duration-300 ${
            isHolding ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <button
            onClick={onOpenLockScreen}
            className="w-full py-2 px-3 bg-gradient-to-r from-rose-950/60 via-zinc-900 to-purple-950/60 hover:from-rose-900/70 hover:to-purple-900/70 border border-rose-500/30 rounded-xl flex items-center justify-between text-left transition-all active:scale-[0.99] group shadow-sm shadow-rose-950/30"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>11:11 Lock Screen Simulator</span>
                  <span className="text-[9px] bg-rose-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                    VIRAL
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400">
                  Incoming audio plays aloud through locked phone
                </div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-rose-400 group-hover:translate-x-0.5 transition-transform">
              Try →
            </span>
          </button>
        </div>

        {/* Friends Horizontal Carousel */}
        <div
          className={`pt-2.5 pb-1 px-5 transition-opacity duration-300 ${
            isHolding ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Friend Circles
            </span>
            <button
              onClick={onOpenFriendManager}
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Manage ({friends.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {friends.map((f) => {
              const isSelected = f.id === activeFriend.id;
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
        </div>

        {/* Active Friend Header Card */}
        <div
          className={`px-5 py-1.5 transition-opacity duration-300 ${
            isHolding ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="p-3 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
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

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">{activeFriend.name}</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-zinc-800 text-zinc-400">
                    #{activeFriend.pin}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 truncate max-w-[170px] mt-0.5">
                  {activeFriend.statusText}
                </div>
              </div>
            </div>

            {/* Quick Friend Actions */}
            <div className="flex items-center gap-1.5">
              {onOpenQrCode && (
                <button
                  onClick={() => onOpenQrCode({ name: activeFriend.name, pin: activeFriend.pin })}
                  className="p-1.5 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/80 rounded-xl text-zinc-300 hover:text-amber-400 text-[11px] font-medium flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                  title={`Show ${activeFriend.name}'s QR Code`}
                >
                  <QrCode className="w-3.5 h-3.5 text-amber-400" />
                </button>
              )}

              <button
                onClick={onSendPoke}
                className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl text-amber-300 text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95"
                title="Poke friend with screen shake"
              >
                <Hand className="w-3.5 h-3.5" />
                <span>Poke</span>
              </button>

              <button
                onClick={onTriggerFriendReply}
                className="px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-zinc-300 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
                title="Simulate friend talking to you"
              >
                <PhoneCall className="w-3 h-3 text-emerald-400" />
                <span>Banter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Audio Status & Waveform */}
        <div
          className={`px-5 py-1 flex flex-col items-center transition-opacity duration-300 ${
            isHolding ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="w-full h-12 bg-zinc-900/40 rounded-2xl border border-zinc-800/60 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="text-[10px] font-mono font-bold tracking-wider mb-0.5">
              {isTransmitting ? (
                <span className="text-rose-400 animate-pulse flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  TRANSMITTING LIVE ({formatTimer(transmissionDuration)})
                </span>
              ) : isReceiving ? (
                <span className="text-amber-400 animate-pulse flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  RECEIVING AUDIO FROM {incomingSender || activeFriend.name}...
                </span>
              ) : isLockedOnAir ? (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  HANDS-FREE ON AIR ({formatTimer(transmissionDuration)})
                </span>
              ) : (
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-zinc-600" />
                  11:11 CHANNEL READY · HOLD TO TALK
                </span>
              )}
            </div>

            <LiveWaveform
              isActive={isTransmitting || isReceiving || isLockedOnAir}
              color={isTransmitting ? '#f43f5e' : isReceiving ? '#f59e0b' : '#10b981'}
              isReceiving={isReceiving}
            />
          </div>
        </div>

        {/* Central Area: Small PTT Button + Embedded Custom Vertical Volume Slider */}
        <div className="flex-1 flex items-center justify-center py-2 px-5 gap-3">
          
          {/* Main PTT Button Centerpiece */}
          <div className="flex-1 flex flex-col items-center justify-center">
            
            {/* Dedicated PTT Button Wrapper ensuring 100% exact centering for voice rings */}
            <div className="relative flex items-center justify-center">
              
              {/* Active Voice Halo Ring surrounded with audio frequency effect */}
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
                    className="absolute w-[150px] h-[150px] rounded-full border animate-signal-wave pointer-events-none z-0"
                    style={{ borderColor: activeTheme.radarBorder }}
                  />
                  <div
                    className="absolute w-[130px] h-[130px] rounded-full border animate-signal-wave [animation-delay:400ms] pointer-events-none z-0"
                    style={{ borderColor: activeTheme.radarBorder }}
                  />
                </>
              )}

              {isReceiving && (
                <div className="absolute w-[150px] h-[150px] rounded-full border border-amber-500/40 animate-signal-wave pointer-events-none z-0" />
              )}

              {/* Sleek, Smaller Push-To-Talk Button */}
              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  onPttStart();
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  if (!isLockedOnAir) onPttStop();
                }}
                onPointerLeave={() => {
                  if (isTransmitting && !isLockedOnAir) onPttStop();
                }}
                className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-150 select-none shadow-2xl focus:outline-none ${
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
                {/* Inner Ring Texture */}
                <div className="absolute inset-1.5 rounded-full border border-white/10 pointer-events-none" />
                
                <div className="mb-0.5">
                  {isTransmitting || isLockedOnAir ? (
                    <Radio className="w-7 h-7 text-white animate-bounce" />
                  ) : isReceiving ? (
                    <Volume2 className="w-7 h-7 text-amber-400 animate-pulse" />
                  ) : (
                    <Mic className="w-7 h-7 text-zinc-300" />
                  )}
                </div>

                <div className="text-center px-1">
                  <div className="text-[10px] font-black tracking-wider uppercase">
                    {isTransmitting
                      ? 'TALKING'
                      : isLockedOnAir
                      ? 'ON AIR'
                      : isReceiving
                      ? 'LISTEN'
                      : 'HOLD TALK'}
                  </div>
                  <div className="text-[8px] text-zinc-400 font-medium leading-none">
                    {isLockedOnAir ? 'Release' : 'or Space'}
                  </div>
                </div>
              </button>
            </div>

            {/* Lock Hands-Free Toggle */}
            <div
              className={`mt-3 flex items-center justify-center transition-opacity duration-300 ${
                isHolding ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              <button
                onClick={onToggleLockOnAir}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                  isLockedOnAir
                    ? 'text-zinc-950 shadow-lg'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
                style={{
                  backgroundColor: isLockedOnAir ? activeTheme.primary : undefined,
                  boxShadow: isLockedOnAir ? `0 0 16px ${activeTheme.primary}80` : undefined,
                }}
              >
                {isLockedOnAir ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                <span>{isLockedOnAir ? 'Release Mic' : 'Lock Hands-Free'}</span>
              </button>
            </div>
          </div>

          {/* Custom Vertical Volume Slider for Incoming Broadcasts */}
          <div
            className={`bg-zinc-900/70 border border-zinc-800/80 rounded-3xl p-2 flex flex-col items-center justify-center shadow-lg transition-opacity duration-300 ${
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

        {/* Bottom Tool Strip */}
        <div
          className={`p-3.5 bg-zinc-900/90 border-t border-zinc-900 rounded-t-3xl transition-opacity duration-300 ${
            isHolding ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="grid grid-cols-3 gap-2">
            {/* Soundboard button */}
            <button
              onClick={onOpenSoundboard}
              className="py-2 px-2 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
            >
              <Volume2 className="w-4 h-4 text-rose-400" />
              <span className="text-[10px] font-bold text-white">Soundboard</span>
            </button>

            {/* Voice Filter selector */}
            <button
              onClick={() => setFilterMenuOpen(!filterMenuOpen)}
              className="py-2 px-2 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-bold text-white">Radio Filter</span>
            </button>

            {/* Microphone Permission status */}
            <button
              onClick={onRequestMic}
              className={`py-2 px-2 border rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                hasMicPermission
                  ? 'bg-zinc-800/80 border-emerald-500/40 text-emerald-400'
                  : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-400 hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span className="text-[10px] font-bold">
                {hasMicPermission ? 'Mic: Ready' : 'Enable Mic'}
              </span>
            </button>
          </div>

          {/* Filter Selection Drawer */}
          {filterMenuOpen && (
            <div className="mt-2.5 p-2.5 bg-zinc-950 border border-zinc-800 rounded-2xl animate-in fade-in duration-150">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
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
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
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
