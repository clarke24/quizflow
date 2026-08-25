import { nanoid } from "nanoid";
import { getTypeMeta } from "./question-types";
import type { Question, QuestionType } from "./types";

export function createEmptyQuestion(type: QuestionType = "multiple-choice"): Question {
  const meta = getTypeMeta(type);
  const base: Question = {
    id: nanoid(8),
    type,
    text: "",
    options: [],
    timeLimit: type === "long-answer" ? 60 : 20,
    points: 100,
    autoGrade: meta.autoGrade,
  };

  switch (type) {
    case "multiple-choice":
    case "dropdown":
    case "checkboxes": {
      const opts = ["", "", "", ""].map((text) => ({ id: nanoid(6), text }));
      return {
        ...base,
        options: opts,
        correctOptionId: type === "checkboxes" ? undefined : opts[0].id,
        correctOptionIds: type === "checkboxes" ? [opts[0].id] : undefined,
      };
    }
    case "true-false": {
      const opts = [
        { id: nanoid(6), text: "True" },
        { id: nanoid(6), text: "False" },
      ];
      return { ...base, options: opts, correctOptionId: opts[0].id };
    }
    case "picture-choice": {
      const opts = [
        { id: nanoid(6), text: "Option A", imageUrl: "🍎" },
        { id: nanoid(6), text: "Option B", imageUrl: "🍊" },
        { id: nanoid(6), text: "Option C", imageUrl: "🍋" },
        { id: nanoid(6), text: "Option D", imageUrl: "🍇" },
      ];
      return { ...base, options: opts, correctOptionId: opts[0].id };
    }
    case "short-answer":
    case "fill-blank":
      return {
        ...base,
        text: type === "fill-blank" ? "The capital of France is ___." : "",
        correctText: "",
        correctTexts: [],
      };
    case "long-answer":
      return { ...base, autoGrade: false };
    case "numeric":
      return { ...base, correctNumber: 0, numberTolerance: 0 };
    case "matching": {
      const left = [
        { id: nanoid(6), text: "", side: "left" as const },
        { id: nanoid(6), text: "", side: "left" as const },
        { id: nanoid(6), text: "", side: "left" as const },
      ];
      const right = [
        { id: nanoid(6), text: "", side: "right" as const },
        { id: nanoid(6), text: "", side: "right" as const },
        { id: nanoid(6), text: "", side: "right" as const },
      ];
      return {
        ...base,
        options: [...left, ...right],
        correctMatches: {
          [left[0].id]: right[0].id,
          [left[1].id]: right[1].id,
          [left[2].id]: right[2].id,
        },
      };
    }
    case "ordering":
    case "ranking": {
      const opts = [
        { id: nanoid(6), text: "" },
        { id: nanoid(6), text: "" },
        { id: nanoid(6), text: "" },
        { id: nanoid(6), text: "" },
      ];
      return {
        ...base,
        options: opts,
        correctOrder: opts.map((o) => o.id),
      };
    }
    default:
      return base;
  }
}

export function convertQuestionType(
  question: Question,
  newType: QuestionType
): Question {
  if (question.type === newType) return question;
  const fresh = createEmptyQuestion(newType);
  return {
    ...fresh,
    id: question.id,
    text: question.text || fresh.text,
    timeLimit: question.timeLimit || fresh.timeLimit,
    points: question.points || fresh.points,
  };
}
