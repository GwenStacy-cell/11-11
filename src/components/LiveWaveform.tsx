import React from 'react';

interface LiveWaveformProps {
  isActive: boolean;
  color?: string;
  isReceiving?: boolean;
}

export const LiveWaveform: React.FC<LiveWaveformProps> = ({
  isActive,
  color = '#22c55e',
  isReceiving = false,
}) => {
  // Generate 24 animated bars
  const bars = [18, 42, 65, 88, 55, 30, 75, 95, 80, 60, 40, 85, 100, 70, 50, 90, 65, 45, 80, 55, 35, 60, 40, 20];

  return (
    <div className="flex items-center justify-center gap-[3px] h-12 w-full px-4 overflow-hidden">
      {bars.map((height, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full transition-all duration-150"
          style={{
            height: isActive ? `${Math.max(12, (height * (0.4 + Math.random() * 0.6)))}%` : '6px',
            backgroundColor: isActive ? color : '#334155',
            opacity: isActive ? 0.9 : 0.3,
            transform: isActive && isReceiving ? `scaleY(${0.8 + Math.sin(i + Date.now() / 200) * 0.3})` : 'none',
          }}
        />
      ))}
    </div>
  );
};
