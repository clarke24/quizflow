"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AnswerInput, type PlayQuestion } from "@/components/AnswerInput";
import { Leaderboard } from "@/components/Leaderboard";
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
  currentQuestionIndex: number;
  questionStartedAt: number | null;
  teams: { id: string; name: string; color: string; score: number }[];
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

  return (
    <main className="flex-1 flex flex-col min-h-0">
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
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Waiting to start
            </h2>
            <p className="text-slate-500">
              The host will begin the quiz soon. Get ready!
            </p>
          </div>
        )}

        {(session.phase === "question" || session.phase === "reveal") &&
          session.currentQuestion && (
            <div className="w-full max-w-2xl animate-fade-in">
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
                    />
                  )}
                {session.myAnswer && session.phase === "question" && (
                  <span className="text-sm font-medium text-green-600 shrink-0">
                    Locked in ✓
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 text-center leading-snug">
                {session.currentQuestion.text}
              </h2>

              {session.phase === "question" && (
                <AnswerInput
                  question={session.currentQuestion}
                  disabled={!!session.myAnswer}
                  submitting={submitting}
                  onSubmit={submitAnswer}
                />
              )}

              {session.phase === "reveal" && (
                <RevealSummary
                  question={session.currentQuestion}
                  reveal={session.reveal}
                  myAnswer={session.myAnswer}
                />
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
  } else if (reveal?.correctOrder?.length) {
    const items = question.arrangeItems || question.options;
    correctLabel = reveal.correctOrder
      .map((id, i) => `${i + 1}. ${items.find((o) => o.id === id)?.text || "?"}`)
      .join(" → ");
  } else if (reveal?.correctMatches) {
    const right = question.matchTargets || [];
    correctLabel = Object.entries(reveal.correctMatches)
      .map(([l, r]) => {
        const left = question.options.find((o) => o.id === l)?.text;
        const rt = right.find((o) => o.id === r)?.text;
        return `${left} → ${rt}`;
      })
      .join("; ");
  }

  const pending = myAnswer?.pendingReview;
  const correct = myAnswer?.correct;

  return (
    <div className="space-y-4">
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
              ? `Correct! +${myAnswer.points} points`
              : myAnswer.points > 0
                ? `Partial credit: +${myAnswer.points} points`
                : "Not quite — better luck next time!"}
        </div>
      )}
    </div>
  );
}
