import { NextResponse } from "next/server";
import { createSession, getQuiz } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json();
  const { quizId } = body;

  if (!quizId) {
    return NextResponse.json({ error: "quizId is required" }, { status: 400 });
  }

  const quiz = await getQuiz(quizId);
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const session = await createSession(quizId);
  if (!session) {
    return NextResponse.json(
      { error: "Could not create session" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    sessionId: session.id,
    code: session.code,
    adminToken: session.adminToken,
  });
}
