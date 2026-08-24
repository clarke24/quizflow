"use client";

import { nanoid } from "nanoid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Question, QuestionType } from "@/lib/types";

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

function emptyQuestion(): Question {
  const opts = ["", "", "", ""].map((text) => ({ id: nanoid(6), text }));
  return {
    id: nanoid(8),
    type: "multiple-choice",
    text: "",
    options: opts,
    correctOptionId: opts[0].id,
    timeLimit: 20,
    points: 100,
  };
}

export default function CreatePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateQuestion = (index: number, patch: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...patch } : q))
    );
  };

  const updateOption = (qIndex: number, oIndex: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((o, j) =>
                j === oIndex ? { ...o, text } : o
              ),
            }
          : q
      )
    );
  };

  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError("");
    if (!title.trim()) {
      setError("Please add a quiz title.");
      return;
    }
    for (const q of questions) {
      if (!q.text.trim()) {
        setError("Every question needs text.");
        return;
      }
      const filled = q.options.filter((o) => o.text.trim());
      if (filled.length < 2) {
        setError("Each question needs at least 2 options.");
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, questions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const sessionRes = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: data.id }),
      });
      const sessionData = await sessionRes.json();
      if (!sessionRes.ok) throw new Error(sessionData.error);

      router.push(`/host/${sessionData.sessionId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex-1 px-6 py-10 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <Link href="/" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 mt-4">Create Quiz</h1>
        <p className="text-slate-500 mt-1">Build your questions, then launch a live session.</p>
      </div>

      <div className="space-y-6 animate-fade-in">
        <div className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Quiz Title
            </label>
            <input
              className="input-field"
              placeholder="e.g. Movie Trivia Night"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              className="input-field"
              placeholder="A short description for players"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {questions.map((q, qi) => (
          <div key={q.id} className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-indigo-600">
                Question {qi + 1}
              </span>
              {questions.length > 1 && (
                <button
                  onClick={() => removeQuestion(qi)}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              )}
            </div>

            <textarea
              className="input-field min-h-[80px] resize-y"
              placeholder="What is the capital of France?"
              value={q.text}
              onChange={(e) => updateQuestion(qi, { text: e.target.value })}
            />

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Type
                </label>
                <select
                  className="input-field"
                  value={q.type}
                  onChange={(e) => {
                    const type = e.target.value as QuestionType;
                    if (type === "true-false") {
                      const opts = [
                        { id: nanoid(6), text: "True" },
                        { id: nanoid(6), text: "False" },
                      ];
                      updateQuestion(qi, {
                        type,
                        options: opts,
                        correctOptionId: opts[0].id,
                      });
                    } else {
                      updateQuestion(qi, { type });
                    }
                  }}
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="true-false">True / False</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Time (sec)
                </label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  className="input-field w-24"
                  value={q.timeLimit}
                  onChange={(e) =>
                    updateQuestion(qi, { timeLimit: Number(e.target.value) })
                  }
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
                  value={q.points}
                  onChange={(e) =>
                    updateQuestion(qi, { points: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-500">
                Answers — click to mark correct
              </label>
              {q.options.map((opt, oi) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuestion(qi, { correctOptionId: opt.id })
                    }
                    className={`w-8 h-8 rounded-lg text-xs font-bold shrink-0 transition-all ${
                      q.correctOptionId === opt.id
                        ? "bg-green-500 text-white shadow-sm"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {OPTION_LABELS[oi]}
                  </button>
                  <input
                    className="input-field flex-1"
                    placeholder={`Option ${OPTION_LABELS[oi]}`}
                    value={opt.text}
                    disabled={q.type === "true-false"}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={addQuestion}
          className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors font-medium"
        >
          + Add Question
        </button>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="btn-primary w-full text-lg py-4"
        >
          {saving ? "Launching..." : "Create & Launch Session"}
        </button>
      </div>
    </main>
  );
}
