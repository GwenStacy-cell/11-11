import React from 'react';
import { X, Smartphone, ArrowDown, Volume2, ShieldCheck, Share, PlusSquare, Zap } from 'lucide-react';
import { audioEngine } from '../utils/audioEffects';

interface AddLockScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerTestAudio?: () => void;
  onInstallPwa?: () => void;
  isInstallable?: boolean;
}

export const AddLockScreenModal: React.FC<AddLockScreenModalProps> = ({
  isOpen,
  onClose,
  onTriggerTestAudio,
  onInstallPwa,
  isInstallable,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Add as Lock Screen App</h2>
              <p className="text-xs text-zinc-400">Lock screen & home screen walkie setup</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Install Button if browser supports it */}
        {isInstallable && onInstallPwa && (
          <div className="mt-4 p-4 bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">Direct Install Ready</div>
              <div className="text-[10px] text-zinc-400">Install 11:11 directly to your phone</div>
            </div>
            <button
              onClick={() => {
                onInstallPwa();
                onClose();
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-transform active:scale-95 shadow"
            >
              Install App
            </button>
          </div>
        )}

        {/* Operating System Tabs / Guides */}
        <div className="mt-4 space-y-4">
          
          {/* iOS Safari Guide */}
          <div className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-white mb-2.5">
              <span className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-[11px]">🍎</span>
              <span>iPhone / iPad (iOS Safari)</span>
            </div>

            <ol className="space-y-2 text-xs text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400">1.</span>
                <span>Open this link in <strong>Safari</strong> and tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline text-amber-400" /> at bottom.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400">2.</span>
                <span>Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline text-emerald-400" />.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400">3.</span>
                <span>Tap <strong>Add</strong> in the top right.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400">4.</span>
                <span>Open from your home screen — audio will play continuously and show on your lock screen media widget!</span>
              </li>
            </ol>
          </div>

          {/* Android Chrome Guide */}
          <div className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-white mb-2.5">
              <span className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-[11px]">🤖</span>
              <span>Android (Chrome / Samsung)</span>
            </div>

            <ol className="space-y-2 text-xs text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400">1.</span>
                <span>Tap the browser menu (<strong>⋮</strong> three dots) in the top right corner.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400">2.</span>
                <span>Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400">3.</span>
                <span>Incoming walkie transmissions will play over speakerphone even when phone is locked!</span>
              </li>
            </ol>
          </div>

          {/* Test Audio Section */}
          <div className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-2xl">
            <div className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-rose-400" />
              <span>Test Lock Screen Audio Blast</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
              Press below to test the loud speakerphone audio playback and verify lock screen media player activation.
            </p>
            <button
              onClick={() => {
                audioEngine.playRogerBeep();
                onTriggerTestAudio?.();
              }}
              className="w-full py-2.5 px-3 bg-zinc-800 hover:bg-zinc-750 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 border border-zinc-700"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Test Walkie Audio Signal</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
