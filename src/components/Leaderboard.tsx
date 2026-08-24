"use client";

interface LeaderboardProps {
  teams: {
    id: string;
    name: string;
    color: string;
    score: number;
    playerCount?: number;
  }[];
  compact?: boolean;
}

export function Leaderboard({ teams, compact }: LeaderboardProps) {
  const sorted = [...teams].sort((a, b) => b.score - a.score);

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-4">No teams yet</p>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((team, index) => (
        <div
          key={team.id}
          className={`flex items-center gap-3 rounded-xl transition-colors ${
            compact ? "px-3 py-2" : "px-4 py-3 card"
          } ${index === 0 && team.score > 0 ? "ring-2 ring-amber-200 bg-amber-50/50" : ""}`}
        >
          <span className="text-sm font-bold text-slate-400 w-5">
            {index + 1}
          </span>
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: team.color }}
          />
          <span className="flex-1 font-medium text-slate-800 truncate">
            {team.name}
          </span>
          {!compact && team.playerCount !== undefined && (
            <span className="text-xs text-slate-400">
              {team.playerCount} {team.playerCount === 1 ? "player" : "players"}
            </span>
          )}
          <span className="font-bold text-indigo-600 tabular-nums">
            {team.score}
          </span>
        </div>
      ))}
    </div>
  );
}
