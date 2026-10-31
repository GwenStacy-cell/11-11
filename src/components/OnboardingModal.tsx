import React, { useState, useRef } from 'react';
import { Sparkles, Camera, Image as ImageIcon, User, Check, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';
import { audioEngine } from '../utils/audioEffects';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: Partial<UserProfile>) => void;
  myPin: string;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  myPin,
}) => {
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState<string>('20');
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0]);
  const [noteStatus, setNoteStatus] = useState('11:11 make a wish ✨');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
        audioEngine.playPokeSound();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNick = nickname.trim();
    if (!cleanNick) {
      setErrorMsg('Please enter your nickname');
      return;
    }
    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 10 || parsedAge > 100) {
      setErrorMsg('Please enter a valid age between 10 and 100');
      return;
    }

    audioEngine.playRogerBeep();
    onComplete({
      name: cleanNick,
      age: parsedAge,
      avatar,
      noteStatus: noteStatus.trim() || 'Available on 11:11',
      bio: `Hey, I'm ${cleanNick}! Talk with me on 11:11.`,
      banner: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #1e293b 100%)',
      accentColor: '#818cf8',
      themeId: 'slate',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
        
        {/* Subtle Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-3 shadow-inner">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Welcome to 11:11</h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">
            Create your profile to start talking with real friends over live walkie-talkie.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Avatar Selector */}
          <div className="flex flex-col items-center">
            <div className="relative mb-3">
              <img
                src={avatar}
                alt="Selected avatar"
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500/60 shadow-lg"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-indigo-300 border border-zinc-700 shadow-md cursor-pointer transition-transform active:scale-95"
                title="Upload from gallery"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* Quick Preset Avatars */}
            <div className="flex items-center gap-2">
              {PRESET_AVATARS.map((url, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setAvatar(url)}
                  className={`w-7 h-7 rounded-full overflow-hidden border transition-all cursor-pointer ${
                    avatar === url ? 'ring-2 ring-indigo-400 scale-110 border-white' : 'opacity-60 hover:opacity-100 border-zinc-700'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <span className="text-[10px] text-zinc-500 mt-1.5">Tap camera to upload from gallery</span>
          </div>

          {/* Nickname & Age Row */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="col-span-2">
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                Nickname <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="e.g. Alex"
                maxLength={20}
                className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-700/80 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 placeholder-zinc-500"
                autoFocus
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                Age <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="20"
                min={10}
                max={99}
                className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-700/80 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 placeholder-zinc-500 text-center"
              />
            </div>
          </div>

          {/* Status Note */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
              Status Note
            </label>
            <input
              type="text"
              value={noteStatus}
              onChange={(e) => setNoteStatus(e.target.value)}
              placeholder="e.g. 11:11 make a wish ✨"
              maxLength={40}
              className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-700/80 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-indigo-500 placeholder-zinc-500"
            />
          </div>

          {/* User PIN Notice */}
          <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl flex items-center justify-between">
            <div className="text-[11px] text-zinc-400">
              Your assigned Walkie PIN:
            </div>
            <span className="font-mono font-bold text-sm text-indigo-400">
              #{myPin}
            </span>
          </div>

          {errorMsg && (
            <div className="text-xs text-rose-400 font-medium text-center">
              {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/40 transition-all active:scale-98 cursor-pointer mt-2"
          >
            <span>Start Talking on 11:11</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[10px] text-zinc-500 text-center mt-4">
          You can edit your nickname, age, photo, and banner anytime in Settings.
        </p>
      </div>
    </div>
  );
};
