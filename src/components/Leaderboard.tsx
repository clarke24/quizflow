"use client";

export interface RankRow {
  teamId?: string;
  id?: string;
  name: string;
  color: string;
  score: number;
  playerCount?: number;
  rank?: number;
  previousRank?: number | null;
  delta?: number;
}

interface LeaderboardProps {
  teams: RankRow[];
  compact?: boolean;
  showDeltas?: boolean;
  large?: boolean;
}

export function Leaderboard({
  teams,
  compact,
  showDeltas,
  large,
}: LeaderboardProps) {
  const sorted = [...teams].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank;
    return b.score - a.score;
  });

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-4">No teams yet</p>
    );
  }

  return (
    <div className={`space-y-2 ${large ? "space-y-3" : ""}`}>
      {sorted.map((team, index) => {
        const rank = team.rank ?? index + 1;
        const delta = team.delta ?? 0;
        const id = team.teamId || team.id || String(index);
        return (
          <div
            key={id}
            className={`flex items-center gap-3 rounded-xl transition-all ${
              large ? "px-5 py-4 text-lg" : compact ? "px-3 py-2" : "px-4 py-3 card"
            } ${
              rank === 1 && team.score > 0
                ? "ring-2 ring-amber-200 bg-amber-50/50"
                : large
                  ? "bg-white/10 border border-white/10"
                  : ""
            }`}
          >
            <span
              className={`font-bold text-slate-400 tabular-nums ${
                large ? "w-8 text-xl" : "w-5 text-sm"
              }`}
            >
              {rank}
            </span>
            <span
              className={`rounded-full shrink-0 ${large ? "w-4 h-4" : "w-3 h-3"}`}
              style={{ backgroundColor: team.color }}
            />
            <span
              className={`flex-1 font-medium truncate ${
                large ? "text-white text-xl" : "text-slate-800"
              }`}
            >
              {team.name}
            </span>
            {showDeltas && delta !== 0 && (
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  delta > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {delta > 0 ? `↑${delta}` : `↓${Math.abs(delta)}`}
              </span>
            )}
            {showDeltas && delta === 0 && team.previousRank != null && (
              <span className="text-xs text-slate-400 px-1">—</span>
            )}
            {!compact && team.playerCount !== undefined && !large && (
              <span className="text-xs text-slate-400">
                {team.playerCount}{" "}
                {team.playerCount === 1 ? "player" : "players"}
              </span>
            )}
            <span
              className={`font-bold tabular-nums ${
                large ? "text-amber-300 text-xl" : "text-indigo-600"
              }`}
            >
              {team.score}
            </span>
          </div>
        );
      })}
    </div>
  );
}
