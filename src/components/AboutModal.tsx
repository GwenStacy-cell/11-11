import React from 'react';
import { X, Radio, Volume2, ShieldCheck, Hash, Sparkles } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center font-black text-sm text-black">
              11:11
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">About 11:11 Walkie</h2>
              <p className="text-xs text-zinc-400">Inspired by the viral ten ten live audio phenomenon</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4 text-xs text-zinc-300 leading-relaxed">
          <div className="p-3.5 bg-zinc-800/60 rounded-2xl border border-zinc-700/50">
            <div className="flex items-center gap-2 font-semibold text-amber-400 text-sm mb-1.5">
              <Radio className="w-4 h-4" />
              <span>What is ten ten?</span>
            </div>
            <p>
              <strong>ten ten</strong> is a French social audio app launched in 2024 that skyrocketed to the top of App Store and Google Play charts across Europe, North America, and globally. It transforms smartphones into instantaneous <strong>live walkie-talkies</strong> for close friends.
            </p>
          </div>

          <div className="p-3.5 bg-zinc-800/60 rounded-2xl border border-zinc-700/50">
            <div className="flex items-center gap-2 font-semibold text-rose-400 text-sm mb-1.5">
              <Volume2 className="w-4 h-4" />
              <span>The Viral TikTok Phenomenon</span>
            </div>
            <p>
              Unlike WhatsApp or iMessage voice notes where you record and send an audio file, ten ten transmits <strong>live voice in real-time</strong>. Most notably, incoming audio plays <strong>out loud through your phone's speaker even when the screen is locked or in your pocket</strong>.
            </p>
            <p className="mt-1.5 text-zinc-400">
              This sparked millions of TikTok videos showing teens startled by friends screaming through their locked phones in quiet classrooms, libraries, or while sleeping!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-800/40 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-1.5 font-semibold text-blue-400 mb-1">
                <Hash className="w-3.5 h-3.5" />
                <span>Friend PIN System</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                No public feeds or algorithm. You add people strictly through private alphanumeric PIN codes (like <code>8492</code>), keeping conversations intimate.
              </p>
            </div>

            <div className="p-3 bg-zinc-800/40 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Safety & DND</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                To prevent getting suspended in school, ten ten offers a quick "Silent / Do Not Disturb" mode to silence incoming voice blasts.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-gradient-to-r from-amber-500/10 to-rose-500/10 rounded-2xl border border-amber-500/20">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300 text-sm mb-1">
              <Sparkles className="w-4 h-4" />
              <span>How this Web App Works</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-zinc-300 text-[11px]">
              <li><strong>Hold PTT Button</strong>: Uses Web Audio & mic (or simulated radio banter) with authentic squelch/roger beeps.</li>
              <li><strong>Multi-Tab Walkie</strong>: Open this app in two browser tabs side-by-side to talk between them via <code>BroadcastChannel</code>!</li>
              <li><strong>Lock Screen Simulator</strong>: Click "Lock Screen" to test what the viral audio override looks and sounds like.</li>
              <li><strong>Pokes & Soundboard</strong>: Send instant nudges and radio drops to your friend circle.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white text-zinc-900 font-semibold rounded-xl text-xs hover:bg-zinc-200 transition-colors"
          >
            Got it, let's talk!
          </button>
        </div>
      </div>
    </div>
  );
};
