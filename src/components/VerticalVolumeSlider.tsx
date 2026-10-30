import React, { useRef, useState } from 'react';
import { Volume2, Volume1, VolumeX, Volume } from 'lucide-react';
import { audioEngine } from '../utils/audioEffects';

interface VerticalVolumeSliderProps {
  volume: number; // 0 to 1
  onChangeVolume: (vol: number) => void;
  themeGradient?: string;
  themeColor?: string;
}

export const VerticalVolumeSlider: React.FC<VerticalVolumeSliderProps> = ({
  volume,
  onChangeVolume,
  themeGradient,
  themeColor = '#f59e0b',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const calculateVolumeFromPointer = (clientY: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const height = rect.height;
    // Bottom is 0, Top is 1
    const offsetY = rect.bottom - clientY;
    const clamped = Math.max(0, Math.min(1, offsetY / height));
    // round to 2 decimals
    const rounded = Math.round(clamped * 100) / 100;
    onChangeVolume(rounded);
    audioEngine.setIncomingVolume(rounded);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setIsDragging(true);
    calculateVolumeFromPointer(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      calculateVolumeFromPointer(e.clientY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      setIsDragging(false);
    }
  };

  const toggleMute = () => {
    if (volume > 0) {
      onChangeVolume(0);
      audioEngine.setIncomingVolume(0);
    } else {
      onChangeVolume(0.8);
      audioEngine.setIncomingVolume(0.8);
      audioEngine.playPokeSound();
    }
  };

  const percentage = Math.round(volume * 100);

  return (
    <div className="flex flex-col items-center select-none py-1 px-1">
      {/* Top Value Label */}
      <div className="text-[10px] font-mono font-bold tabular-nums text-zinc-300 mb-1.5 flex flex-col items-center">
        <span
          className={volume === 0 ? 'text-rose-400 font-extrabold' : 'font-extrabold'}
          style={{ color: volume === 0 ? undefined : themeColor }}
        >
          {volume === 0 ? 'MUTE' : `${percentage}%`}
        </span>
        <span className="text-[8px] text-zinc-500 uppercase tracking-tighter">GAIN</span>
      </div>

      {/* Vertical Slider Track Container */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => setIsDragging(false)}
        className="relative w-8 h-36 bg-zinc-900 border-2 border-zinc-700 rounded-full flex flex-col justify-end p-1 cursor-pointer touch-none shadow-inner group hover:border-zinc-500 transition-colors"
        title="Incoming Broadcast Gain Slider (Web Audio API)"
      >
        {/* dB Tick Marks */}
        <div className="absolute inset-y-3 right-1 flex flex-col justify-between pointer-events-none opacity-40">
          <span className="w-1.5 h-[1.5px] bg-zinc-400" />
          <span className="w-1 h-[1px] bg-zinc-500" />
          <span className="w-1.5 h-[1.5px] bg-zinc-400" />
          <span className="w-1 h-[1px] bg-zinc-500" />
          <span className="w-1.5 h-[1.5px] bg-zinc-400" />
        </div>

        {/* Filled Track with gradient */}
        <div
          className={`w-full rounded-full transition-all duration-75 ${
            volume === 0 ? 'bg-zinc-700' : ''
          }`}
          style={{
            height: `${Math.max(6, volume * 100)}%`,
            background: volume === 0 ? undefined : (themeGradient || 'linear-gradient(to top, #10b981 0%, #f59e0b 60%, #f43f5e 100%)'),
            boxShadow: volume > 0 ? `0 0 12px ${themeColor}55` : undefined,
          }}
        />

        {/* Fader Handle / Knob */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-7 h-5 rounded-lg bg-zinc-200 border border-white/60 shadow-lg flex items-center justify-center transition-all duration-75 pointer-events-none"
          style={{ bottom: `calc(${volume * 88}% + 4px)` }}
        >
          <div className="w-3.5 h-0.5 bg-zinc-800 rounded-full" />
        </div>
      </div>

      {/* Bottom Mute / Speaker Trigger */}
      <button
        onClick={toggleMute}
        className={`mt-2 p-1.5 rounded-full transition-all ${
          volume === 0
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            : 'bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-700'
        }`}
        title={volume === 0 ? 'Unmute' : 'Mute Incoming Voice'}
      >
        {volume === 0 ? (
          <VolumeX className="w-3.5 h-3.5" />
        ) : volume < 0.4 ? (
          <Volume className="w-3.5 h-3.5" />
        ) : volume < 0.8 ? (
          <Volume1 className="w-3.5 h-3.5" />
        ) : (
          <Volume2 className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
};
