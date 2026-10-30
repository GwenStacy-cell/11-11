import React from 'react';
import { X, Radio, Siren, Bell, Sun, Volume2, ShieldAlert } from 'lucide-react';
import { audioEngine } from '../utils/audioEffects';

interface SoundboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcastSound: (name: string, soundType: 'siren' | 'roger' | 'alert' | 'wakeup') => void;
  activeFriendName: string;
}

export const SoundboardModal: React.FC<SoundboardModalProps> = ({
  isOpen,
  onClose,
  onBroadcastSound,
  activeFriendName,
}) => {
  if (!isOpen) return null;

  const sounds = [
    {
      id: 'roger',
      name: '10-4 Roger Beep',
      type: 'roger' as const,
      desc: 'Authentic dual-frequency radio chime with squelch tail',
      icon: Radio,
      color: 'from-blue-600 to-indigo-600',
    },
    {
      id: 'siren',
      name: 'Code Red Siren',
      type: 'siren' as const,
      desc: 'Dual pitch emergency alarm tone',
      icon: Siren,
      color: 'from-rose-600 to-red-700',
    },
    {
      id: 'alert',
      name: 'Triple Ping Alert',
      type: 'alert' as const,
      desc: 'Rapid high-pitch attention alert for sleepovers',
      icon: Bell,
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 'wakeup',
      name: 'Wake-Up Stinger',
      type: 'wakeup' as const,
      desc: 'Ascending square-wave chime to wake up friends',
      icon: Sun,
      color: 'from-emerald-600 to-teal-700',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-3xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Walkie Soundboard</h2>
              <p className="text-xs text-zinc-400">Blast instant audio drops to {activeFriendName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Caution banner */}
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2.5 text-xs text-amber-300">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Careful! On ten ten, these play out loud on friends' speakers even when muted!</span>
        </div>

        {/* Sound buttons grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sounds.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => {
                  audioEngine.playSoundboard(s.type);
                  onBroadcastSound(s.name, s.type);
                }}
                className="group p-4 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 hover:border-zinc-500 rounded-2xl text-left transition-all active:scale-95 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${s.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-300">
                    Blast 🔊
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                    {s.name}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5 line-clamp-2">
                    {s.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
