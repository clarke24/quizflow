import type { AnswerPayload, Question } from "./types";

function normalizeText(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

function setsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

export interface GradeResult {
  correct: boolean | null;
  points: number;
  pendingReview?: boolean;
}

export function gradeAnswer(
  question: Question,
  payload: AnswerPayload
): GradeResult {
  const max = question.points;

  switch (question.type) {
    case "multiple-choice":
    case "true-false":
    case "dropdown":
    case "picture-choice": {
      const correct =
        !!payload.optionId && payload.optionId === question.correctOptionId;
      return { correct, points: correct ? max : 0 };
    }

    case "checkboxes": {
      const selected = payload.optionIds || [];
      const expected = question.correctOptionIds || [];
      const correct = setsEqual(selected, expected);
      if (correct) return { correct: true, points: max };
      // Partial credit: fraction of correctly selected / total expected+extras
      if (expected.length === 0) return { correct: false, points: 0 };
      const hits = selected.filter((id) => expected.includes(id)).length;
      const extras = selected.filter((id) => !expected.includes(id)).length;
      const score = Math.max(0, (hits - extras) / expected.length);
      const points = Math.round(score * max);
      return { correct: false, points };
    }

    case "short-answer":
    case "fill-blank": {
      const answer = normalizeText(payload.text || "");
      if (!answer) return { correct: false, points: 0 };
      const accepted = [
        question.correctText,
        ...(question.correctTexts || []),
      ]
        .filter(Boolean)
        .map((t) => normalizeText(String(t)));
      const correct = accepted.some((a) => a === answer);
      return { correct, points: correct ? max : 0 };
    }

    case "long-answer": {
      const text = (payload.text || "").trim();
      if (!text) return { correct: false, points: 0, pendingReview: false };
      return {
        correct: null,
        points: 0,
        pendingReview: true,
      };
    }

    case "numeric": {
      const value = payload.number;
      if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return { correct: false, points: 0 };
      }
      const expected = question.correctNumber ?? 0;
      const tol = question.numberTolerance ?? 0;
      const correct = Math.abs(Number(value) - expected) <= tol;
      return { correct, points: correct ? max : 0 };
    }

    case "ordering":
    case "ranking": {
      const order = payload.order || [];
      const expected = question.correctOrder || [];
      if (arraysEqual(order, expected)) {
        return { correct: true, points: max };
      }
      // Partial: count items in correct position
      if (expected.length === 0) return { correct: false, points: 0 };
      let hits = 0;
      for (let i = 0; i < expected.length; i++) {
        if (order[i] === expected[i]) hits++;
      }
      const points = Math.round((hits / expected.length) * max);
      return { correct: false, points };
    }

    case "matching": {
      const matches = payload.matches || {};
      const expected = question.correctMatches || {};
      const keys = Object.keys(expected);
      if (keys.length === 0) return { correct: false, points: 0 };
      let hits = 0;
      for (const key of keys) {
        if (matches[key] === expected[key]) hits++;
      }
      const correct = hits === keys.length;
      const points = Math.round((hits / keys.length) * max);
      return { correct, points };
    }

    default:
      return { correct: false, points: 0 };
  }
}

/** Public fields safe to send to players during a question (no spoilers) */
export function publicQuestionFields(question: Question) {
  const left = question.options.filter((o) => o.side !== "right");
  const right = question.options.filter((o) => o.side === "right");

  return {
    id: question.id,
    type: question.type,
    text: question.text,
    options: question.options
      .filter((o) => question.type !== "matching" || o.side !== "right")
      .map((o) => ({
        id: o.id,
        text: o.text,
        imageUrl: o.imageUrl,
        side: o.side,
      })),
    matchTargets:
      question.type === "matching"
        ? right.map((o) => ({
            id: o.id,
            text: o.text,
            imageUrl: o.imageUrl,
          }))
        : undefined,
    // For arrangement play UX, send shuffled order candidates without marking correct
    arrangeItems:
      question.type === "ordering" || question.type === "ranking"
        ? left.map((o) => ({ id: o.id, text: o.text, imageUrl: o.imageUrl }))
        : undefined,
    timeLimit: question.timeLimit,
    points: question.points,
    autoGrade: question.autoGrade !== false && question.type !== "long-answer",
  };
}

/** Reveal payload including correct answers for host/player reveal phase */
export function revealQuestionFields(question: Question) {
  return {
    correctOptionId: question.correctOptionId,
    correctOptionIds: question.correctOptionIds,
    correctText: question.correctText,
    correctTexts: question.correctTexts,
    correctNumber: question.correctNumber,
    numberTolerance: question.numberTolerance,
    correctOrder: question.correctOrder,
    correctMatches: question.correctMatches,
  };
}
