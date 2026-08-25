"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { QRDisplay } from "@/components/QRDisplay";
import { Leaderboard } from "@/components/Leaderboard";
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
  teams: { id: string; name: string; color: string; score: number; playerCount: number }[];
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
  chat: {
    id: string;
    playerName: string;
    teamColor?: string;
    text?: string;
    emoji?: string;
    kind: "chat" | "emoji" | "system";
    createdAt: number;
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
  } | null;
}

export default function TvPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<SessionState | null>(null);
  const [joinUrl, setJoinUrl] = useState("");
  const [bursts, setBursts] = useState<{ id: string; emoji: string; left: number }[]>([]);

  const fetchSession = useCallback(async () => {
    const res = await fetch(`/api/sessions/${sessionId}`);
    if (!res.ok) return;
    const data = await res.json();
    setSession(data);
  }, [sessionId]);

  useEffect(() => {
    setJoinUrl(`${window.location.origin}/join/${sessionId}`);
    fetchSession();
    const interval = setInterval(fetchSession, 1000);
    return () => clearInterval(interval);
  }, [sessionId, fetchSession]);

  // Emoji rain from recent emoji messages
  const lastEmojiId = session?.chat.filter((c) => c.kind === "emoji").at(-1)?.id;
  useEffect(() => {
    if (!lastEmojiId || !session) return;
    const msg = session.chat.find((c) => c.id === lastEmojiId);
    if (!msg?.emoji) return;
    const id = `${lastEmojiId}-${Date.now()}`;
    setBursts((b) => [
      ...b.slice(-20),
      { id, emoji: msg.emoji!, left: 10 + Math.random() * 80 },
    ]);
    const t = setTimeout(() => {
      setBursts((b) => b.filter((x) => x.id !== id));
    }, 2500);
    return () => clearTimeout(t);
  }, [lastEmojiId]); // eslint-disable-line react-hooks/exhaustive-deps

  const recentChat = useMemo(
    () =>
      (session?.chat || [])
        .filter((c) => c.kind !== "system")
        .slice(-6)
        .reverse(),
    [session?.chat]
  );

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400 text-xl">Connecting TV display…</p>
      </main>
    );
  }

  const paused = session.phase === "paused";

  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.25),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(236,72,153,0.15),_transparent_45%)]" />

      {/* Emoji bursts */}
      {bursts.map((b) => (
        <div
          key={b.id}
          className="pointer-events-none absolute text-5xl animate-float-up"
          style={{
            left: `${b.left}%`,
            bottom: "12%",
          }}
        >
          {b.emoji}
        </div>
      ))}

      {/* Pause overlay */}
      {paused && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="text-8xl mb-6">⏸</div>
          <h2 className="text-5xl font-bold mb-3">Paused</h2>
          <p className="text-xl text-slate-300">
            Admin hit pause — hang tight
          </p>
        </div>
      )}

      <div className="relative z-10 min-h-screen flex flex-col p-8 lg:p-12">
        <header className="flex items-start justify-between mb-8">
          <div>
            <p className="text-indigo-300 font-medium tracking-wide uppercase text-sm mb-1">
              QuizFlow Live
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold">{session.quizTitle}</h1>
          </div>
          <div className="text-right">
            <p className="font-mono text-3xl tracking-[0.25em] text-indigo-300">
              {session.code}
            </p>
            <p className="text-slate-400 mt-1">
              {session.players.length} players · {session.teams.length} teams
            </p>
          </div>
        </header>

        <div className="flex-1 grid lg:grid-cols-[1fr_340px] gap-8">
          <section className="flex flex-col justify-center">
            {session.phase === "lobby" && (
              <div className="flex flex-col lg:flex-row items-center gap-12 justify-center">
                <div className="text-center lg:text-left max-w-lg">
                  <h2 className="text-5xl font-bold mb-4 leading-tight">
                    Scan to join.<br />Pick a team.<br />Race for points.
                  </h2>
                  <p className="text-xl text-slate-300">
                    Faster answers earn more points. React with emojis. Climb the board.
                  </p>
                </div>
                {joinUrl && (
                  <div className="bg-white rounded-3xl p-6 shadow-2xl">
                    <QRDisplay url={joinUrl} code={session.code} />
                  </div>
                )}
              </div>
            )}

            {(session.phase === "question" ||
              (paused && session.phaseBeforePause === "question")) &&
              session.currentQuestion && (
                <div className="max-w-4xl">
                  <div className="flex items-center gap-3 mb-6 text-indigo-300">
                    <span className="text-lg font-semibold">
                      Q{session.currentQuestion.number}/{session.totalQuestions}
                    </span>
                    <span className="text-sm px-3 py-1 rounded-full bg-white/10">
                      {getTypeMeta(session.currentQuestion.type).label}
                    </span>
                    <span className="text-sm text-slate-400">
                      up to {session.currentQuestion.points} pts · speed matters
                    </span>
                  </div>
                  <h2 className="text-4xl lg:text-6xl font-bold leading-tight mb-10">
                    {session.currentQuestion.text}
                  </h2>
                  {session.currentQuestion.options?.length > 0 &&
                    !["short-answer", "long-answer", "numeric", "fill-blank"].includes(
                      session.currentQuestion.type
                    ) && (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {session.currentQuestion.options.map((opt, i) => (
                          <div
                            key={opt.id}
                            className="px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-2xl"
                          >
                            <span className="text-indigo-300 font-bold mr-3">
                              {String.fromCharCode(65 + i)}
                            </span>
                            {opt.imageUrl && (
                              <span className="mr-2 text-3xl">{opt.imageUrl}</span>
                            )}
                            {opt.text}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}

            {(session.phase === "reveal" ||
              (paused && session.phaseBeforePause === "reveal")) &&
              session.currentQuestion && (
                <div className="max-w-4xl">
                  <p className="text-indigo-300 text-lg mb-4">Answer reveal</p>
                  <h2 className="text-4xl font-bold mb-8">
                    {session.currentQuestion.text}
                  </h2>
                  <div className="text-3xl font-semibold text-green-300">
                    {session.reveal?.correctText ||
                      session.reveal?.correctNumber ||
                      session.currentQuestion.options.find(
                        (o) =>
                          o.id === session.reveal?.correctOptionId ||
                          session.reveal?.correctOptionIds?.includes(o.id)
                      )?.text ||
                      "See host screen for details"}
                  </div>
                </div>
              )}

            {(session.phase === "leaderboard" ||
              session.phase === "finished" ||
              (paused && session.phaseBeforePause === "leaderboard")) && (
              <div className="max-w-2xl mx-auto w-full">
                <h2 className="text-4xl font-bold text-center mb-8">
                  {session.phase === "finished" ? "Final Standings" : "Leaderboard"}
                </h2>
                <Leaderboard
                  teams={session.ranks}
                  showDeltas
                  large
                />
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-white/5 border border-white/10 p-5">
              <h3 className="font-semibold text-slate-300 mb-4">Live standings</h3>
              <Leaderboard teams={session.ranks} showDeltas compact />
            </div>

            <div className="rounded-3xl bg-white/5 border border-white/10 p-5">
              <h3 className="font-semibold text-slate-300 mb-4">Crowd chat</h3>
              <div className="space-y-2 max-h-64 overflow-hidden">
                {recentChat.length === 0 && (
                  <p className="text-slate-500 text-sm">Reactions will show here</p>
                )}
                {recentChat.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 text-sm">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: m.teamColor || "#64748b" }}
                    />
                    <span className="text-slate-400">{m.playerName}</span>
                    <span className="text-white">
                      {m.kind === "emoji" ? m.emoji : m.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
