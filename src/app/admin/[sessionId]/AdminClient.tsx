"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Leaderboard } from "@/components/Leaderboard";
import { QRDisplay } from "@/components/QRDisplay";
import { getTypeMeta } from "@/lib/question-types";
import type { QuestionType } from "@/lib/types";

interface SessionState {
  id: string;
  code: string;
  quizTitle: string;
  quizDescription: string;
  totalQuestions: number;
  phase: string;
  phaseBeforePause?: string | null;
  currentQuestionIndex: number;
  isAdmin?: boolean;
  teams: {
    id: string;
    name: string;
    color: string;
    score: number;
    playerCount: number;
  }[];
  players: { id: string; name: string; teamId: string }[];
  ranks: {
    teamId: string;
    name: string;
    color: string;
    score: number;
    rank: number;
    previousRank: number | null;
    delta: number;
  }[];
  currentQuestion: {
    type: QuestionType;
    text: string;
    number: number;
    points: number;
    timeLimit: number;
    options: { id: string; text: string; imageUrl?: string }[];
  } | null;
  reveal: {
    correctOptionId?: string;
    correctOptionIds?: string[];
    correctText?: string;
    correctNumber?: number;
    responseCount?: number;
  } | null;
}

export default function AdminClient() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const search = useSearchParams();
  const [adminToken, setAdminToken] = useState("");
  const [session, setSession] = useState<SessionState | null>(null);
  const [joinUrl, setJoinUrl] = useState("");
  const [tvUrl, setTvUrl] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fromQuery = search.get("token");
    const fromStorage = localStorage.getItem(`quizflow-admin-${sessionId}`);
    const token = fromQuery || fromStorage || "";
    setAdminToken(token);
    if (token) localStorage.setItem(`quizflow-admin-${sessionId}`, token);
  }, [search, sessionId]);

  const fetchSession = useCallback(async () => {
    if (!adminToken) return;
    const res = await fetch(
      `/api/sessions/${sessionId}?adminToken=${encodeURIComponent(adminToken)}`
    );
    if (!res.ok) return;
    const data = await res.json();
    setSession(data);
    if (!data.isAdmin) {
      setError("Invalid admin link — open the link from quiz launch.");
    }
  }, [sessionId, adminToken]);

  useEffect(() => {
    setJoinUrl(`${window.location.origin}/join/${sessionId}`);
    setTvUrl(`${window.location.origin}/tv/${sessionId}`);
    fetchSession();
    const interval = setInterval(fetchSession, 1500);
    return () => clearInterval(interval);
  }, [sessionId, fetchSession]);

  const doAction = async (action: string) => {
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/sessions/${sessionId}/play`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      setSession((s) => (s ? { ...s, ...data, isAdmin: true } : data));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (!adminToken) {
    return (
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Admin access needed</h1>
          <p className="text-slate-500 mb-4">
            Open this page from the link shown when you launch a quiz session.
          </p>
          <Link href="/library" className="btn-primary">
            Go to quiz library
          </Link>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-slate-400">Loading admin…</p>
      </main>
    );
  }

  const q = session.currentQuestion;
  const paused = session.phase === "paused";

  return (
    <main className="flex-1 px-4 py-6 max-w-3xl mx-auto w-full">
      <div className="mb-6">
        <p className="text-sm text-indigo-600 font-medium">Admin remote</p>
        <h1 className="text-2xl font-bold text-slate-900">{session.quizTitle}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Cast TV to the big screen. Keep this remote on your phone.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <a
          href={tvUrl}
          target="_blank"
          rel="noreferrer"
          className="card p-4 hover:border-indigo-300 transition-colors"
        >
          <p className="font-semibold text-slate-900">📺 Open TV display</p>
          <p className="text-xs text-slate-500 mt-1">
            Crowd view with QR, questions, ranks & emoji rain
          </p>
        </a>
        <div className="card p-4">
          <p className="font-semibold text-slate-900 mb-2">Player join</p>
          {joinUrl && <QRDisplay url={joinUrl} code={session.code} />}
        </div>
      </div>

      <div className="card p-4 mb-6 flex flex-wrap gap-2">
        {session.phase === "lobby" && (
          <button
            onClick={() => doAction("start")}
            disabled={actionLoading || session.players.length === 0}
            className="btn-primary flex-1"
          >
            Start quiz
          </button>
        )}
        {!paused && session.phase !== "lobby" && session.phase !== "finished" && (
          <button
            onClick={() => doAction("pause")}
            disabled={actionLoading}
            className="btn-secondary flex-1"
          >
            ⏸ Pause
          </button>
        )}
        {paused && (
          <button
            onClick={() => doAction("resume")}
            disabled={actionLoading}
            className="btn-primary flex-1"
          >
            ▶ Resume
          </button>
        )}
        {session.phase === "question" && (
          <button
            onClick={() => doAction("reveal")}
            disabled={actionLoading}
            className="btn-primary flex-1"
          >
            Reveal answer
          </button>
        )}
        {(session.phase === "reveal" || session.phase === "question") && (
          <button
            onClick={() => doAction("leaderboard")}
            disabled={actionLoading}
            className="btn-secondary flex-1"
          >
            Show ranks
          </button>
        )}
        {(session.phase === "reveal" || session.phase === "leaderboard") && (
          <button
            onClick={() => doAction("next")}
            disabled={actionLoading}
            className="btn-primary flex-1"
          >
            {session.currentQuestionIndex + 1 >= session.totalQuestions
              ? "Final results"
              : "Next question"}
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="card p-4 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="capitalize text-slate-500">Phase: {session.phase}</span>
          <span className="text-slate-500">{session.players.length} players</span>
        </div>
        {q && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-indigo-600">
                Q{q.number}/{session.totalQuestions}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100">
                {getTypeMeta(q.type).label}
              </span>
            </div>
            <p className="font-medium text-slate-900">{q.text}</p>
          </div>
        )}
        {session.phase === "lobby" && (
          <p className="text-slate-500 text-sm">
            Lobby open — open TV for the crowd QR.
          </p>
        )}
      </div>

      <div className="card p-4">
        <h2 className="font-semibold mb-3">Leaderboard</h2>
        <Leaderboard teams={session.ranks} showDeltas />
      </div>
    </main>
  );
}
