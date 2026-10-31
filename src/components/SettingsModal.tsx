import React, { useRef, useState } from 'react';
import {
  X,
  Settings as SettingsIcon,
  Volume2,
  Share2,
  Trash2,
  Camera,
  Image as ImageIcon,
  Check,
  Smartphone,
  Palette,
  Ban,
  UserCheck,
  Download,
  Edit3,
  Shield,
} from 'lucide-react';
import { UserProfile, AppTheme, ThemeId, Friend } from '../types';
import { THEMES } from '../data/themes';
import { audioEngine } from '../utils/audioEffects';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  myPin: string;
  volume: number;
  onChangeVolume: (vol: number) => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onOpenProfileEdit: () => void;
  activeTheme: AppTheme;
  onSelectTheme: (themeId: ThemeId) => void;
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
  userProfile,
  onSaveProfile,
  onOpenProfileEdit,
  activeTheme,
  onSelectTheme,
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
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Settings & Profile</h2>
              <p className="text-xs text-zinc-400">Configure your walkie, account, and downloads</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          
          {/* Section 1: User Profile & Quick Edit */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Your Profile
              </span>
              <button
                onClick={() => {
                  onClose();
                  onOpenProfileEdit();
                }}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Full Profile</span>
              </button>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-indigo-300 border border-zinc-700 shadow cursor-pointer"
                  title="Upload avatar photo"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white truncate">{userProfile.name}</span>
                  {userProfile.age && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {userProfile.age} yrs
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-500/30">
                    #{myPin}
                  </span>
                </div>
                <div className="text-xs text-indigo-300 mt-0.5 truncate">
                  {userProfile.noteStatus}
                </div>
                {userProfile.bio && (
                  <div className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                    {userProfile.bio}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="text-zinc-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Change Banner Photo</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProfileEdit();
                }}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-medium cursor-pointer"
              >
                Change Nickname / Age
              </button>
            </div>
          </div>

          {/* Section 2: Download / Install App (Moved from main screen) */}
          {onOpenInstallModal && (
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Download & Install App</span>
                    <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.2 rounded-full border border-indigo-500/30">
                      PWA
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    Install 11:11 directly on Android, iPhone, or PC for fast access
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenInstallModal}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow shrink-0 cursor-pointer"
              >
                Download
              </button>
            </div>
          )}

          {/* Section 3: Lock Screen Background Audio Guide (Moved from main screen) */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Lock Screen Background Setup
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  How to hear friend audio when phone screen is turned off
                </div>
              </div>
            </div>

            <button
              onClick={onOpenLockScreenGuide}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-bold transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              View Guide
            </button>
          </div>

          {/* Section 4: Volume Level */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Walkie Speaker Volume</span>
              </span>
              <span className="text-xs font-mono font-bold text-indigo-400">{volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => onChangeVolume(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Section 5: Themes (Subtle & Eye-Friendly) */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2.5">
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              <span>Theme Color</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(THEMES) as ThemeId[]).map((tid) => {
                const th = THEMES[tid];
                const isSelected = activeTheme.id === tid;
                return (
                  <button
                    key={tid}
                    type="button"
                    onClick={() => onSelectTheme(tid)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-800/90 border-indigo-500 text-white shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{th.name}</div>
                      <div className="text-[9px] text-zinc-500">{th.tagline}</div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 6: Blocked Friends List */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2.5">
              <Ban className="w-3.5 h-3.5 text-rose-400" />
              <span>Blocked Pins ({blockedPins.length})</span>
            </div>

            <form onSubmit={handleManualBlock} className="flex gap-2 mb-3">
              <input
                type="text"
                maxLength={4}
                value={manualBlockPin}
                onChange={(e) => setManualBlockPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Block PIN (e.g. 1234)"
                className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                disabled={!manualBlockPin.trim()}
                className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer"
              >
                Block
              </button>
            </form>

            {blockedPins.length === 0 ? (
              <p className="text-[11px] text-zinc-500">No blocked contacts</p>
            ) : (
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {blockedPins.map((bPin) => {
                  const friendObj = friends.find((f) => f.pin === bPin);
                  return (
                    <div
                      key={bPin}
                      className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <span className="font-mono text-zinc-300">
                        #{bPin} {friendObj && `(${friendObj.name})`}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUnblockPin(bPin)}
                        className="text-indigo-400 hover:text-indigo-300 text-[11px] font-semibold cursor-pointer"
                      >
                        Unblock
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 7: Share & Reset Data */}
          <div className="pt-2 flex items-center justify-between text-xs">
            <button
              onClick={onShareApp}
              className="text-zinc-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share 11:11 App Link</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Reset all friend data and chat logs?')) {
                  onClearData();
                  onClose();
                }
              }}
              className="text-rose-400 hover:text-rose-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear App Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
