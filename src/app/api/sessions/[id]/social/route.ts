import { NextResponse } from "next/server";
import {
  getPublicSession,
  getSession,
  postChat,
  postEmoji,
} from "@/lib/store";
import { REACTION_EMOJIS } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { action, playerId, text, emoji } = body;

  const session = getSession(id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (action === "chat") {
    const msg = postChat(id, playerId, text || "");
    if (!msg) {
      return NextResponse.json({ error: "Could not send chat" }, { status: 400 });
    }
    return NextResponse.json({ message: msg, chat: getPublicSession(session).chat });
  }

  if (action === "emoji") {
    if (!REACTION_EMOJIS.includes(emoji)) {
      return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });
    }
    const msg = postEmoji(id, playerId, emoji);
    if (!msg) {
      return NextResponse.json({ error: "Could not react" }, { status: 400 });
    }
    return NextResponse.json({ message: msg, chat: getPublicSession(session).chat });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
