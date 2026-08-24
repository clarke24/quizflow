"use client";

import { useEffect, useState } from "react";

interface TimerProps {
  startedAt: number;
  duration: number;
  onExpire?: () => void;
}

export function Timer({ startedAt, duration, onExpire }: TimerProps) {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(0, duration - elapsed);
      setRemaining(left);
      if (left === 0 && onExpire) onExpire();
    };

    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [startedAt, duration, onExpire]);

  const pct = (remaining / duration) * 100;
  const urgent = remaining <= 5;

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="3"
          />
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke={urgent ? "#ef4444" : "#6366f1"}
            strokeWidth="3"
            strokeDasharray={`${pct} 100`}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${
            urgent ? "timer-urgent" : "text-slate-700"
          }`}
        >
          {remaining}
        </span>
      </div>
    </div>
  );
}
