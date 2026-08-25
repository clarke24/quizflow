export type QuestionFamily = "selection" | "open-entry" | "arrangement";

export type QuestionType =
  // Selection
  | "multiple-choice"
  | "checkboxes"
  | "true-false"
  | "picture-choice"
  | "dropdown"
  // Open Entry
  | "short-answer"
  | "long-answer"
  | "numeric"
  | "fill-blank"
  // Arrangement
  | "matching"
  | "ordering"
  | "ranking";

export interface QuestionOption {
  id: string;
  text: string;
  /** Optional image URL or emoji for picture-choice */
  imageUrl?: string;
  /** For matching: which side this item belongs to */
  side?: "left" | "right";
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options: QuestionOption[];
  /** Single-select correct answer (MC, TF, dropdown, picture) */
  correctOptionId?: string;
  /** Multi-select correct answers (checkboxes) */
  correctOptionIds?: string[];
  /** Short answer / fill-blank accepted answers */
  correctText?: string;
  correctTexts?: string[];
  /** Numeric answer */
  correctNumber?: number;
  numberTolerance?: number;
  /** Ordering / ranking: option ids in correct sequence */
  correctOrder?: string[];
  /** Matching: leftOptionId -> rightOptionId */
  correctMatches?: Record<string, string>;
  timeLimit: number;
  points: number;
  /** Long answers are not auto-graded */
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
}

export type SessionPhase = "lobby" | "question" | "reveal" | "finished";

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
  /** Legacy convenience for single-select display */
  optionId?: string;
  answeredAt: number;
  /** null = pending host review (long-answer) */
  correct: boolean | null;
  points: number;
  pendingReview?: boolean;
}

export interface QuizSession {
  id: string;
  code: string;
  quizId: string;
  quiz: Quiz;
  phase: SessionPhase;
  currentQuestionIndex: number;
  questionStartedAt: number | null;
  teams: Team[];
  players: Player[];
  answers: Answer[];
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
