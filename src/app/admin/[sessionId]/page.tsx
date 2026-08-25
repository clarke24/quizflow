"use client";

import { Suspense } from "react";
import AdminPage from "./AdminClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="flex-1 flex items-center justify-center">
          <p className="text-slate-400">Loading admin…</p>
        </main>
      }
    >
      <AdminPage />
    </Suspense>
  );
}
