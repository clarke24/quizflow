"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface QuizSummary {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  createdAt: number;
  saved?: boolean;
}

export default function LibraryPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/quizzes")
      .then((r) => r.json())
      .then((d) => setQuizzes(Array.isArray(d) ? d : []))
      .catch(() => setQuizzes([]))
      .finally(() => setLoading(false));
  }, []);

  const present = async (quizId: string) => {
    setLaunching(quizId);
    setError("");
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem(
        `quizflow-admin-${data.sessionId}`,
        data.adminToken
      );
      router.push(`/admin/${data.sessionId}?token=${data.adminToken}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not launch");
    } finally {
      setLaunching(null);
    }
  };

  return (
    <main className="flex-1 px-6 py-10 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <Link href="/" className="text-sm text-slate-500 hover:text-indigo-600">
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 mt-4">Quiz Library</h1>
        <p className="text-slate-500 mt-1">
          Saved quizzes ready to present. Admin runs the remote — TV shows the crowd view.
        </p>
      </div>

      {loading && <p className="text-slate-400">Loading…</p>}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {!loading && quizzes.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-slate-500 mb-4">No saved quizzes yet.</p>
          <Link href="/create" className="btn-primary">
            Create a quiz
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {quizzes.map((q) => (
          <div key={q.id} className="card p-5 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-slate-900 truncate">{q.title}</h2>
              <p className="text-sm text-slate-500">
                {q.questionCount} questions
                {q.description ? ` · ${q.description}` : ""}
              </p>
            </div>
            <button
              onClick={() => present(q.id)}
              disabled={launching === q.id}
              className="btn-primary shrink-0"
            >
              {launching === q.id ? "Launching…" : "Present on TV"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
