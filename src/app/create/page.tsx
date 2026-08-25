"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DIFFICULTY_OPTIONS,
  QUIZ_CATEGORIES,
  type Difficulty,
} from "@/lib/categories";
import { createEmptyQuestion } from "@/lib/question-factory";
import type { Question } from "@/lib/types";
import { QuestionEditor } from "@/components/QuestionEditor";

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
  const [questions, setQuestions] = useState<Question[]>([
    createEmptyQuestion("multiple-choice"),
  ]);
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
          variety: true,
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
    setQuestions([createEmptyQuestion("multiple-choice")]);
    setGenSource(null);
    setStep("edit");
  };

  const updateQuestion = (index: number, patch: Partial<Question> | Question) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== index) return q;
        // Full question replace (type conversion)
        if ("id" in patch && "type" in patch && "options" in patch && "text" in patch) {
          return patch as Question;
        }
        return { ...q, ...patch };
      })
    );
  };

  const addQuestion = () =>
    setQuestions((prev) => [...prev, createEmptyQuestion("multiple-choice")]);

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const validateQuestions = (): string | null => {
    if (!title.trim()) return "Please add a quiz title.";
    for (const q of questions) {
      if (!q.text.trim()) return "Every question needs text.";
      switch (q.type) {
        case "multiple-choice":
        case "dropdown":
        case "picture-choice":
        case "true-false":
          if (q.options.filter((o) => o.text.trim()).length < 2)
            return "Selection questions need at least 2 options.";
          if (!q.correctOptionId) return "Mark a correct answer on each selection question.";
          break;
        case "checkboxes":
          if (q.options.filter((o) => o.text.trim()).length < 2)
            return "Checkbox questions need at least 2 options.";
          if (!q.correctOptionIds?.length)
            return "Mark at least one correct checkbox answer.";
          break;
        case "short-answer":
        case "fill-blank":
          if (!q.correctText?.trim())
            return "Short answer / fill-blank questions need a correct answer.";
          break;
        case "numeric":
          if (q.correctNumber === undefined || Number.isNaN(q.correctNumber))
            return "Numeric questions need a correct number.";
          break;
        case "matching": {
          const left = q.options.filter((o) => o.side === "left" && o.text.trim());
          const right = q.options.filter((o) => o.side === "right" && o.text.trim());
          if (left.length < 2 || right.length < 2)
            return "Matching questions need at least 2 pairs.";
          break;
        }
        case "ordering":
        case "ranking":
          if (q.options.filter((o) => o.text.trim()).length < 2)
            return "Ordering/ranking needs at least 2 items.";
          break;
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    setError("");
    const validationError = validateQuestions();
    if (validationError) {
      setError(validationError);
      return;
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
          <h1 className="text-3xl font-bold text-slate-900 mt-4">Create Quiz</h1>
          <p className="text-slate-500 mt-1">
            Pick a category, generate questions, then mix in any format — selection, open entry, or arrangement.
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

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

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
            <button onClick={startBlank} className="btn-secondary sm:w-auto px-6">
              Start blank
            </button>
          </div>

          <p className="text-center text-xs text-slate-400">
            AI mixes multiple choice, true/false, short answer, ordering, and more. Edit any question type after.
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
              Switch any question between selection, open entry, and arrangement formats.
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
          <QuestionEditor
            key={q.id}
            question={q}
            index={qi}
            canRemove={questions.length > 1}
            onChange={(patch) => updateQuestion(qi, patch)}
            onRemove={() => removeQuestion(qi)}
          />
        ))}

        <button
          onClick={addQuestion}
          className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors font-medium"
        >
          + Add Question
        </button>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

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
