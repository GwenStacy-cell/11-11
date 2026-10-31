import React, { useState, useRef } from 'react';
import { X, Check, Sparkles, Palette, Upload, Image as ImageIcon, Camera } from 'lucide-react';
import { UserProfile, ThemeId } from '../types';
import { THEMES } from '../data/themes';
import { audioEngine } from '../utils/audioEffects';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Alpha',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Echo',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Felix',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Luna',
];

const PRESET_BANNERS = [
  { id: 'neon-sunset', label: 'Neon Sunset', style: 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)' },
  { id: 'cyber-neon', label: 'Cyber Cyan', style: 'linear-gradient(135deg, #06b6d4 0%, #ec4899 100%)' },
  { id: 'vintage-tactical', label: 'Vintage Field', style: 'linear-gradient(135deg, #27272a 0%, #713f12 50%, #3f6212 100%)' },
  { id: 'mono-studio', label: 'Mono Platinum', style: 'linear-gradient(135deg, #09090b 0%, #27272a 50%, #52525b 100%)' },
  { id: 'aurora', label: 'Aurora', style: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' },
  { id: 'violet-pulse', label: 'Electric Violet', style: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)' },
];

const PRESET_STATUSES = [
  '11:11 make a wish ✨',
  'In class 🤫 dont talk loud!',
  'Headphones on full blast 🎧',
  'Gaming with the squad 🎮',
  'Skatepark session 🛹',
  'Studying / Do Not Disturb 📚',
  'Available on walkie 📻',
];

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
}) => {
  const [name, setName] = useState(userProfile.name);
  const [age, setAge] = useState<number | undefined>(userProfile.age);
  const [avatar, setAvatar] = useState(userProfile.avatar);
  const [banner, setBanner] = useState(userProfile.banner);
  const [noteStatus, setNoteStatus] = useState(userProfile.noteStatus);
  const [bio, setBio] = useState(userProfile.bio || '');
  const [accentColor, setAccentColor] = useState(userProfile.accentColor || '#f59e0b');
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>(userProfile.themeId || 'amber');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleSelectTheme = (themeId: ThemeId) => {
    setSelectedThemeId(themeId);
    const th = THEMES[themeId];
    setBanner(th.bannerStyle);
    setAccentColor(th.primary);
    audioEngine.playPokeSound();
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
        setCustomAvatarUrl('');
        audioEngine.playPokeSound();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBanner(`url("${reader.result}") center/cover no-repeat`);
        audioEngine.playPokeSound();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...userProfile,
      name: name.trim() || 'My Walkie',
      age: age ? Number(age) : undefined,
      avatar: customAvatarUrl.trim() || avatar,
      banner,
      noteStatus: noteStatus.trim() || 'Available on 11:11',
      bio: bio.trim(),
      accentColor,
      themeId: selectedThemeId,
    });
    audioEngine.playPokeSound();
    onClose();
  };

  const activeThemeObj = THEMES[selectedThemeId] || THEMES.amber;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={avatarInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleAvatarFileUpload}
        />
        <input
          type="file"
          ref={bannerInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleBannerFileUpload}
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-black shadow-md transition-colors"
              style={{ backgroundColor: activeThemeObj.primary }}
            >
              <Palette className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Customize Profile</h2>
              <p className="text-xs text-zinc-400">Set your gallery photo, banner, and note</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="mt-4 rounded-2xl border border-zinc-700/60 overflow-hidden shadow-xl">
          {/* Banner */}
          <div
            className="h-28 w-full relative transition-all duration-300 flex items-end justify-between p-3"
            style={{ background: banner }}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-white drop-shadow-md px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm">
              {activeThemeObj.name} Theme
            </div>

            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              className="px-2.5 py-1 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-xl text-white text-[11px] font-semibold border border-white/20 flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Change Banner</span>
            </button>
          </div>

          {/* Avatar and name bar */}
          <div className="p-4 bg-zinc-950 flex items-start gap-3.5 -mt-8 relative">
            <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
              <img
                src={customAvatarUrl.trim() || avatar}
                alt={name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover border-4 border-zinc-950 shadow-lg transition-all group-hover:opacity-80"
                style={{ outline: `2px solid ${accentColor}` }}
              />
              <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950" />
            </div>

            <div className="flex-1 pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{name || 'Your Name'}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold bg-zinc-800 text-zinc-300">
                    #{userProfile.pin}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="text-[11px] font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Gallery Photo</span>
                </button>
              </div>

              <div className="text-xs font-medium mt-0.5 flex items-center gap-1.5" style={{ color: activeThemeObj.primary }}>
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{noteStatus || 'Status Note'}</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          
          {/* Gallery Upload Actions */}
          <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="flex-1 py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Camera className="w-4 h-4 text-amber-400" />
              <span>Upload Avatar from Gallery</span>
            </button>

            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              className="flex-1 py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>Upload Banner from Gallery</span>
            </button>
          </div>

          {/* Aesthetic Theme Switcher Section */}
          <div className="p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Palette className="w-4 h-4" style={{ color: activeThemeObj.primary }} />
                <span>Color Theme</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(THEMES) as ThemeId[]).map((themeKey) => {
                const th = THEMES[themeKey];
                const isSelected = selectedThemeId === themeKey;
                return (
                  <button
                    type="button"
                    key={themeKey}
                    onClick={() => handleSelectTheme(themeKey)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-zinc-900 ring-2'
                        : 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-800/60'
                    }`}
                    style={{
                      borderColor: isSelected ? th.primary : undefined,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center -space-x-1">
                        <span className="w-3.5 h-3.5 rounded-full border border-zinc-950" style={{ backgroundColor: th.primary }} />
                        <span className="w-3.5 h-3.5 rounded-full border border-zinc-950" style={{ backgroundColor: th.secondary }} />
                      </div>
                      <span className="text-xs font-bold text-white">{th.name}</span>
                    </div>

                    {isSelected && <Check className="w-3.5 h-3.5" style={{ color: th.primary }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nickname & Age Row */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-2">
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                Nickname
              </label>
              <input
                type="text"
                value={name}
                maxLength={24}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan"
                className="w-full px-3 py-2 bg-zinc-800/80 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                Age
              </label>
              <input
                type="number"
                value={age || ''}
                min={10}
                max={99}
                onChange={(e) => setAge(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                placeholder="Age"
                className="w-full px-3 py-2 bg-zinc-800/80 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 text-center"
              />
            </div>
          </div>

          {/* Live Note Status */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-zinc-300">
                Status Note
              </label>
              <span className="text-[10px] text-zinc-500">{noteStatus.length}/60</span>
            </div>
            <input
              type="text"
              value={noteStatus}
              maxLength={60}
              onChange={(e) => setNoteStatus(e.target.value)}
              placeholder="e.g. In class 🤫, Gaming 🎮, 11:11 make a wish ✨"
              className="w-full px-3 py-2 bg-zinc-800/80 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-zinc-500"
            />
            {/* Quick Presets */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PRESET_STATUSES.map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setNoteStatus(st)}
                  className={`text-[10px] px-2 py-1 rounded-lg border transition-colors ${
                    noteStatus === st
                      ? 'bg-zinc-800 text-white font-bold'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                  style={{
                    borderColor: noteStatus === st ? activeThemeObj.primary : undefined,
                    color: noteStatus === st ? activeThemeObj.primary : undefined,
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Banners */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 block mb-1.5">
              Or Choose Preset Banner
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_BANNERS.map((b) => (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => setBanner(b.style)}
                  className={`h-11 rounded-xl border relative overflow-hidden text-left p-2 transition-all ${
                    banner === b.style ? 'ring-2 ring-white border-transparent' : 'border-zinc-700 opacity-80 hover:opacity-100'
                  }`}
                  style={{ background: b.style }}
                >
                  <span className="text-[10px] font-bold text-white drop-shadow-md">
                    {b.label}
                  </span>
                  {banner === b.style && (
                    <Check className="w-3.5 h-3.5 text-white absolute bottom-1 right-1 drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Avatars */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 block mb-1.5">
              Or Choose Preset Avatar
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {PRESET_AVATARS.map((avUrl, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => {
                    setAvatar(avUrl);
                    setCustomAvatarUrl('');
                  }}
                  className={`relative rounded-full p-0.5 transition-all ${
                    avatar === avUrl && !customAvatarUrl
                      ? 'ring-2 scale-105'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    outlineColor: avatar === avUrl && !customAvatarUrl ? activeThemeObj.primary : undefined,
                  }}
                >
                  <img
                    src={avUrl}
                    alt="Preset"
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-zinc-950 font-bold rounded-xl text-xs transition-all active:scale-95 shadow-lg"
              style={{
                backgroundColor: activeThemeObj.primary,
                boxShadow: `0 4px 14px ${activeThemeObj.primary}66`,
              }}
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
