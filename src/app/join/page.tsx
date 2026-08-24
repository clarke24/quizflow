"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JoinCodePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    setError("");
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 4) {
      setError("Enter a valid session code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/lookup?code=${trimmed}`);
      if (!res.ok) {
        setError("Session not found. Check the code and try again.");
        return;
      }
      const data = await res.json();
      router.push(`/join/${data.sessionId}`);
    } catch {
      setError("Could not connect. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-md w-full animate-fade-in">
        <Link href="/" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">
          ← Back
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mt-4 mb-2">Join a Quiz</h1>
        <p className="text-slate-500 mb-8">Enter the 6-character code from the host screen.</p>

        <div className="card p-8 space-y-6">
          <input
            className="input-field text-center text-2xl font-mono tracking-[0.4em] uppercase"
            placeholder="ABC123"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            onClick={handleJoin}
            disabled={loading || code.length < 4}
            className="btn-primary w-full"
          >
            {loading ? "Finding session..." : "Continue"}
          </button>
        </div>
      </div>
    </main>
  );
}
