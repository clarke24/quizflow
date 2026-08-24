import { nanoid } from "nanoid";
import type {
  Answer,
  Player,
  Quiz,
  QuizSession,
  Team,
} from "./types";
import { TEAM_COLORS } from "./types";

const quizzes = new Map<string, Quiz>();
const sessions = new Map<string, QuizSession>();

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function createQuiz(
  data: Omit<Quiz, "id" | "createdAt">
): Quiz {
  const quiz: Quiz = {
    ...data,
    id: nanoid(10),
    createdAt: Date.now(),
  };
  quizzes.set(quiz.id, quiz);
  return quiz;
}

export function getQuiz(id: string): Quiz | undefined {
  return quizzes.get(id);
}

export function listQuizzes(): Quiz[] {
  return Array.from(quizzes.values()).sort(
    (a, b) => b.createdAt - a.createdAt
  );
}

export function createSession(quizId: string): QuizSession | null {
  const quiz = quizzes.get(quizId);
  if (!quiz || quiz.questions.length === 0) return null;

  const session: QuizSession = {
    id: nanoid(10),
    code: generateCode(),
    quizId,
    quiz,
    phase: "lobby",
    currentQuestionIndex: -1,
    questionStartedAt: null,
    teams: [],
    players: [],
    answers: [],
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

export function createTeam(sessionId: string, name: string): Team | null {
  const session = sessions.get(sessionId);
  if (!session) return null;

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
  return team;
}

export function joinSession(
  sessionId: string,
  playerName: string,
  teamId: string
): Player | null {
  const session = sessions.get(sessionId);
  if (!session || session.phase !== "lobby") return null;

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
  return player;
}

export function startQuiz(sessionId: string): QuizSession | null {
  const session = sessions.get(sessionId);
  if (!session || session.players.length === 0) return null;

  session.phase = "question";
  session.currentQuestionIndex = 0;
  session.questionStartedAt = Date.now();
  return session;
}

export function submitAnswer(
  sessionId: string,
  playerId: string,
  optionId: string
): Answer | null {
  const session = sessions.get(sessionId);
  if (!session || session.phase !== "question") return null;

  const question = session.quiz.questions[session.currentQuestionIndex];
  if (!question) return null;

  const alreadyAnswered = session.answers.some(
    (a) => a.playerId === playerId && a.questionId === question.id
  );
  if (alreadyAnswered) return null;

  const correct = optionId === question.correctOptionId;
  const answer: Answer = {
    playerId,
    questionId: question.id,
    optionId,
    answeredAt: Date.now(),
    correct,
    points: correct ? question.points : 0,
  };
  session.answers.push(answer);

  const player = session.players.find((p) => p.id === playerId);
  if (player && correct) {
    const team = session.teams.find((t) => t.id === player.teamId);
    if (team) team.score += question.points;
  }

  return answer;
}

export function revealAnswer(sessionId: string): QuizSession | null {
  const session = sessions.get(sessionId);
  if (!session || session.phase !== "question") return null;
  session.phase = "reveal";
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
    return session;
  }

  session.phase = "question";
  session.currentQuestionIndex = nextIndex;
  session.questionStartedAt = Date.now();
  return session;
}

export function getPublicSession(session: QuizSession) {
  const currentQuestion =
    session.currentQuestionIndex >= 0
      ? session.quiz.questions[session.currentQuestionIndex]
      : null;

  return {
    id: session.id,
    code: session.code,
    quizTitle: session.quiz.title,
    quizDescription: session.quiz.description,
    totalQuestions: session.quiz.questions.length,
    phase: session.phase,
    currentQuestionIndex: session.currentQuestionIndex,
    questionStartedAt: session.questionStartedAt,
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
    currentQuestion: currentQuestion
      ? {
          id: currentQuestion.id,
          type: currentQuestion.type,
          text: currentQuestion.text,
          options: currentQuestion.options.map((o) => ({
            id: o.id,
            text: o.text,
          })),
          timeLimit: currentQuestion.timeLimit,
          points: currentQuestion.points,
          number: session.currentQuestionIndex + 1,
        }
      : null,
    reveal:
      session.phase === "reveal" && currentQuestion
        ? {
            correctOptionId: currentQuestion.correctOptionId,
            optionStats: currentQuestion.options.map((o) => ({
              id: o.id,
              count: session.answers.filter(
                (a) =>
                  a.questionId === currentQuestion.id && a.optionId === o.id
              ).length,
            })),
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
          optionId: myAnswer.optionId,
          correct: myAnswer.correct,
          points: myAnswer.points,
        }
      : null,
  };
}
