import { NextResponse } from "next/server";
import { QUIZ_CATEGORIES } from "@/lib/categories";
import { generateQuiz, hasAiConfigured } from "@/lib/generate";
import type { Difficulty } from "@/lib/categories";

export async function GET() {
  return NextResponse.json({
    aiEnabled: hasAiConfigured(),
    categories: QUIZ_CATEGORIES,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      categoryId,
      customTopic,
      count = 8,
      difficulty = "mixed",
    } = body;

    const category = QUIZ_CATEGORIES.find((c) => c.id === categoryId);
    if (!category) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    if (category.id === "custom" && !customTopic?.trim()) {
      return NextResponse.json(
        { error: "Enter a custom topic to generate from" },
        { status: 400 }
      );
    }

    const questionCount = Math.min(20, Math.max(3, Number(count) || 8));
    const diff = (
      ["easy", "medium", "hard", "mixed"].includes(difficulty)
        ? difficulty
        : "mixed"
    ) as Difficulty;

    const result = await generateQuiz({
      categoryId: category.id,
      categoryName: category.name,
      customTopic: customTopic?.trim(),
      count: questionCount,
      difficulty: diff,
    });

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Generation failed" },
      { status: 500 }
    );
  }
}
