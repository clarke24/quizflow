export type QuestionType = "multiple-choice" | "true-false";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options: QuestionOption[];
  correctOptionId: string;
  timeLimit: number; // seconds
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: number;
}

export type SessionPhase =
  | "lobby"
  | "question"
  | "reveal"
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
  optionId: string;
  answeredAt: number;
  correct: boolean;
  points: number;
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
  "#6366f1", // indigo
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#ef4444", // red
  "#22c55e", // green
  "#f97316", // orange
  "#3b82f6", // blue
];
