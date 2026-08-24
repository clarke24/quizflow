"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-2xl w-full text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Interactive team quizzes
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 mb-4">
          Quiz<span className="text-indigo-500">Flow</span>
        </h1>

        <p className="text-lg text-slate-500 mb-12 max-w-md mx-auto leading-relaxed">
          Build polished quizzes, share a QR code, and let players join with a name and team.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/create" className="btn-primary text-center">
            Create a Quiz
          </Link>
          <Link href="/join" className="btn-secondary text-center">
            Join with Code
          </Link>
        </div>

        <div className="mt-20 grid sm:grid-cols-3 gap-6 text-left">
          {[
            {
              icon: "✏️",
              title: "Build",
              desc: "Craft questions with timers, points, and multiple choice answers.",
            },
            {
              icon: "📱",
              title: "Share",
              desc: "Display a QR code so anyone can scan and join instantly.",
            },
            {
              icon: "🏆",
              title: "Compete",
              desc: "Players pick a team, answer live, and climb the leaderboard.",
            },
          ].map((feature) => (
            <div key={feature.title} className="card p-6">
              <span className="text-2xl mb-3 block">{feature.icon}</span>
              <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
