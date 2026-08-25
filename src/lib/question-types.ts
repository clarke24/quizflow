import type { QuestionFamily, QuestionType } from "./types";

export interface QuestionTypeMeta {
  id: QuestionType;
  label: string;
  family: QuestionFamily;
  description: string;
  icon: string;
  autoGrade: boolean;
}

export const QUESTION_FAMILIES: {
  id: QuestionFamily;
  label: string;
  description: string;
}[] = [
  {
    id: "selection",
    label: "Selection",
    description: "Pick from options — fast and auto-graded",
  },
  {
    id: "open-entry",
    label: "Open Entry",
    description: "Type the answer — tests recall",
  },
  {
    id: "arrangement",
    label: "Arrangement",
    description: "Match, order, or rank items",
  },
];

export const QUESTION_TYPE_META: QuestionTypeMeta[] = [
  {
    id: "multiple-choice",
    label: "Multiple Choice",
    family: "selection",
    description: "One correct answer from a list",
    icon: "○",
    autoGrade: true,
  },
  {
    id: "checkboxes",
    label: "Checkboxes",
    family: "selection",
    description: "Select all that apply",
    icon: "☑",
    autoGrade: true,
  },
  {
    id: "true-false",
    label: "True / False",
    family: "selection",
    description: "Simple binary choice",
    icon: "⇄",
    autoGrade: true,
  },
  {
    id: "picture-choice",
    label: "Picture Choice",
    family: "selection",
    description: "Pick from image or emoji options",
    icon: "🖼",
    autoGrade: true,
  },
  {
    id: "dropdown",
    label: "Dropdown",
    family: "selection",
    description: "Choose one from a compact menu",
    icon: "▾",
    autoGrade: true,
  },
  {
    id: "short-answer",
    label: "Short Answer",
    family: "open-entry",
    description: "Type a brief text answer",
    icon: "✎",
    autoGrade: true,
  },
  {
    id: "long-answer",
    label: "Long Answer",
    family: "open-entry",
    description: "Essay-style response (manual review)",
    icon: "¶",
    autoGrade: false,
  },
  {
    id: "numeric",
    label: "Numeric",
    family: "open-entry",
    description: "Enter a number",
    icon: "#",
    autoGrade: true,
  },
  {
    id: "fill-blank",
    label: "Fill in the Blank",
    family: "open-entry",
    description: "Complete the missing word(s)",
    icon: "___",
    autoGrade: true,
  },
  {
    id: "matching",
    label: "Matching",
    family: "arrangement",
    description: "Pair related items",
    icon: "⟷",
    autoGrade: true,
  },
  {
    id: "ordering",
    label: "Ordering",
    family: "arrangement",
    description: "Put items in the correct sequence",
    icon: "↕",
    autoGrade: true,
  },
  {
    id: "ranking",
    label: "Ranking",
    family: "arrangement",
    description: "Sort by a given criteria",
    icon: "★",
    autoGrade: true,
  },
];

export function getTypeMeta(type: QuestionType): QuestionTypeMeta {
  return (
    QUESTION_TYPE_META.find((t) => t.id === type) || QUESTION_TYPE_META[0]
  );
}

export function typesForFamily(family: QuestionFamily): QuestionTypeMeta[] {
  return QUESTION_TYPE_META.filter((t) => t.family === family);
}
