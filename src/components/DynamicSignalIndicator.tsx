import React from 'react';
import { Radio } from 'lucide-react';

interface DynamicSignalIndicatorProps {
  isTransmitting: boolean;
  isReceiving: boolean;
  isLockedOnAir: boolean;
}

export const DynamicSignalIndicator: React.FC<DynamicSignalIndicatorProps> = ({
  isTransmitting,
  isReceiving,
  isLockedOnAir,
}) => {
  const activeTx = isTransmitting || isLockedOnAir;
  const activeRx = isReceiving;

  // Bar heights in pixels: 4 stepped tiers
  const barHeights = ['h-1.5', 'h-2.5', 'h-3.5', 'h-4'];

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-[10px] font-mono select-none"
      title={
        activeTx
          ? 'Transmitting RF Carrier (High Power)'
          : activeRx
          ? 'Receiving RF Modulation from Friend'
          : 'RF Signal Strong (Standby)'
      }
    >
      {/* 4 Tiered Dynamic Signal Bars */}
      <div className="flex items-end gap-[2px] h-4">
        {barHeights.map((heightClass, index) => {
          let animClass = 'animate-signal-idle';
          let bgClass = 'bg-emerald-400 shadow-sm shadow-emerald-500/50';

          if (activeTx) {
            animClass = 'animate-signal-tx';
            bgClass = 'bg-rose-500 shadow-sm shadow-rose-500/80';
          } else if (activeRx) {
            animClass = 'animate-signal-rx';
            bgClass = 'bg-amber-400 shadow-sm shadow-amber-500/80';
          }

          return (
            <div
              key={index}
              className={`w-[3px] rounded-full origin-bottom transition-all duration-150 ${heightClass} ${bgClass} ${animClass}`}
              style={{
                animationDelay: activeTx
                  ? `${index * 75}ms`
                  : activeRx
                  ? `${index * 110}ms`
                  : `${index * 200}ms`,
              }}
            />
          );
        })}
      </div>

      {/* Dynamic Status Text */}
      <span
        className={`font-bold tracking-tight text-[9px] tabular-nums transition-colors ${
          activeTx
            ? 'text-rose-400 font-extrabold animate-pulse'
            : activeRx
            ? 'text-amber-400 font-extrabold'
            : 'text-emerald-400'
        }`}
      >
        {activeTx ? 'TX' : activeRx ? 'RX' : 'RF'}
      </span>
    </div>
  );
};
