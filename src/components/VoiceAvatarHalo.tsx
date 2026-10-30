import React, { useEffect, useState } from 'react';
import { Mic, Volume2 } from 'lucide-react';
import { Friend, AppTheme } from '../types';

interface VoiceAvatarHaloProps {
  friend: Friend;
  isTransmitting: boolean;
  isReceiving: boolean;
  isLockedOnAir: boolean;
  theme: AppTheme;
  volume?: number;
}

export const VoiceAvatarHalo: React.FC<VoiceAvatarHaloProps> = ({
  isTransmitting,
  isReceiving,
  isLockedOnAir,
  theme,
  volume = 0.85,
}) => {
  const isActive = isTransmitting || isReceiving || isLockedOnAir;
  
  // Real-time audio frequency volume level simulation
  const [liveVolumeLevel, setLiveVolumeLevel] = useState<number>(0.5);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const baseLevel = 0.35 + Math.random() * 0.65;
      const scaledLevel = baseLevel * Math.max(0.3, volume);
      setLiveVolumeLevel(scaledLevel);
    }, 60);

    return () => clearInterval(interval);
  }, [isActive, volume]);

  if (!isActive) return null;

  const accentColor = isTransmitting ? theme.primary : '#f59e0b';

  return (
    <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center animate-in fade-in duration-200">
      <div className="relative flex items-center justify-center">
        
        {/* Simple Soundwave Wave 3 (Outer) */}
        <div
          className="absolute w-[156px] h-[156px] rounded-full border transition-all duration-100 ease-out"
          style={{
            borderColor: accentColor,
            transform: `scale(${1 + liveVolumeLevel * 0.22})`,
            opacity: 0.25 + liveVolumeLevel * 0.25,
            boxShadow: `0 0 ${12 + liveVolumeLevel * 18}px ${accentColor}55`,
          }}
        />

        {/* Simple Soundwave Wave 2 (Middle) */}
        <div
          className="absolute w-[138px] h-[138px] rounded-full border-2 transition-all duration-100 ease-out"
          style={{
            borderColor: accentColor,
            transform: `scale(${1 + liveVolumeLevel * 0.14})`,
            opacity: 0.45 + liveVolumeLevel * 0.3,
            boxShadow: `0 0 ${10 + liveVolumeLevel * 14}px ${accentColor}88`,
          }}
        />

        {/* Simple Soundwave Wave 1 (Inner tight ring around button) */}
        <div
          className="absolute w-[120px] h-[120px] rounded-full border-2 transition-all duration-100 ease-out"
          style={{
            borderColor: accentColor,
            transform: `scale(${1 + liveVolumeLevel * 0.06})`,
            opacity: 0.8 + liveVolumeLevel * 0.2,
            boxShadow: `0 0 ${12 + liveVolumeLevel * 20}px ${accentColor}`,
          }}
        />
      </div>
    </div>
  );
};
