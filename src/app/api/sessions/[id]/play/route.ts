import { NextResponse } from "next/server";
import {
  getPlayerSessionState,
  getPublicSession,
  getSession,
  nextQuestion,
  revealAnswer,
  startQuiz,
  submitAnswer,
} from "@/lib/store";
import type { AnswerPayload } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const playerId = new URL(request.url).searchParams.get("playerId");

  const session = getSession(id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (playerId) {
    return NextResponse.json(getPlayerSessionState(session, playerId));
  }

  return NextResponse.json(getPublicSession(session));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { action, playerId, optionId, payload: rawPayload } = body;

  if (action === "start") {
    const session = startQuiz(id);
    if (!session) {
      return NextResponse.json({ error: "Could not start quiz" }, { status: 400 });
    }
    return NextResponse.json(getPublicSession(session));
  }

  if (action === "answer") {
    if (!playerId) {
      return NextResponse.json({ error: "Missing playerId" }, { status: 400 });
    }

    // Support legacy optionId and new payload shape
    const payload: AnswerPayload = rawPayload || (optionId ? { optionId } : null);
    if (!payload) {
      return NextResponse.json({ error: "Missing answer payload" }, { status: 400 });
    }

    const answer = submitAnswer(id, playerId, payload);
    if (!answer) {
      return NextResponse.json({ error: "Could not submit answer" }, { status: 400 });
    }
    const session = getSession(id)!;
    return NextResponse.json(getPlayerSessionState(session, playerId));
  }

  if (action === "reveal") {
    const session = revealAnswer(id);
    if (!session) {
      return NextResponse.json({ error: "Could not reveal answer" }, { status: 400 });
    }
    return NextResponse.json(getPublicSession(session));
  }

  if (action === "next") {
    const session = nextQuestion(id);
    if (!session) {
      return NextResponse.json({ error: "Could not advance" }, { status: 400 });
    }
    return NextResponse.json(getPublicSession(session));
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
