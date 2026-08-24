"use client";

import { nanoid } from "nanoid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DIFFICULTY_OPTIONS,
  QUIZ_CATEGORIES,
  type Difficulty,
} from "@/lib/categories";
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
  const [step, setStep] = useState<"category" | "edit">("category");
  const [categoryId, setCategoryId] = useState("general");
  const [customTopic, setCustomTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("mixed");
  const [count, setCount] = useState(8);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genSource, setGenSource] = useState<"ai" | "library" | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/generate")
      .then((r) => r.json())
      .then((d) => setAiEnabled(Boolean(d.aiEnabled)))
      .catch(() => setAiEnabled(false));
  }, []);

  const selectedCategory = QUIZ_CATEGORIES.find((c) => c.id === categoryId);

  const handleGenerate = async () => {
    setError("");
    if (categoryId === "custom" && !customTopic.trim()) {
      setError("Enter a topic for your custom quiz.");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          customTopic,
          count,
          difficulty,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setTitle(data.title);
      setDescription(data.description);
      setQuestions(data.questions);
      setGenSource(data.source);
      setStep("edit");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate quiz");
    } finally {
      setGenerating(false);
    }
  };

  const startBlank = () => {
    const cat = selectedCategory;
    const topic =
      categoryId === "custom" && customTopic.trim()
        ? customTopic.trim()
        : cat?.name || "Quiz";
    setTitle(`${topic} Quiz`);
    setDescription("");
    setQuestions([emptyQuestion()]);
    setGenSource(null);
    setStep("edit");
  };

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

  if (step === "category") {
    return (
      <main className="flex-1 px-6 py-10 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
          >
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mt-4">
            Create Quiz
          </h1>
          <p className="text-slate-500 mt-1">
            Pick a category and generate a polished set of questions — then tweak anything.
          </p>
        </div>

        <div className="space-y-8 animate-fade-in">
          <section>
            <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
              Category
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {QUIZ_CATEGORIES.map((cat) => {
                const selected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`text-left p-4 rounded-2xl border-2 transition-all ${
                      selected
                        ? "border-indigo-500 bg-indigo-50/80 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className="text-2xl block mb-2">{cat.emoji}</span>
                    <span className="font-semibold text-slate-900 block">
                      {cat.name}
                    </span>
                    <span className="text-xs text-slate-500 leading-snug block mt-0.5">
                      {cat.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {categoryId === "custom" && (
            <section className="card p-5">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Custom topic
              </label>
              <input
                className="input-field"
                placeholder="e.g. 90s cartoons, coffee, Taylor Swift, office trivia"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
              />
            </section>
          )}

          <section className="card p-5 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Difficulty
              </label>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTY_OPTIONS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      difficulty === d.id
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Questions: {count}
              </label>
              <input
                type="range"
                min={3}
                max={15}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>3</span>
                <span>15</span>
              </div>
            </div>
          </section>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn-primary flex-1 text-lg py-4"
            >
              {generating
                ? "Generating..."
                : aiEnabled
                  ? "✨ Generate with AI"
                  : "✨ Generate Quiz"}
            </button>
            <button
              onClick={startBlank}
              className="btn-secondary sm:w-auto px-6"
            >
              Start blank
            </button>
          </div>

          <p className="text-center text-xs text-slate-400">
            {aiEnabled
              ? "AI will draft questions for your category. You can edit everything next."
              : "Smart quiz library will draft questions for your category. You can edit everything next."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 py-10 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <button
          onClick={() => setStep("category")}
          className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
        >
          ← Change category
        </button>
        <div className="flex items-start justify-between gap-4 mt-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Edit Quiz</h1>
            <p className="text-slate-500 mt-1">
              Review and polish your questions, then launch.
            </p>
          </div>
          {genSource && (
            <span
              className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full ${
                genSource === "ai"
                  ? "bg-violet-100 text-violet-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {genSource === "ai" ? "AI generated" : "Library generated"}
            </span>
          )}
        </div>
        {selectedCategory && (
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-slate-600">
            <span>{selectedCategory.emoji}</span>
            <span className="font-medium">{selectedCategory.name}</span>
            {categoryId === "custom" && customTopic && (
              <span className="text-slate-400">· {customTopic}</span>
            )}
          </div>
        )}
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
              Description{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              className="input-field"
              placeholder="A short description for players"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">
            {questions.length} Questions
          </h2>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            {generating ? "Regenerating..." : "↻ Regenerate"}
          </button>
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
