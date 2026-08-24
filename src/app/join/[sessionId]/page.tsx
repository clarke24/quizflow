"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface SessionState {
  id: string;
  code: string;
  quizTitle: string;
  phase: string;
  teams: { id: string; name: string; color: string; score: number; playerCount: number }[];
}

export default function JoinSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [session, setSession] = useState<SessionState | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [mode, setMode] = useState<"pick" | "create">("pick");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSession = useCallback(async () => {
    const res = await fetch(`/api/sessions/${sessionId}`);
    if (!res.ok) return;
    const data = await res.json();
    setSession(data);
    if (data.phase !== "lobby") {
      const stored = localStorage.getItem(`quizflow-player-${sessionId}`);
      if (stored) router.push(`/play/${sessionId}`);
    }
  }, [sessionId, router]);

  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 2000);
    return () => clearInterval(interval);
  }, [fetchSession]);

  const handleCreateTeam = async () => {
    setError("");
    if (!teamName.trim()) {
      setError("Enter a team name.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-team", teamName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSelectedTeamId(data.team.id);
      setMode("pick");
      setTeamName("");
      await fetchSession();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setError("");
    if (!playerName.trim()) {
      setError("Enter your name.");
      return;
    }
    if (!selectedTeamId) {
      setError("Select or create a team.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          playerName,
          teamId: selectedTeamId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem(
        `quizflow-player-${sessionId}`,
        JSON.stringify(data.player)
      );
      router.push(`/play/${sessionId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to join");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-slate-400">Loading session...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full animate-fade-in">
        <div className="text-center mb-8">
          <p className="text-sm font-mono text-indigo-600 tracking-widest mb-2">
            {session.code}
          </p>
          <h1 className="text-2xl font-bold text-slate-900">{session.quizTitle}</h1>
          <p className="text-slate-500 mt-1">Join the quiz</p>
        </div>

        <div className="card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Your Name
            </label>
            <input
              className="input-field"
              placeholder="Enter your display name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Team
            </label>

            {session.teams.length > 0 && mode === "pick" && (
              <div className="space-y-2 mb-3">
                {session.teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                      selectedTeamId === team.id
                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: team.color }}
                    />
                    <span className="flex-1 font-medium">{team.name}</span>
                    <span className="text-xs text-slate-400">
                      {team.playerCount} joined
                    </span>
                  </button>
                ))}
              </div>
            )}

            {mode === "create" ? (
              <div className="flex gap-2">
                <input
                  className="input-field flex-1"
                  placeholder="New team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateTeam()}
                />
                <button
                  onClick={handleCreateTeam}
                  disabled={loading}
                  className="btn-primary shrink-0 px-4"
                >
                  Add
                </button>
                <button
                  onClick={() => setMode("pick")}
                  className="btn-secondary shrink-0 px-3"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setMode("create")}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                + Create new team
              </button>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleJoin}
            disabled={loading}
            className="btn-primary w-full text-lg py-3.5"
          >
            {loading ? "Joining..." : "Join Quiz"}
          </button>
        </div>
      </div>
    </main>
  );
}
