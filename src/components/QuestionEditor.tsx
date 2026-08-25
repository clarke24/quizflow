"use client";

import { nanoid } from "nanoid";
import {
  QUESTION_FAMILIES,
  QUESTION_TYPE_META,
  getTypeMeta,
} from "@/lib/question-types";
import { convertQuestionType } from "@/lib/question-factory";
import type { Question, QuestionType } from "@/lib/types";

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

interface Props {
  question: Question;
  index: number;
  canRemove: boolean;
  onChange: (patch: Partial<Question> | Question) => void;
  onRemove: () => void;
}

export function QuestionEditor({
  question,
  index,
  canRemove,
  onChange,
  onRemove,
}: Props) {
  const meta = getTypeMeta(question.type);
  const leftOptions = question.options.filter((o) => o.side !== "right");
  const rightOptions = question.options.filter((o) => o.side === "right");

  const setType = (type: QuestionType) => {
    onChange(convertQuestionType(question, type));
  };

  const updateOption = (optId: string, patch: Partial<(typeof question.options)[0]>) => {
    onChange({
      options: question.options.map((o) =>
        o.id === optId ? { ...o, ...patch } : o
      ),
    });
  };

  const addOption = (side?: "left" | "right") => {
    const opt = {
      id: nanoid(6),
      text: "",
      ...(side ? { side } : {}),
      ...(question.type === "picture-choice" ? { imageUrl: "⭐" } : {}),
    };
    const options = [...question.options, opt];
    const patch: Partial<Question> = { options };
    if (question.type === "ordering" || question.type === "ranking") {
      patch.correctOrder = [...(question.correctOrder || []), opt.id];
    }
    if (question.type === "matching" && side === "left") {
      const firstRight = rightOptions[0];
      if (firstRight) {
        patch.correctMatches = {
          ...(question.correctMatches || {}),
          [opt.id]: firstRight.id,
        };
      }
    }
    onChange(patch);
  };

  const removeOption = (optId: string) => {
    if (question.options.length <= 2) return;
    onChange({
      options: question.options.filter((o) => o.id !== optId),
      correctOptionIds: question.correctOptionIds?.filter((id) => id !== optId),
      correctOrder: question.correctOrder?.filter((id) => id !== optId),
      correctMatches: question.correctMatches
        ? Object.fromEntries(
            Object.entries(question.correctMatches).filter(
              ([l, r]) => l !== optId && r !== optId
            )
          )
        : undefined,
      correctOptionId:
        question.correctOptionId === optId
          ? question.options.find((o) => o.id !== optId)?.id
          : question.correctOptionId,
    });
  };

  const moveOrder = (optId: string, dir: -1 | 1) => {
    const order = [...(question.correctOrder || leftOptions.map((o) => o.id))];
    const i = order.indexOf(optId);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    onChange({ correctOrder: order });
  };

  const toggleCheckboxCorrect = (optId: string) => {
    const current = question.correctOptionIds || [];
    const next = current.includes(optId)
      ? current.filter((id) => id !== optId)
      : [...current, optId];
    onChange({ correctOptionIds: next });
  };

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-indigo-600 shrink-0">
            Question {index + 1}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 truncate">
            {meta.label}
          </span>
        </div>
        {canRemove && (
          <button
            onClick={onRemove}
            className="text-sm text-red-500 hover:text-red-600 shrink-0"
          >
            Remove
          </button>
        )}
      </div>

      {/* Type picker by family */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-2">
          Question type
        </label>
        <div className="space-y-3">
          {QUESTION_FAMILIES.map((family) => (
            <div key={family.id}>
              <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1.5">
                {family.label}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUESTION_TYPE_META.filter((t) => t.family === family.id).map(
                  (t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        question.type === t.id
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                      title={t.description}
                    >
                      {t.label}
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <textarea
        className="input-field min-h-[80px] resize-y"
        placeholder={
          question.type === "fill-blank"
            ? "Write a sentence with ___ for the blank"
            : "Enter your question..."
        }
        value={question.text}
        onChange={(e) => onChange({ text: e.target.value })}
      />

      <div className="flex gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Time (sec)
          </label>
          <input
            type="number"
            min={5}
            max={300}
            className="input-field w-24"
            value={question.timeLimit}
            onChange={(e) => onChange({ timeLimit: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Points
          </label>
          <input
            type="number"
            min={10}
            max={1000}
            step={10}
            className="input-field w-24"
            value={question.points}
            onChange={(e) => onChange({ points: Number(e.target.value) })}
          />
        </div>
      </div>

      {/* Selection options */}
      {(question.type === "multiple-choice" ||
        question.type === "dropdown" ||
        question.type === "checkboxes" ||
        question.type === "picture-choice" ||
        question.type === "true-false") && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-500">
            {question.type === "checkboxes"
              ? "Options — click to toggle correct answers"
              : "Options — click letter to mark correct"}
          </label>
          {question.options.map((opt, oi) => {
            const isCorrect =
              question.type === "checkboxes"
                ? question.correctOptionIds?.includes(opt.id)
                : question.correctOptionId === opt.id;
            return (
              <div key={opt.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    question.type === "checkboxes"
                      ? toggleCheckboxCorrect(opt.id)
                      : onChange({ correctOptionId: opt.id })
                  }
                  className={`w-8 h-8 rounded-lg text-xs font-bold shrink-0 transition-all ${
                    isCorrect
                      ? "bg-green-500 text-white shadow-sm"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {OPTION_LABELS[oi] || oi + 1}
                </button>
                {question.type === "picture-choice" && (
                  <input
                    className="input-field w-16 text-center text-xl"
                    value={opt.imageUrl || ""}
                    placeholder="🖼"
                    onChange={(e) =>
                      updateOption(opt.id, { imageUrl: e.target.value })
                    }
                    title="Emoji or image URL"
                  />
                )}
                <input
                  className="input-field flex-1"
                  placeholder={`Option ${OPTION_LABELS[oi] || oi + 1}`}
                  value={opt.text}
                  disabled={question.type === "true-false"}
                  onChange={(e) => updateOption(opt.id, { text: e.target.value })}
                />
                {question.type !== "true-false" && question.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(opt.id)}
                    className="text-slate-400 hover:text-red-500 text-sm px-1"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
          {question.type !== "true-false" && question.options.length < 8 && (
            <button
              type="button"
              onClick={() => addOption()}
              className="text-sm text-indigo-600 font-medium"
            >
              + Add option
            </button>
          )}
        </div>
      )}

      {/* Open entry answers */}
      {(question.type === "short-answer" || question.type === "fill-blank") && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-500">
            Accepted answer(s)
          </label>
          <input
            className="input-field"
            placeholder="Correct answer"
            value={question.correctText || ""}
            onChange={(e) => onChange({ correctText: e.target.value })}
          />
          <input
            className="input-field"
            placeholder="Alternate answers, comma-separated (optional)"
            value={(question.correctTexts || []).join(", ")}
            onChange={(e) =>
              onChange({
                correctTexts: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>
      )}

      {question.type === "long-answer" && (
        <p className="text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-3">
          Long answers are submitted for review — points are not auto-awarded during play.
        </p>
      )}

      {question.type === "numeric" && (
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Correct number
            </label>
            <input
              type="number"
              className="input-field"
              value={question.correctNumber ?? 0}
              onChange={(e) =>
                onChange({ correctNumber: Number(e.target.value) })
              }
            />
          </div>
          <div className="w-32">
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Tolerance ±
            </label>
            <input
              type="number"
              min={0}
              className="input-field"
              value={question.numberTolerance ?? 0}
              onChange={(e) =>
                onChange({ numberTolerance: Number(e.target.value) })
              }
            />
          </div>
        </div>
      )}

      {/* Matching */}
      {question.type === "matching" && (
        <div className="space-y-3">
          <label className="block text-xs font-medium text-slate-500">
            Match left items to right items
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600">Left</p>
              {leftOptions.map((opt, i) => (
                <div key={opt.id} className="flex gap-2">
                  <input
                    className="input-field flex-1"
                    placeholder={`Item ${i + 1}`}
                    value={opt.text}
                    onChange={(e) => updateOption(opt.id, { text: e.target.value })}
                  />
                  <select
                    className="input-field w-28"
                    value={question.correctMatches?.[opt.id] || ""}
                    onChange={(e) =>
                      onChange({
                        correctMatches: {
                          ...(question.correctMatches || {}),
                          [opt.id]: e.target.value,
                        },
                      })
                    }
                  >
                    <option value="">Match…</option>
                    {rightOptions.map((r, ri) => (
                      <option key={r.id} value={r.id}>
                        {r.text || `Right ${ri + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addOption("left")}
                className="text-sm text-indigo-600 font-medium"
              >
                + Left item
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600">Right</p>
              {rightOptions.map((opt, i) => (
                <input
                  key={opt.id}
                  className="input-field"
                  placeholder={`Match ${i + 1}`}
                  value={opt.text}
                  onChange={(e) => updateOption(opt.id, { text: e.target.value })}
                />
              ))}
              <button
                type="button"
                onClick={() => addOption("right")}
                className="text-sm text-indigo-600 font-medium"
              >
                + Right item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ordering / Ranking */}
      {(question.type === "ordering" || question.type === "ranking") && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-500">
            Items in correct {question.type === "ranking" ? "rank" : "order"}{" "}
            (top = first)
          </label>
          {(question.correctOrder || leftOptions.map((o) => o.id)).map(
            (id, i) => {
              const opt = question.options.find((o) => o.id === id);
              if (!opt) return null;
              return (
                <div key={id} className="flex items-center gap-2">
                  <span className="w-6 text-xs font-bold text-slate-400">
                    {i + 1}
                  </span>
                  <input
                    className="input-field flex-1"
                    placeholder={`Item ${i + 1}`}
                    value={opt.text}
                    onChange={(e) => updateOption(id, { text: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => moveOrder(id, -1)}
                    className="btn-secondary px-2 py-1 text-sm"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveOrder(id, 1)}
                    className="btn-secondary px-2 py-1 text-sm"
                  >
                    ↓
                  </button>
                </div>
              );
            }
          )}
          <button
            type="button"
            onClick={() => addOption()}
            className="text-sm text-indigo-600 font-medium"
          >
            + Add item
          </button>
        </div>
      )}
    </div>
  );
}
