export type QuestionFamily = "selection" | "open-entry" | "arrangement";

export type QuestionType =
  | "multiple-choice"
  | "checkboxes"
  | "true-false"
  | "picture-choice"
  | "dropdown"
  | "short-answer"
  | "long-answer"
  | "numeric"
  | "fill-blank"
  | "matching"
  | "ordering"
  | "ranking";

export interface QuestionOption {
  id: string;
  text: string;
  imageUrl?: string;
  side?: "left" | "right";
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options: QuestionOption[];
  correctOptionId?: string;
  correctOptionIds?: string[];
  correctText?: string;
  correctTexts?: string[];
  correctNumber?: number;
  numberTolerance?: number;
  correctOrder?: string[];
  correctMatches?: Record<string, string>;
  timeLimit: number;
  points: number;
  autoGrade?: boolean;
}

export interface AnswerPayload {
  optionId?: string;
  optionIds?: string[];
  text?: string;
  number?: number | null;
  order?: string[];
  matches?: Record<string, string>;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: number;
  updatedAt?: number;
  saved?: boolean;
}

export type SessionPhase =
  | "lobby"
  | "question"
  | "reveal"
  | "leaderboard"
  | "paused"
  | "finished";

export interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  joinedAt: number;
}

export interface Answer {
  playerId: string;
  questionId: string;
  payload: AnswerPayload;
  optionId?: string;
  answeredAt: number;
  correct: boolean | null;
  points: number;
  pendingReview?: boolean;
  /** Seconds taken to answer (for speed scoring) */
  elapsedSec?: number;
  speedMultiplier?: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  teamColor?: string;
  text?: string;
  emoji?: string;
  kind: "chat" | "emoji" | "system";
  createdAt: number;
}

export interface RankSnapshot {
  teamId: string;
  name: string;
  color: string;
  score: number;
  rank: number;
  previousRank: number | null;
  delta: number; // positive = moved up
}

export interface QuizSession {
  id: string;
  code: string;
  quizId: string;
  quiz: Quiz;
  phase: SessionPhase;
  /** Phase before pause, so we can resume */
  phaseBeforePause: SessionPhase | null;
  currentQuestionIndex: number;
  questionStartedAt: number | null;
  /** Accumulated pause ms for current question */
  pausedMs: number;
  pauseStartedAt: number | null;
  teams: Team[];
  players: Player[];
  answers: Answer[];
  chat: ChatMessage[];
  rankHistory: RankSnapshot[];
  adminToken: string;
  createdAt: number;
}

export const TEAM_COLORS = [
  "#6366f1",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#ef4444",
  "#22c55e",
  "#f97316",
  "#3b82f6",
];

export const REACTION_EMOJIS = [
  "🔥",
  "😂",
  "👏",
  "😮",
  "❤️",
  "🎉",
  "💀",
  "🚀",
  "👀",
  "💯",
];
