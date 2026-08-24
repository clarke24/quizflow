"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Leaderboard } from "@/components/Leaderboard";
import { QRDisplay } from "@/components/QRDisplay";

interface SessionState {
  id: string;
  code: string;
  quizTitle: string;
  quizDescription: string;
  totalQuestions: number;
  phase: string;
  currentQuestionIndex: number;
  teams: { id: string; name: string; color: string; score: number; playerCount: number }[];
  players: { id: string; name: string; teamId: string }[];
  currentQuestion: {
    text: string;
    number: number;
    points: number;
    timeLimit: number;
    options: { id: string; text: string }[];
  } | null;
  reveal: {
    correctOptionId: string;
    optionStats: { id: string; count: number }[];
  } | null;
}

export default function HostPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<SessionState | null>(null);
  const [joinUrl, setJoinUrl] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSession = useCallback(async () => {
    const res = await fetch(`/api/sessions/${sessionId}`);
    if (!res.ok) return;
    setSession(await res.json());
  }, [sessionId]);

  useEffect(() => {
    setJoinUrl(`${window.location.origin}/join/${sessionId}`);
    fetchSession();
    const interval = setInterval(fetchSession, 1500);
    return () => clearInterval(interval);
  }, [sessionId, fetchSession]);

  const doAction = async (action: string) => {
    setActionLoading(true);
    try {
      await fetch(`/api/sessions/${sessionId}/play`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await fetchSession();
    } finally {
      setActionLoading(false);
    }
  };

  if (!session) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-sm text-indigo-600 font-medium">Host Dashboard</p>
          <h1 className="text-3xl font-bold text-slate-900">{session.quizTitle}</h1>
          {session.quizDescription && (
            <p className="text-slate-500 mt-1">{session.quizDescription}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">
            {session.players.length} players · {session.totalQuestions} questions
          </p>
          <p className="text-xs text-slate-400 mt-1 capitalize">{session.phase}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: QR + Players */}
        <div className="space-y-6">
          {session.phase === "lobby" && joinUrl && (
            <div className="card p-6">
              <h2 className="font-semibold text-slate-900 mb-4 text-center">
                Scan to Join
              </h2>
              <QRDisplay url={joinUrl} code={session.code} />
            </div>
          )}

          <div className="card p-6">
            <h2 className="font-semibold text-slate-900 mb-3">
              Players ({session.players.length})
            </h2>
            {session.players.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                Waiting for players to join...
              </p>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {session.players.map((p) => {
                  const team = session.teams.find((t) => t.id === p.teamId);
                  return (
                    <div key={p.id} className="flex items-center gap-2 text-sm px-2 py-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: team?.color || "#ccc" }}
                      />
                      <span className="font-medium text-slate-800">{p.name}</span>
                      <span className="text-slate-400 ml-auto text-xs">{team?.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-slate-900 mb-3">Leaderboard</h2>
            <Leaderboard teams={session.teams} compact />
          </div>
        </div>

        {/* Center: Question / Controls */}
        <div className="lg:col-span-2 space-y-6">
          {session.phase === "lobby" && (
            <div className="card p-10 text-center animate-fade-in">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready to Start</h2>
              <p className="text-slate-500 mb-8">
                Share the QR code and wait for players to join their teams.
              </p>
              <button
                onClick={() => doAction("start")}
                disabled={actionLoading || session.players.length === 0}
                className="btn-primary text-lg px-10 py-4"
              >
                Start Quiz
              </button>
              {session.players.length === 0 && (
                <p className="text-sm text-slate-400 mt-3">Need at least 1 player</p>
              )}
            </div>
          )}

          {(session.phase === "question" || session.phase === "reveal") &&
            session.currentQuestion && (
              <div className="card p-8 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-semibold text-indigo-600">
                    Question {session.currentQuestion.number} of {session.totalQuestions}
                  </span>
                  <span className="text-sm text-slate-500">
                    {session.currentQuestion.points} pts · {session.currentQuestion.timeLimit}s
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-8 leading-snug">
                  {session.currentQuestion.text}
                </h2>

                <div className="grid sm:grid-cols-2 gap-3 mb-8">
                  {session.currentQuestion.options.map((opt, i) => {
                    const isCorrect =
                      session.phase === "reveal" &&
                      session.reveal?.correctOptionId === opt.id;
                    const stats = session.reveal?.optionStats.find(
                      (s) => s.id === opt.id
                    );
                    return (
                      <div
                        key={opt.id}
                        className={`px-5 py-4 rounded-xl border text-left transition-all ${
                          isCorrect
                            ? "border-green-400 bg-green-50 ring-2 ring-green-200"
                            : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-400 mr-2">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="font-medium text-slate-800">{opt.text}</span>
                        {session.phase === "reveal" && stats && (
                          <span className="float-right text-sm text-slate-500">
                            {stats.count} votes
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3 justify-center">
                  {session.phase === "question" && (
                    <button
                      onClick={() => doAction("reveal")}
                      disabled={actionLoading}
                      className="btn-primary px-8"
                    >
                      Reveal Answer
                    </button>
                  )}
                  {session.phase === "reveal" && (
                    <button
                      onClick={() => doAction("next")}
                      disabled={actionLoading}
                      className="btn-primary px-8"
                    >
                      {session.currentQuestionIndex + 1 >= session.totalQuestions
                        ? "Show Final Results"
                        : "Next Question"}
                    </button>
                  )}
                </div>
              </div>
            )}

          {session.phase === "finished" && (
            <div className="card p-10 text-center animate-fade-in">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Quiz Complete!</h2>
              <div className="max-w-sm mx-auto">
                <Leaderboard teams={session.teams} />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
