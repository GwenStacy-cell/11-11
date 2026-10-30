import React, { useState, useEffect } from 'react';
import { Lock, Flashlight, Camera, Radio, Volume2, X, Zap } from 'lucide-react';
import { Friend } from '../types';
import { audioEngine } from '../utils/audioEffects';
import { FUN_VOICE_RESPONSES } from '../data/mockData';
import { LiveWaveform } from './LiveWaveform';

interface LockScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends: Friend[];
  activeFriend: Friend;
  incomingTransmission: {
    senderName: string;
    text: string;
    isPlaying: boolean;
  } | null;
  onTriggerIncoming: (friendName: string, customText?: string) => void;
}

export const LockScreenModal: React.FC<LockScreenModalProps> = ({
  isOpen,
  onClose,
  friends,
  activeFriend,
  incomingTransmission,
  onTriggerIncoming,
}) => {
  const [timeStr, setTimeStr] = useState('11:11');
  const [dateStr, setDateStr] = useState('Friday, October 30');
  const [flashlightOn, setFlashlightOn] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDateStr(d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm h-[720px] max-h-[92vh] bg-gradient-to-b from-slate-900 via-zinc-900 to-black rounded-[44px] border-[6px] border-zinc-700 shadow-2xl overflow-hidden flex flex-col justify-between text-white select-none">
        
        {/* Dynamic Island / Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-20 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-800 mr-2" />
          <div className="w-2 h-2 rounded-full bg-blue-900/40" />
        </div>

        {/* Top Header info / Lock status */}
        <div className="pt-12 px-6 flex flex-col items-center z-10">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium tracking-wide">
            <Lock className="w-3.5 h-3.5 text-zinc-300" />
            <span>PHONE LOCKED</span>
          </div>

          <div className="mt-4 text-6xl font-extralight tracking-tight text-white font-mono">
            {timeStr}
          </div>
          <div className="text-sm font-medium text-zinc-300 mt-1">
            {dateStr}
          </div>

          <div className="mt-4 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-[11px] text-amber-300 flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>11:11 daemon active in background</span>
          </div>
        </div>

        {/* Middle: Incoming Walkie-Talkie Override Banner */}
        <div className="px-5 py-2 flex-1 flex flex-col justify-center">
          {incomingTransmission && incomingTransmission.isPlaying ? (
            <div className="bg-zinc-800/90 border border-rose-500/40 backdrop-blur-xl rounded-2xl p-4 shadow-xl shadow-rose-950/40 animate-shake">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-700/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center font-bold text-xs text-black">
                    11:11
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                      <span>11:11</span>
                      <span className="text-[10px] text-zinc-400 font-normal">· LIVE VOICE OVERRIDE</span>
                    </div>
                    <div className="text-sm font-bold text-white">
                      {incomingTransmission.senderName} is talking loud!
                    </div>
                  </div>
                </div>
                <Volume2 className="w-5 h-5 text-rose-400 animate-pulse" />
              </div>

              <div className="py-3">
                <LiveWaveform isActive={true} color="#f43f5e" isReceiving={true} />
              </div>

              <div className="text-xs text-zinc-200 bg-black/40 rounded-lg p-2.5 italic border border-zinc-700/50">
                "{incomingTransmission.text}"
              </div>
              <div className="mt-2 text-[10px] text-center text-zinc-400">
                ⚠️ Playing through speaker even though screen is locked!
              </div>
            </div>
          ) : (
            <div className="text-center p-4 bg-zinc-800/40 border border-zinc-700/40 rounded-2xl">
              <p className="text-xs text-zinc-400 leading-relaxed">
                This simulates the exact viral scenario: your phone is in your pocket or desk, locked... and suddenly your friend’s voice blasts out through the loudspeaker!
              </p>
              
              <button
                onClick={() => {
                  const friend = activeFriend || friends[0];
                  const quotes = FUN_VOICE_RESPONSES[friend.name] || ["Hey, pick up your phone!"];
                  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                  onTriggerIncoming(friend.name, randomQuote);
                }}
                className="mt-3 w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-rose-900/30"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Simulate Viral Voice Jump-Scare</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Lock screen controls */}
        <div className="pb-8 px-6 flex flex-col items-center gap-4">
          <div className="w-full flex items-center justify-between">
            <button
              onClick={() => {
                setFlashlightOn(!flashlightOn);
                audioEngine.playPokeSound();
              }}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                flashlightOn ? 'bg-white text-zinc-900 shadow-lg shadow-white/30' : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
              }`}
              title="Flashlight"
            >
              <Flashlight className="w-5 h-5" />
            </button>

            <button
              onClick={onClose}
              className="text-xs font-medium text-zinc-300 hover:text-white px-4 py-2 bg-zinc-800/70 hover:bg-zinc-700/80 rounded-full border border-zinc-700 transition-all flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Swipe to Unlock (Exit)</span>
            </button>

            <button
              onClick={() => audioEngine.playPokeSound()}
              className="w-11 h-11 rounded-full bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 flex items-center justify-center transition-colors"
              title="Camera"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>

          <div className="w-32 h-1 bg-zinc-500 rounded-full" />
        </div>
      </div>
    </div>
  );
};
