"use client";

import { useEffect, useMemo, useState } from "react";
import type { AnswerPayload } from "@/lib/types";

export interface PlayOption {
  id: string;
  text: string;
  imageUrl?: string;
  side?: "left" | "right";
}

export interface PlayQuestion {
  id: string;
  type: string;
  text: string;
  options: PlayOption[];
  matchTargets?: PlayOption[];
  arrangeItems?: PlayOption[];
  timeLimit: number;
  points: number;
  number: number;
  autoGrade?: boolean;
}

interface Props {
  question: PlayQuestion;
  disabled: boolean;
  onSubmit: (payload: AnswerPayload) => void;
  submitting?: boolean;
}

function shuffleIds(ids: string[]): string[] {
  const copy = [...ids];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const OPTION_COLORS = [
  "hover:border-red-300 hover:bg-red-50",
  "hover:border-blue-300 hover:bg-blue-50",
  "hover:border-amber-300 hover:bg-amber-50",
  "hover:border-green-300 hover:bg-green-50",
  "hover:border-purple-300 hover:bg-purple-50",
  "hover:border-pink-300 hover:bg-pink-50",
];

export function AnswerInput({ question, disabled, onSubmit, submitting }: Props) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [number, setNumber] = useState<string>("");
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [order, setOrder] = useState<string[]>([]);

  const arrangeSource = useMemo(
    () => question.arrangeItems || question.options,
    [question]
  );

  useEffect(() => {
    setSelectedId("");
    setSelectedIds([]);
    setText("");
    setNumber("");
    setMatches({});
    setOrder(shuffleIds(arrangeSource.map((o) => o.id)));
  }, [question.id, arrangeSource]);

  const submitSingle = (optionId: string) => {
    if (disabled || submitting) return;
    setSelectedId(optionId);
    onSubmit({ optionId });
  };

  const toggleCheck = (id: string) => {
    if (disabled) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const moveItem = (id: string, dir: -1 | 1) => {
    if (disabled) return;
    setOrder((prev) => {
      const next = [...prev];
      const i = next.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const type = question.type;

  if (
    type === "multiple-choice" ||
    type === "true-false" ||
    type === "picture-choice"
  ) {
    return (
      <div
        className={`grid gap-3 ${
          type === "picture-choice" ? "sm:grid-cols-2" : "sm:grid-cols-2"
        }`}
      >
        {question.options.map((opt, i) => {
          const selected = selectedId === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => submitSingle(opt.id)}
              disabled={disabled || submitting}
              className={`px-5 py-5 rounded-2xl border-2 text-left transition-all font-medium text-slate-800 ${
                selected
                  ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200"
                  : `border-slate-200 bg-white ${OPTION_COLORS[i % OPTION_COLORS.length]}`
              } ${disabled && !selected ? "opacity-60" : ""}`}
            >
              {type === "picture-choice" && opt.imageUrl && (
                <div className="text-4xl mb-2 text-center">
                  {opt.imageUrl.startsWith("http") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={opt.imageUrl}
                      alt={opt.text}
                      className="w-full h-24 object-cover rounded-xl"
                    />
                  ) : (
                    opt.imageUrl
                  )}
                </div>
              )}
              <span className="text-xs font-bold text-slate-400 block mb-1">
                {String.fromCharCode(65 + i)}
              </span>
              {opt.text}
            </button>
          );
        })}
      </div>
    );
  }

  if (type === "dropdown") {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <select
          className="input-field text-lg"
          value={selectedId}
          disabled={disabled || submitting}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">Select an answer…</option>
          {question.options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.text}
            </option>
          ))}
        </select>
        <button
          className="btn-primary w-full"
          disabled={!selectedId || disabled || submitting}
          onClick={() => selectedId && onSubmit({ optionId: selectedId })}
        >
          Lock in answer
        </button>
      </div>
    );
  }

  if (type === "checkboxes") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-center text-slate-500">Select all that apply</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {question.options.map((opt, i) => {
            const selected = selectedIds.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleCheck(opt.id)}
                disabled={disabled || submitting}
                className={`px-5 py-4 rounded-2xl border-2 text-left transition-all ${
                  selected
                    ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200"
                    : "border-slate-200 bg-white"
                }`}
              >
                <span className="text-xs font-bold text-slate-400 mr-2">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt.text}
              </button>
            );
          })}
        </div>
        <button
          className="btn-primary w-full max-w-sm mx-auto block"
          disabled={selectedIds.length === 0 || disabled || submitting}
          onClick={() => onSubmit({ optionIds: selectedIds })}
        >
          Lock in answers
        </button>
      </div>
    );
  }

  if (type === "short-answer" || type === "fill-blank") {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <input
          className="input-field text-lg text-center"
          placeholder={type === "fill-blank" ? "Fill in the blank…" : "Type your answer…"}
          value={text}
          disabled={disabled || submitting}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && text.trim()) onSubmit({ text });
          }}
        />
        <button
          className="btn-primary w-full"
          disabled={!text.trim() || disabled || submitting}
          onClick={() => onSubmit({ text })}
        >
          Submit
        </button>
      </div>
    );
  }

  if (type === "long-answer") {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <textarea
          className="input-field min-h-[140px] resize-y"
          placeholder="Write your response…"
          value={text}
          disabled={disabled || submitting}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          className="btn-primary w-full"
          disabled={!text.trim() || disabled || submitting}
          onClick={() => onSubmit({ text })}
        >
          Submit response
        </button>
      </div>
    );
  }

  if (type === "numeric") {
    return (
      <div className="max-w-xs mx-auto space-y-4">
        <input
          type="number"
          className="input-field text-2xl text-center font-mono"
          placeholder="0"
          value={number}
          disabled={disabled || submitting}
          onChange={(e) => setNumber(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && number !== "")
              onSubmit({ number: Number(number) });
          }}
        />
        <button
          className="btn-primary w-full"
          disabled={number === "" || disabled || submitting}
          onClick={() => onSubmit({ number: Number(number) })}
        >
          Submit
        </button>
      </div>
    );
  }

  if (type === "matching") {
    const left = question.options;
    const right = question.matchTargets || [];
    return (
      <div className="space-y-4 max-w-lg mx-auto">
        {left.map((opt) => (
          <div key={opt.id} className="flex items-center gap-3">
            <span className="flex-1 font-medium text-slate-800 text-sm sm:text-base">
              {opt.text}
            </span>
            <select
              className="input-field flex-1"
              value={matches[opt.id] || ""}
              disabled={disabled || submitting}
              onChange={(e) =>
                setMatches((prev) => ({ ...prev, [opt.id]: e.target.value }))
              }
            >
              <option value="">Match…</option>
              {right.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.text}
                </option>
              ))}
            </select>
          </div>
        ))}
        <button
          className="btn-primary w-full"
          disabled={
            disabled ||
            submitting ||
            left.some((l) => !matches[l.id])
          }
          onClick={() => onSubmit({ matches })}
        >
          Lock in matches
        </button>
      </div>
    );
  }

  if (type === "ordering" || type === "ranking") {
    return (
      <div className="space-y-3 max-w-md mx-auto">
        <p className="text-sm text-center text-slate-500 mb-2">
          {type === "ranking"
            ? "Rank from highest to lowest"
            : "Arrange in the correct order"}
        </p>
        {order.map((id, i) => {
          const opt = arrangeSource.find((o) => o.id === id);
          if (!opt) return null;
          return (
            <div
              key={id}
              className="flex items-center gap-2 card px-3 py-2"
            >
              <span className="w-6 text-sm font-bold text-slate-400">{i + 1}</span>
              <span className="flex-1 font-medium text-slate-800">{opt.text}</span>
              <button
                type="button"
                disabled={disabled || submitting || i === 0}
                onClick={() => moveItem(id, -1)}
                className="btn-secondary px-2 py-1 text-sm disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={disabled || submitting || i === order.length - 1}
                onClick={() => moveItem(id, 1)}
                className="btn-secondary px-2 py-1 text-sm disabled:opacity-30"
              >
                ↓
              </button>
            </div>
          );
        })}
        <button
          className="btn-primary w-full mt-2"
          disabled={disabled || submitting || order.length === 0}
          onClick={() => onSubmit({ order })}
        >
          Lock in order
        </button>
      </div>
    );
  }

  return (
    <p className="text-center text-slate-400">Unsupported question type</p>
  );
}
