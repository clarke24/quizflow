"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AnswerInput, type PlayQuestion } from "@/components/AnswerInput";
import { Leaderboard } from "@/components/Leaderboard";
import { SocialBar } from "@/components/SocialBar";
import { Timer } from "@/components/Timer";
import { getTypeMeta } from "@/lib/question-types";
import type { AnswerPayload, QuestionType } from "@/lib/types";

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
  phaseBeforePause?: string | null;
  currentQuestionIndex: number;
  questionStartedAt: number | null;
  pausedMs?: number;
  pauseStartedAt?: number | null;
  teams: { id: string; name: string; color: string; score: number }[];
  ranks: {
    teamId: string;
    name: string;
    color: string;
    score: number;
    rank: number;
    previousRank: number | null;
    delta: number;
  }[];
  chat: {
    id: string;
    playerName: string;
    teamColor?: string;
    text?: string;
    emoji?: string;
    kind: "chat" | "emoji" | "system";
    createdAt: number;
  }[];
  currentQuestion: PlayQuestion | null;
  reveal: {
    correctOptionId?: string;
    correctOptionIds?: string[];
    correctText?: string;
    correctTexts?: string[];
    correctNumber?: number;
    correctOrder?: string[];
    correctMatches?: Record<string, string>;
  } | null;
  myAnswer: {
    payload?: AnswerPayload;
    optionId?: string;
    correct: boolean | null;
    points: number;
    pendingReview?: boolean;
    elapsedSec?: number;
    speedMultiplier?: number;
  } | null;
}

export default function PlayPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [player, setPlayer] = useState<PlayerInfo | null>(null);
  const [session, setSession] = useState<SessionState | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchState = useCallback(
    async (playerId: string) => {
      const res = await fetch(
        `/api/sessions/${sessionId}/play?playerId=${playerId}`
      );
      if (!res.ok) return;
      setSession(await res.json());
    },
    [sessionId]
  );

  useEffect(() => {
    const stored = localStorage.getItem(`quizflow-player-${sessionId}`);
    if (!stored) return;
    const p = JSON.parse(stored) as PlayerInfo;
    setPlayer(p);
    fetchState(p.id);
    const interval = setInterval(() => fetchState(p.id), 1000);
    return () => clearInterval(interval);
  }, [sessionId, fetchState]);

  const submitAnswer = async (payload: AnswerPayload) => {
    if (!player || submitting || session?.myAnswer) return;
    if (session?.phase === "paused") return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/play`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "answer",
          playerId: player.id,
          payload,
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
          <p className="text-slate-500 mb-4">
            You haven&apos;t joined this session yet.
          </p>
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
  const qType = session.currentQuestion?.type as QuestionType | undefined;
  const typeLabel = qType ? getTypeMeta(qType).label : "";
  const paused = session.phase === "paused";
  const showingQuestion =
    session.phase === "question" ||
    (paused && session.phaseBeforePause === "question");

  return (
    <main className="flex-1 flex flex-col min-h-0 relative">
      {paused && (
        <div className="absolute inset-0 z-40 bg-slate-900/70 backdrop-blur-sm flex flex-col items-center justify-center text-white px-6">
          <div className="text-5xl mb-3">⏸</div>
          <h2 className="text-2xl font-bold mb-1">Paused</h2>
          <p className="text-slate-300 text-center">
            Admin paused the quiz — timers are frozen
          </p>
        </div>
      )}

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

      <div className="flex-1 flex flex-col items-center px-6 py-6 gap-6">
        <div className="w-full max-w-2xl flex-1 flex flex-col justify-center">
          {session.phase === "lobby" && (
            <div className="text-center animate-fade-in max-w-sm mx-auto">
              <div className="text-5xl mb-4">⏳</div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Waiting to start
              </h2>
              <p className="text-slate-500 mb-2">
                Faster answers earn more points. React and chat while you wait!
              </p>
            </div>
          )}

          {showingQuestion && session.currentQuestion && (
            <div className="w-full animate-fade-in">
              <div className="flex items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-slate-500">
                    {session.currentQuestion.number} / {session.totalQuestions}
                  </span>
                  {typeLabel && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 truncate">
                      {typeLabel}
                    </span>
                  )}
                </div>
                {session.phase === "question" &&
                  session.questionStartedAt &&
                  !session.myAnswer && (
                    <Timer
                      startedAt={session.questionStartedAt}
                      duration={session.currentQuestion.timeLimit}
                      pausedMs={session.pausedMs}
                      pauseStartedAt={session.pauseStartedAt}
                      paused={paused}
                    />
                  )}
                {session.myAnswer && session.phase === "question" && (
                  <span className="text-sm font-medium text-green-600 shrink-0">
                    Locked in ✓
                  </span>
                )}
              </div>

              <p className="text-center text-xs text-slate-400 mb-3">
                Speed scoring — answer faster for more points
              </p>

              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 text-center leading-snug">
                {session.currentQuestion.text}
              </h2>

              {session.phase === "question" && (
                <AnswerInput
                  question={session.currentQuestion}
                  disabled={!!session.myAnswer || paused}
                  submitting={submitting}
                  onSubmit={submitAnswer}
                />
              )}

              {session.myAnswer && session.phase === "question" && (
                <div className="mt-6 text-center text-sm text-slate-500">
                  Waiting for reveal…
                  {session.myAnswer.speedMultiplier != null && (
                    <span className="block text-indigo-600 font-medium mt-1">
                      Speed bonus ×{session.myAnswer.speedMultiplier.toFixed(2)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {(session.phase === "reveal" ||
            (paused && session.phaseBeforePause === "reveal")) &&
            session.currentQuestion && (
              <RevealSummary
                question={session.currentQuestion}
                reveal={session.reveal}
                myAnswer={session.myAnswer}
              />
            )}

          {(session.phase === "leaderboard" ||
            session.phase === "finished" ||
            (paused && session.phaseBeforePause === "leaderboard")) && (
            <div className="w-full max-w-md mx-auto text-center animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {session.phase === "finished" ? "Final standings" : "Live ranks"}
              </h2>
              <p className="text-slate-500 mb-6 text-sm">
                Watch the ↑↓ arrows for rank changes
              </p>
              <Leaderboard teams={session.ranks} showDeltas />
            </div>
          )}
        </div>

        <div className="w-full max-w-2xl">
          <SocialBar
            sessionId={sessionId}
            playerId={player.id}
            chat={session.chat || []}
          />
        </div>
      </div>
    </main>
  );
}

function RevealSummary({
  question,
  reveal,
  myAnswer,
}: {
  question: PlayQuestion;
  reveal: SessionState["reveal"];
  myAnswer: SessionState["myAnswer"];
}) {
  let correctLabel = "";
  if (reveal?.correctOptionId) {
    correctLabel =
      question.options.find((o) => o.id === reveal.correctOptionId)?.text || "";
  } else if (reveal?.correctOptionIds?.length) {
    correctLabel = question.options
      .filter((o) => reveal.correctOptionIds!.includes(o.id))
      .map((o) => o.text)
      .join(", ");
  } else if (reveal?.correctText) {
    correctLabel = reveal.correctText;
  } else if (reveal?.correctNumber !== undefined) {
    correctLabel = String(reveal.correctNumber);
  }

  const pending = myAnswer?.pendingReview;
  const correct = myAnswer?.correct;

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-center text-slate-900">
        {question.text}
      </h2>
      {correctLabel && (
        <div className="card p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
            Correct answer
          </p>
          <p className="font-semibold text-slate-900">{correctLabel}</p>
        </div>
      )}
      {myAnswer && (
        <div
          className={`text-center py-4 rounded-xl font-semibold ${
            pending
              ? "bg-amber-50 text-amber-700"
              : correct
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-600"
          }`}
        >
          {pending
            ? "Submitted for review"
            : correct
              ? `Nice! +${myAnswer.points} pts${
                  myAnswer.elapsedSec != null
                    ? ` in ${myAnswer.elapsedSec.toFixed(1)}s`
                    : ""
                }`
              : myAnswer.points > 0
                ? `Partial credit: +${myAnswer.points} points`
                : "Not quite — better luck next time!"}
        </div>
      )}
    </div>
  );
}
