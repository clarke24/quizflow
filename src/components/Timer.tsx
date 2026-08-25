"use client";

import { useEffect, useState } from "react";

interface TimerProps {
  startedAt: number;
  duration: number;
  pausedMs?: number;
  pauseStartedAt?: number | null;
  paused?: boolean;
  onExpire?: () => void;
}

export function Timer({
  startedAt,
  duration,
  pausedMs = 0,
  pauseStartedAt = null,
  paused = false,
  onExpire,
}: TimerProps) {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    const tick = () => {
      let pausedTotal = pausedMs;
      if (paused && pauseStartedAt) {
        pausedTotal += Date.now() - pauseStartedAt;
      }
      const elapsed = Math.floor((Date.now() - startedAt - pausedTotal) / 1000);
      const left = Math.max(0, duration - elapsed);
      setRemaining(left);
      if (left === 0 && onExpire && !paused) onExpire();
    };

    tick();
    if (paused) return;
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [startedAt, duration, pausedMs, pauseStartedAt, paused, onExpire]);

  const pct = (remaining / duration) * 100;
  const urgent = remaining <= 5 && !paused;

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
            stroke={paused ? "#94a3b8" : urgent ? "#ef4444" : "#6366f1"}
            strokeWidth="3"
            strokeDasharray={`${pct} 100`}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${
            paused ? "text-slate-400" : urgent ? "timer-urgent" : "text-slate-700"
          }`}
        >
          {paused ? "⏸" : remaining}
        </span>
      </div>
    </div>
  );
}
