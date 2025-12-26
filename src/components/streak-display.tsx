'use client';

import { useEffect, useState } from 'react';

export type StreakDisplayProps = {
  streakCount: number;
  timeRemaining: number;
  maxStreak?: number;
};

export function StreakDisplay({ streakCount, timeRemaining, maxStreak = 30 }: StreakDisplayProps) {
  const [shouldBlink, setShouldBlink] = useState(false);
  const isDangerZone = timeRemaining < 4 * 60 * 60; // 4 hours

  useEffect(() => {
    if (!isDangerZone) {
      setShouldBlink(false);
      return;
    }

    const interval = setInterval(() => {
      setShouldBlink((prev) => !prev);
    }, 1000);

    return () => clearInterval(interval);
  }, [isDangerZone]);

  const blocks = Array.from({ length: 7 }, (_, i) => {
    const blockNumber = i + 1;
    const isFilled = blockNumber <= (streakCount % 7 || (streakCount > 0 ? 7 : 0));
    const isMilestone = blockNumber === 7 && isFilled;

    return (
      <div
        key={blockNumber}
        className={`h-8 w-8 border-2 border-black transition-none ${
          isMilestone
            ? 'bg-[#0052FF]'
            : isFilled
            ? 'bg-black'
            : 'bg-white'
        } ${shouldBlink && isDangerZone ? 'opacity-0' : 'opacity-100'}`}
      />
    );
  });

  const formatTimeRemaining = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="font-mono text-2xl uppercase">Streak</div>
        <div className="font-mono text-4xl">{streakCount}</div>
      </div>
      
      <div className="flex gap-2">{blocks}</div>

      {timeRemaining > 0 && (
        <div className={`font-mono text-sm ${isDangerZone ? 'text-red-600' : 'text-black'}`}>
          {isDangerZone ? 'DANGER ZONE: ' : 'Next Pulse: '}
          {formatTimeRemaining(timeRemaining)}
        </div>
      )}

      <div className="font-mono text-xs opacity-60">
        {Math.floor(streakCount / 7)} WEEKS • MAX {maxStreak}
      </div>
    </div>
  );
}
