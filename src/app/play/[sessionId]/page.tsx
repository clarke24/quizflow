"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Leaderboard } from "@/components/Leaderboard";
import { Timer } from "@/components/Timer";

interface PlayerInfo {
  id: string;
  name: string;
  teamId: string;
}

interface SessionState {
  id: string;
  code: string;
  quizTitle: string;
  totalQuestions: number;
  phase: string;
  currentQuestionIndex: number;
  questionStartedAt: number | null;
  teams: { id: string; name: string; color: string; score: number }[];
  currentQuestion: {
    id: string;
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
  myAnswer: { optionId: string; correct: boolean; points: number } | null;
}

const OPTION_COLORS = [
  "hover:border-red-300 hover:bg-red-50",
  "hover:border-blue-300 hover:bg-blue-50",
  "hover:border-amber-300 hover:bg-amber-50",
  "hover:border-green-300 hover:bg-green-50",
  "hover:border-purple-300 hover:bg-purple-50",
  "hover:border-pink-300 hover:bg-pink-50",
];

const OPTION_SELECTED = [
  "border-red-400 bg-red-50 ring-2 ring-red-200",
  "border-blue-400 bg-blue-50 ring-2 ring-blue-200",
  "border-amber-400 bg-amber-50 ring-2 ring-amber-200",
  "border-green-400 bg-green-50 ring-2 ring-green-200",
  "border-purple-400 bg-purple-50 ring-2 ring-purple-200",
  "border-pink-400 bg-pink-50 ring-2 ring-pink-200",
];

export default function PlayPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [player, setPlayer] = useState<PlayerInfo | null>(null);
  const [session, setSession] = useState<SessionState | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchState = useCallback(async (playerId: string) => {
    const res = await fetch(
      `/api/sessions/${sessionId}/play?playerId=${playerId}`
    );
    if (!res.ok) return;
    setSession(await res.json());
  }, [sessionId]);

  useEffect(() => {
    const stored = localStorage.getItem(`quizflow-player-${sessionId}`);
    if (!stored) return;
    const p = JSON.parse(stored) as PlayerInfo;
    setPlayer(p);
    fetchState(p.id);
    const interval = setInterval(() => fetchState(p.id), 1000);
    return () => clearInterval(interval);
  }, [sessionId, fetchState]);

  const submitAnswer = async (optionId: string) => {
    if (!player || submitting || session?.myAnswer) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/play`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "answer",
          playerId: player.id,
          optionId,
        }),
      });
      if (res.ok) setSession(await res.json());
    } finally {
      setSubmitting(false);
    }
  };

  if (!player) {
    return (
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-slate-500 mb-4">You haven&apos;t joined this session yet.</p>
          <a href={`/join/${sessionId}`} className="btn-primary">
            Join Now
          </a>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-slate-400">Connecting...</p>
      </main>
    );
  }

  const myTeam = session.teams.find((t) => t.id === player.teamId);

  return (
    <main className="flex-1 flex flex-col min-h-0">
      {/* Top bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: myTeam?.color || "#6366f1" }}
          />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">{player.name}</p>
            <p className="text-xs text-slate-400 truncate">{myTeam?.name}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-slate-400">{session.quizTitle}</p>
          <p className="font-bold text-indigo-600 tabular-nums">
            {myTeam?.score ?? 0} pts
          </p>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {session.phase === "lobby" && (
          <div className="text-center animate-fade-in max-w-sm">
            <div className="text-5xl mb-4">⏳</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Waiting to start</h2>
            <p className="text-slate-500">
              The host will begin the quiz soon. Get ready!
            </p>
          </div>
        )}

        {(session.phase === "question" || session.phase === "reveal") &&
          session.currentQuestion && (
            <div className="w-full max-w-2xl animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-slate-500">
                  {session.currentQuestion.number} / {session.totalQuestions}
                </span>
                {session.phase === "question" &&
                  session.questionStartedAt &&
                  !session.myAnswer && (
                    <Timer
                      startedAt={session.questionStartedAt}
                      duration={session.currentQuestion.timeLimit}
                    />
                  )}
                {session.myAnswer && session.phase === "question" && (
                  <span className="text-sm font-medium text-green-600">
                    Answer locked in ✓
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 text-center leading-snug">
                {session.currentQuestion.text}
              </h2>

              <div className="grid sm:grid-cols-2 gap-3">
                {session.currentQuestion.options.map((opt, i) => {
                  const isSelected = session.myAnswer?.optionId === opt.id;
                  const isCorrect =
                    session.phase === "reveal" &&
                    session.reveal?.correctOptionId === opt.id;
                  const isWrong =
                    session.phase === "reveal" &&
                    isSelected &&
                    !session.myAnswer?.correct;
                  const disabled =
                    session.phase !== "question" ||
                    !!session.myAnswer ||
                    submitting;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => submitAnswer(opt.id)}
                      disabled={disabled}
                      className={`px-5 py-5 rounded-2xl border-2 text-left transition-all font-medium text-slate-800 ${
                        isCorrect
                          ? "border-green-400 bg-green-50 ring-2 ring-green-200"
                          : isWrong
                            ? "border-red-400 bg-red-50 ring-2 ring-red-200"
                            : isSelected
                              ? OPTION_SELECTED[i % OPTION_SELECTED.length]
                              : `border-slate-200 bg-white ${OPTION_COLORS[i % OPTION_COLORS.length]}`
                      } ${disabled && !isSelected && !isCorrect ? "opacity-60" : ""}`}
                    >
                      <span className="text-xs font-bold text-slate-400 block mb-1">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt.text}
                    </button>
                  );
                })}
              </div>

              {session.phase === "reveal" && session.myAnswer && (
                <div
                  className={`mt-6 text-center py-4 rounded-xl font-semibold ${
                    session.myAnswer.correct
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {session.myAnswer.correct
                    ? `Correct! +${session.myAnswer.points} points`
                    : "Not quite — better luck next time!"}
                </div>
              )}

              {session.phase === "question" && session.myAnswer && (
                <p className="text-center text-sm text-slate-400 mt-6">
                  Waiting for the host to reveal the answer...
                </p>
              )}
            </div>
          )}

        {session.phase === "finished" && (
          <div className="w-full max-w-md text-center animate-fade-in">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Quiz Over!</h2>
            <p className="text-slate-500 mb-8">
              {myTeam?.name} scored {myTeam?.score} points
            </p>
            <Leaderboard teams={session.teams} />
          </div>
        )}
      </div>
    </main>
  );
}
