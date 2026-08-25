import { NextResponse } from "next/server";
import { createQuiz, listQuizzes } from "@/lib/store";

export async function GET() {
  const quizzes = (await listQuizzes()).map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description,
    questionCount: q.questions.length,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
    saved: q.saved,
  }));
  return NextResponse.json(quizzes);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, description, questions, save = true } = body;

  if (!title?.trim() || !Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json(
      { error: "Title and at least one question are required" },
      { status: 400 }
    );
  }

  const quiz = await createQuiz({
    title: title.trim(),
    description: description?.trim() || "",
    questions,
    save: Boolean(save),
  });

  return NextResponse.json({
    id: quiz.id,
    title: quiz.title,
    saved: quiz.saved,
  });
}
