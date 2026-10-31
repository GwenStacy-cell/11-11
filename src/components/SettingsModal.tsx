import React, { useRef, useState } from 'react';
import {
  X,
  Settings as SettingsIcon,
  Volume2,
  Sliders,
  Share2,
  Trash2,
  Camera,
  Image as ImageIcon,
  Check,
  Smartphone,
  Mic,
  ShieldAlert,
  Palette,
  Ban,
  UserCheck,
  Download
} from 'lucide-react';
import { UserProfile, VoiceFilter, AppTheme, ThemeId, Friend } from '../types';
import { THEMES } from '../data/themes';
import { audioEngine } from '../utils/audioEffects';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  myPin: string;
  volume: number;
  onChangeVolume: (vol: number) => void;
  voiceFilter: VoiceFilter;
  onChangeVoiceFilter: (filter: VoiceFilter) => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  activeTheme: AppTheme;
  onSelectTheme: (themeId: ThemeId) => void;
  hasMicPermission: boolean;
  onRequestMic: () => void;
  onOpenLockScreenGuide: () => void;
  onClearData: () => void;
  onShareApp: () => void;
  blockedPins: string[];
  friends: Friend[];
  onBlockPin: (pin: string) => void;
  onUnblockPin: (pin: string) => void;
  onOpenInstallModal?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  myPin,
  volume,
  onChangeVolume,
  voiceFilter,
  onChangeVoiceFilter,
  userProfile,
  onSaveProfile,
  activeTheme,
  onSelectTheme,
  hasMicPermission,
  onRequestMic,
  onOpenLockScreenGuide,
  onClearData,
  onShareApp,
  blockedPins = [],
  friends = [],
  onBlockPin,
  onUnblockPin,
  onOpenInstallModal,
}) => {
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const [manualBlockPin, setManualBlockPin] = useState('');

  if (!isOpen) return null;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSaveProfile({
          ...userProfile,
          avatar: reader.result,
        });
        audioEngine.playPokeSound();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSaveProfile({
          ...userProfile,
          banner: `url("${reader.result}") center/cover no-repeat`,
        });
        audioEngine.playPokeSound();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleManualBlock = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = manualBlockPin.trim();
    if (pin && pin !== myPin) {
      onBlockPin(pin);
      setManualBlockPin('');
      audioEngine.playPokeSound();
    }
  };

  const filters: { id: VoiceFilter; label: string; desc: string }[] = [
    { id: 'classic-walkie', label: 'Classic CB Radio', desc: 'Analog 300Hz-3.4kHz bandpass filter with squelch' },
    { id: 'crisp', label: 'Crisp Studio', desc: 'Natural high-definition direct microphone audio' },
    { id: 'megaphone', label: 'Megaphone', desc: 'Resonant horn acoustic reflection' },
    { id: 'deep-radio', label: 'Tactical Radio', desc: 'Low-frequency dispatcher tone' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Hidden File Pickers */}
        <input
          type="file"
          ref={avatarInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleAvatarUpload}
        />
        <input
          type="file"
          ref={bannerInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleBannerUpload}
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">11:11 Walkie Settings</h2>
              <p className="text-xs text-zinc-400">Audio, gallery customizer, and app options</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          
          {/* Section 1: Gallery Avatar & Banner Upload */}
          <div className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-2xl">
            <div className="text-xs font-bold text-white mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Gallery Photo & Banner</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">PIN #{myPin}</span>
            </div>

            {/* Discord-style Banner & Avatar Preview */}
            <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 mb-3.5 shadow-md">
              <div
                className="h-20 w-full relative transition-all"
                style={{
                  background: userProfile.banner,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-transparent to-transparent" />
              </div>
              <div className="px-3 pb-3 flex items-start gap-3 -mt-6 relative">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  referrerPolicy="no-referrer"
                  className="w-13 h-13 rounded-full object-cover border-3 border-zinc-950 shadow-md shrink-0"
                  style={{ outline: `2px solid ${userProfile.accentColor || '#f59e0b'}` }}
                />
                <div className="flex-1 pt-1.5 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{userProfile.name}</div>
                  <div className="text-[11px] text-amber-300 truncate">{userProfile.noteStatus}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
              >
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Set Avatar</span>
              </button>

              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
              >
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Set Banner</span>
              </button>
            </div>
          </div>

          {/* Section 2: Share 11:11 App */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-zinc-900 to-orange-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Share2 className="w-4 h-4" />
                <span>Share 11:11 Walkie</span>
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Send invite link & PIN #{myPin} to friends
              </div>
            </div>

            <button
              onClick={() => {
                audioEngine.playPokeSound();
                onShareApp();
              }}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-amber-950/40"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share App</span>
            </button>
          </div>

          {/* Section 3: Audio Gain & Radio Filter */}
          <div className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Volume2 className="w-4 h-4 text-rose-400" />
                <span>Audio Gain / Volume</span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">
                {Math.round(volume * 100)}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />

            <div>
              <div className="text-[11px] font-semibold text-zinc-300 mb-1.5 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Radio Voice Filter</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      onChangeVoiceFilter(f.id);
                      audioEngine.playPokeSound();
                    }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      voiceFilter === f.id
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
                    }`}
                  >
                    <div className="text-xs">{f.label}</div>
                    <div className="text-[9px] text-zinc-400 truncate">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Color Themes */}
          <div className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-2xl">
            <div className="text-xs font-bold text-white mb-2.5 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Aesthetic Color Theme</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(THEMES) as ThemeId[]).map((themeKey) => {
                const th = THEMES[themeKey];
                const isSelected = activeTheme.id === themeKey;
                return (
                  <button
                    key={themeKey}
                    onClick={() => {
                      onSelectTheme(themeKey);
                      audioEngine.playPokeSound();
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-zinc-900 ring-2'
                        : 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-800'
                    }`}
                    style={{ borderColor: isSelected ? th.primary : undefined }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: th.primary }} />
                      <span className="text-xs font-bold text-white">{th.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5" style={{ color: th.primary }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Block & Unblock Users */}
          <div className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Ban className="w-4 h-4 text-rose-400" />
                <span>Blocked Users ({blockedPins.length})</span>
              </div>
              <span className="text-[10px] text-zinc-500">Mutes transmissions & pokes</span>
            </div>

            {/* List of blocked users */}
            {blockedPins.length === 0 ? (
              <div className="p-3 bg-zinc-900/40 rounded-xl text-center text-[11px] text-zinc-500 border border-dashed border-zinc-800">
                No users are currently blocked.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {blockedPins.map((pin) => {
                  const friend = friends.find((f) => f.pin === pin);
                  return (
                    <div
                      key={pin}
                      className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="text-xs font-semibold text-white">
                          {friend ? friend.name : `PIN #${pin}`}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">#{pin}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onUnblockPin(pin);
                          audioEngine.playPokeSound();
                        }}
                        className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-[10px] font-bold rounded-lg border border-zinc-700 flex items-center gap-1 transition-colors"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Unblock</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Manual block input */}
            <form onSubmit={handleManualBlock} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Block PIN (e.g. 7419)"
                maxLength={6}
                value={manualBlockPin}
                onChange={(e) => setManualBlockPin(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 font-mono"
              />
              <button
                type="submit"
                disabled={!manualBlockPin.trim()}
                className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-40"
              >
                Block
              </button>
            </form>
          </div>

          {/* Section 6: Mobile & Lock Screen */}
          <div className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-2xl space-y-2.5">
            <div className="text-xs font-bold text-white flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-purple-400" />
                <span>Mobile & Lock Screen Integration</span>
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                Vercel PWA
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Download 11:11 directly to your phone to hear live speech even when the screen is locked!
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {onOpenInstallModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenInstallModal();
                  }}
                  className="py-2.5 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-950" />
                  <span>Download App</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLockScreenGuide();
                }}
                className="py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                <span>Lock Screen</span>
              </button>
            </div>

            <button
              onClick={onRequestMic}
              className={`w-full py-2.5 px-3 border rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                hasMicPermission
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                <span>Microphone Access</span>
              </div>
              <span>{hasMicPermission ? '✓ Granted' : 'Request Permission'}</span>
            </button>
          </div>

          {/* Section 7: Reset / Clear */}
          <div className="p-4 bg-zinc-950/70 border border-rose-500/30 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Reset Circle & Cached Data</span>
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                Clears saved friends and transmission logs
              </div>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear your circle and reset all cached data?')) {
                  onClearData();
                  onClose();
                }
              }}
              className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-3 border-t border-zinc-800 text-center text-[10px] text-zinc-500 font-mono">
          11:11 LIVE WALKIE · P2P WEB-RTC ENGINE · VERSION 2.0.0
        </div>
      </div>
    </div>
  );
};
