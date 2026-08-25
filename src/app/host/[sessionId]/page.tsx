"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

/** Legacy /host route → redirect to admin remote */
export default function HostRedirectPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  useEffect(() => {
    const token = localStorage.getItem(`quizflow-admin-${sessionId}`) || "";
    const q = token ? `?token=${encodeURIComponent(token)}` : "";
    window.location.replace(`/admin/${sessionId}${q}`);
  }, [sessionId]);

  return (
    <main className="flex-1 flex items-center justify-center">
      <p className="text-slate-400">Opening admin remote…</p>
    </main>
  );
}
