"use client";

import { useState } from "react";
import { REACTION_EMOJIS } from "@/lib/types";

interface ChatItem {
  id: string;
  playerName: string;
  teamColor?: string;
  text?: string;
  emoji?: string;
  kind: "chat" | "emoji" | "system";
  createdAt: number;
}

interface Props {
  sessionId: string;
  playerId: string;
  chat: ChatItem[];
  compact?: boolean;
}

export function SocialBar({ sessionId, playerId, chat, compact }: Props) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const send = async (action: "chat" | "emoji", value: string) => {
    if (sending) return;
    setSending(true);
    try {
      await fetch(`/api/sessions/${sessionId}/social`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          playerId,
          text: action === "chat" ? value : undefined,
          emoji: action === "emoji" ? value : undefined,
        }),
      });
      if (action === "chat") setText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`${compact ? "" : "card p-4"} space-y-3`}>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {REACTION_EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            disabled={sending}
            onClick={() => send("emoji", e)}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-indigo-50 text-xl transition-transform active:scale-90"
          >
            {e}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="input-field flex-1 text-sm"
          placeholder="Say something…"
          maxLength={140}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && text.trim()) send("chat", text);
          }}
        />
        <button
          className="btn-primary px-4 text-sm"
          disabled={!text.trim() || sending}
          onClick={() => send("chat", text)}
        >
          Send
        </button>
      </div>

      <div className="max-h-28 overflow-y-auto space-y-1.5 text-sm">
        {[...chat].reverse().slice(0, 12).map((m) => (
          <div key={m.id} className="flex items-start gap-2">
            {m.kind === "system" ? (
              <p className="text-xs text-slate-400 italic w-full">{m.text}</p>
            ) : m.kind === "emoji" ? (
              <>
                <span
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: m.teamColor || "#94a3b8" }}
                />
                <span className="text-slate-500 text-xs">{m.playerName}</span>
                <span className="text-lg leading-none">{m.emoji}</span>
              </>
            ) : (
              <>
                <span
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: m.teamColor || "#94a3b8" }}
                />
                <span className="font-medium text-slate-700 text-xs shrink-0">
                  {m.playerName}
                </span>
                <span className="text-slate-600">{m.text}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
