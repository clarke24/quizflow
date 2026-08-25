import { nanoid } from "nanoid";
import type {
  Answer,
  AnswerPayload,
  ChatMessage,
  Player,
  Quiz,
  QuizSession,
  RankSnapshot,
  SessionPhase,
  Team,
} from "./types";
import { TEAM_COLORS } from "./types";
import {
  applySpeedScoring,
  gradeAnswer,
  publicQuestionFields,
  revealQuestionFields,
} from "./grading";
import { loadSavedQuizzes, saveQuizToDisk } from "./persist";

const quizzes = new Map<string, Quiz>();
const sessions = new Map<string, QuizSession>();
let hydrated = false;

async function hydrateQuizzes() {
  if (hydrated) return;
  hydrated = true;
  const saved = await loadSavedQuizzes();
  for (const quiz of Object.values(saved)) {
    quizzes.set(quiz.id, quiz);
  }
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function computeRanks(teams: Team[], previous?: RankSnapshot[]): RankSnapshot[] {
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  return sorted.map((t, i) => {
    const rank = i + 1;
    const prev = previous?.find((p) => p.teamId === t.id);
    const previousRank = prev?.rank ?? null;
    const delta =
      previousRank === null ? 0 : previousRank - rank; // up = positive
    return {
      teamId: t.id,
      name: t.name,
      color: t.color,
      score: t.score,
      rank,
      previousRank,
      delta,
    };
  });
}

function effectiveElapsedSec(session: QuizSession): number {
  if (!session.questionStartedAt) return 0;
  const now = Date.now();
  let paused = session.pausedMs;
  if (session.phase === "paused" && session.pauseStartedAt) {
    paused += now - session.pauseStartedAt;
  }
  return Math.max(0, (now - session.questionStartedAt - paused) / 1000);
}

export async function createQuiz(
  data: Omit<Quiz, "id" | "createdAt"> & { save?: boolean }
): Promise<Quiz> {
  await hydrateQuizzes();
  const quiz: Quiz = {
    title: data.title,
    description: data.description,
    questions: data.questions,
    id: nanoid(10),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    saved: Boolean(data.save),
  };
  quizzes.set(quiz.id, quiz);
  if (data.save) await saveQuizToDisk(quiz);
  return quiz;
}

export async function updateQuiz(
  id: string,
  data: Partial<Pick<Quiz, "title" | "description" | "questions">> & {
    save?: boolean;
  }
): Promise<Quiz | null> {
  await hydrateQuizzes();
  const existing = quizzes.get(id);
  if (!existing) return null;
  const quiz: Quiz = {
    ...existing,
    ...data,
    id,
    updatedAt: Date.now(),
    saved: data.save ?? existing.saved,
  };
  quizzes.set(id, quiz);
  if (quiz.saved) await saveQuizToDisk(quiz);
  return quiz;
}

export async function getQuiz(id: string): Promise<Quiz | undefined> {
  await hydrateQuizzes();
  return quizzes.get(id);
}

export async function listQuizzes(): Promise<Quiz[]> {
  await hydrateQuizzes();
  return Array.from(quizzes.values()).sort(
    (a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt)
  );
}

export async function createSession(
  quizId: string
): Promise<QuizSession | null> {
  await hydrateQuizzes();
  const quiz = quizzes.get(quizId);
  if (!quiz || quiz.questions.length === 0) return null;

  const session: QuizSession = {
    id: nanoid(10),
    code: generateCode(),
    quizId,
    quiz,
    phase: "lobby",
    phaseBeforePause: null,
    currentQuestionIndex: -1,
    questionStartedAt: null,
    pausedMs: 0,
    pauseStartedAt: null,
    teams: [],
    players: [],
    answers: [],
    chat: [
      {
        id: nanoid(8),
        playerId: "system",
        playerName: "QuizFlow",
        kind: "system",
        text: "Lobby is open — scan the QR to join!",
        createdAt: Date.now(),
      },
    ],
    rankHistory: [],
    adminToken: nanoid(16),
    createdAt: Date.now(),
  };
  sessions.set(session.id, session);
  return session;
}

export function getSession(id: string): QuizSession | undefined {
  return sessions.get(id);
}

export function getSessionByCode(code: string): QuizSession | undefined {
  return Array.from(sessions.values()).find(
    (s) => s.code.toUpperCase() === code.toUpperCase()
  );
}

export function verifyAdmin(
  sessionId: string,
  token: string | null | undefined
): boolean {
  const session = sessions.get(sessionId);
  return !!session && !!token && session.adminToken === token;
}

export function createTeam(sessionId: string, name: string): Team | null {
  const session = sessions.get(sessionId);
  if (!session || session.phase !== "lobby") return null;

  const trimmed = name.trim();
  if (!trimmed) return null;

  const existing = session.teams.find(
    (t) => t.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (existing) return existing;

  const team: Team = {
    id: nanoid(8),
    name: trimmed,
    color: TEAM_COLORS[session.teams.length % TEAM_COLORS.length],
    score: 0,
  };
  session.teams.push(team);
  pushSystem(session, `Team "${team.name}" joined the arena`);
  return team;
}

export function joinSession(
  sessionId: string,
  playerName: string,
  teamId: string
): Player | null {
  const session = sessions.get(sessionId);
  if (!session || (session.phase !== "lobby" && session.phase !== "paused")) {
    // Allow join only in lobby for simplicity; pause mid-game no new players
    if (!session || session.phase !== "lobby") return null;
  }

  const team = session.teams.find((t) => t.id === teamId);
  if (!team) return null;

  const trimmed = playerName.trim();
  if (!trimmed) return null;

  const existing = session.players.find(
    (p) => p.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (existing) return existing;

  const player: Player = {
    id: nanoid(10),
    name: trimmed,
    teamId,
    joinedAt: Date.now(),
  };
  session.players.push(player);
  pushSystem(session, `${player.name} joined ${team.name}`);
  return player;
}

function pushSystem(session: QuizSession, text: string) {
  session.chat.push({
    id: nanoid(8),
    playerId: "system",
    playerName: "QuizFlow",
    kind: "system",
    text,
    createdAt: Date.now(),
  });
  trimChat(session);
}

function trimChat(session: QuizSession) {
  if (session.chat.length > 200) {
    session.chat = session.chat.slice(-150);
  }
}

export function startQuiz(sessionId: string): QuizSession | null {
  const session = sessions.get(sessionId);
  if (!session || session.players.length === 0) return null;

  session.phase = "question";
  session.phaseBeforePause = null;
  session.currentQuestionIndex = 0;
  session.questionStartedAt = Date.now();
  session.pausedMs = 0;
  session.pauseStartedAt = null;
  session.rankHistory = computeRanks(session.teams);
  pushSystem(session, "Quiz started — good luck!");
  return session;
}

export function pauseSession(sessionId: string): QuizSession | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (session.phase === "paused" || session.phase === "finished") return null;

  session.phaseBeforePause = session.phase;
  session.phase = "paused";
  session.pauseStartedAt = Date.now();
  pushSystem(session, "⏸ Admin paused the quiz");
  return session;
}

export function resumeSession(sessionId: string): QuizSession | null {
  const session = sessions.get(sessionId);
  if (!session || session.phase !== "paused") return null;

  if (session.pauseStartedAt) {
    session.pausedMs += Date.now() - session.pauseStartedAt;
  }
  session.pauseStartedAt = null;
  session.phase = session.phaseBeforePause || "question";
  session.phaseBeforePause = null;
  pushSystem(session, "▶ Quiz resumed");
  return session;
}

export function submitAnswer(
  sessionId: string,
  playerId: string,
  payload: AnswerPayload
): Answer | null {
  const session = sessions.get(sessionId);
  if (!session || session.phase !== "question") return null;

  const question = session.quiz.questions[session.currentQuestionIndex];
  if (!question) return null;

  const alreadyAnswered = session.answers.some(
    (a) => a.playerId === playerId && a.questionId === question.id
  );
  if (alreadyAnswered) return null;

  const elapsedSec = effectiveElapsedSec(session);
  const graded = applySpeedScoring(
    gradeAnswer(question, payload),
    question,
    elapsedSec
  );

  const answer: Answer = {
    playerId,
    questionId: question.id,
    payload,
    optionId: payload.optionId,
    answeredAt: Date.now(),
    correct: graded.correct,
    points: graded.points,
    pendingReview: graded.pendingReview,
    elapsedSec,
    speedMultiplier: graded.speedMultiplier,
  };
  session.answers.push(answer);

  const player = session.players.find((p) => p.id === playerId);
  if (player && graded.points > 0) {
    const team = session.teams.find((t) => t.id === player.teamId);
    if (team) team.score += graded.points;
  }

  return answer;
}

export function revealAnswer(sessionId: string): QuizSession | null {
  const session = sessions.get(sessionId);
  if (!session || session.phase !== "question") return null;
  session.phase = "reveal";
  session.rankHistory = computeRanks(session.teams, session.rankHistory);
  return session;
}

export function showLeaderboard(sessionId: string): QuizSession | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (session.phase !== "reveal" && session.phase !== "question") return null;
  session.rankHistory = computeRanks(session.teams, session.rankHistory);
  session.phase = "leaderboard";
  return session;
}

export function nextQuestion(sessionId: string): QuizSession | null {
  const session = sessions.get(sessionId);
  if (!session) return null;

  const nextIndex = session.currentQuestionIndex + 1;
  if (nextIndex >= session.quiz.questions.length) {
    session.phase = "finished";
    session.currentQuestionIndex = session.quiz.questions.length - 1;
    session.questionStartedAt = null;
    session.rankHistory = computeRanks(session.teams, session.rankHistory);
    pushSystem(session, "🏁 Quiz finished!");
    return session;
  }

  session.phase = "question";
  session.currentQuestionIndex = nextIndex;
  session.questionStartedAt = Date.now();
  session.pausedMs = 0;
  session.pauseStartedAt = null;
  return session;
}

export function postChat(
  sessionId: string,
  playerId: string,
  text: string
): ChatMessage | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  const player = session.players.find((p) => p.id === playerId);
  if (!player) return null;
  const trimmed = text.trim().slice(0, 140);
  if (!trimmed) return null;
  const team = session.teams.find((t) => t.id === player.teamId);
  const msg: ChatMessage = {
    id: nanoid(8),
    playerId,
    playerName: player.name,
    teamColor: team?.color,
    kind: "chat",
    text: trimmed,
    createdAt: Date.now(),
  };
  session.chat.push(msg);
  trimChat(session);
  return msg;
}

export function postEmoji(
  sessionId: string,
  playerId: string,
  emoji: string
): ChatMessage | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  const player = session.players.find((p) => p.id === playerId);
  if (!player) return null;
  const team = session.teams.find((t) => t.id === player.teamId);
  const msg: ChatMessage = {
    id: nanoid(8),
    playerId,
    playerName: player.name,
    teamColor: team?.color,
    kind: "emoji",
    emoji: emoji.slice(0, 8),
    createdAt: Date.now(),
  };
  session.chat.push(msg);
  trimChat(session);
  return msg;
}

export function getPublicSession(session: QuizSession) {
  const currentQuestion =
    session.currentQuestionIndex >= 0
      ? session.quiz.questions[session.currentQuestionIndex]
      : null;

  const elapsedSec = effectiveElapsedSec(session);

  return {
    id: session.id,
    code: session.code,
    quizTitle: session.quiz.title,
    quizDescription: session.quiz.description,
    totalQuestions: session.quiz.questions.length,
    phase: session.phase,
    phaseBeforePause: session.phaseBeforePause,
    currentQuestionIndex: session.currentQuestionIndex,
    questionStartedAt: session.questionStartedAt,
    pausedMs: session.pausedMs,
    pauseStartedAt: session.pauseStartedAt,
    elapsedSec,
    teams: session.teams.map((t) => ({
      id: t.id,
      name: t.name,
      color: t.color,
      score: t.score,
      playerCount: session.players.filter((p) => p.teamId === t.id).length,
    })),
    players: session.players.map((p) => ({
      id: p.id,
      name: p.name,
      teamId: p.teamId,
    })),
    ranks: computeRanks(session.teams, session.rankHistory),
    chat: session.chat.slice(-50),
    currentQuestion: currentQuestion
      ? {
          ...publicQuestionFields(currentQuestion),
          number: session.currentQuestionIndex + 1,
        }
      : null,
    reveal:
      (session.phase === "reveal" ||
        session.phase === "leaderboard" ||
        (session.phase === "paused" &&
          session.phaseBeforePause === "reveal")) &&
      currentQuestion
        ? {
            ...revealQuestionFields(currentQuestion),
            optionStats: currentQuestion.options
              .filter((o) => o.side !== "right")
              .map((o) => ({
                id: o.id,
                count: session.answers.filter((a) => {
                  if (a.questionId !== currentQuestion.id) return false;
                  if (a.payload.optionId === o.id) return true;
                  if (a.payload.optionIds?.includes(o.id)) return true;
                  return false;
                }).length,
              })),
            responseCount: session.answers.filter(
              (a) => a.questionId === currentQuestion.id
            ).length,
          }
        : null,
  };
}

export function getPlayerSessionState(
  session: QuizSession,
  playerId: string
) {
  const publicState = getPublicSession(session);
  const currentQuestion = session.quiz.questions[session.currentQuestionIndex];
  const myAnswer = currentQuestion
    ? session.answers.find(
        (a) => a.playerId === playerId && a.questionId === currentQuestion.id
      )
    : null;

  return {
    ...publicState,
    myAnswer: myAnswer
      ? {
          payload: myAnswer.payload,
          optionId: myAnswer.optionId,
          correct: myAnswer.correct,
          points: myAnswer.points,
          pendingReview: myAnswer.pendingReview,
          elapsedSec: myAnswer.elapsedSec,
          speedMultiplier: myAnswer.speedMultiplier,
        }
      : null,
  };
}

export type { SessionPhase };
