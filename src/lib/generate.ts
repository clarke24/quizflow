import { nanoid } from "nanoid";
import type { Difficulty } from "./categories";
import { getCleanBank, QUESTION_BANKS, type BankQuestion } from "./question-banks";
import type { Question } from "./types";

export interface GenerateRequest {
  categoryId: string;
  categoryName: string;
  customTopic?: string;
  count: number;
  difficulty: Difficulty;
}

export interface GenerateResult {
  title: string;
  description: string;
  questions: Question[];
  source: "ai" | "library";
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function bankToQuestion(q: BankQuestion, difficulty: Difficulty): Question {
  const options = q.options.map((text) => ({ id: nanoid(6), text }));
  const correctOptionId = options[q.correctIndex]?.id ?? options[0].id;
  const timeLimit =
    difficulty === "hard" || q.difficulty === "hard"
      ? 25
      : difficulty === "easy" || q.difficulty === "easy"
        ? 15
        : 20;
  const points =
    q.difficulty === "hard" ? 150 : q.difficulty === "easy" ? 80 : 100;

  return {
    id: nanoid(8),
    type: "multiple-choice",
    text: q.text,
    options,
    correctOptionId,
    timeLimit,
    points,
  };
}

export function generateFromLibrary(req: GenerateRequest): GenerateResult {
  const topic = req.customTopic?.trim() || req.categoryName;
  let pool: BankQuestion[];

  if (req.categoryId === "custom") {
    // Mix across categories when generating without AI for a custom topic
    pool = Object.keys(QUESTION_BANKS).flatMap((id) => getCleanBank(id));
  } else {
    pool = getCleanBank(req.categoryId);
  }

  if (req.difficulty !== "mixed") {
    const filtered = pool.filter((q) => q.difficulty === req.difficulty);
    if (filtered.length >= Math.min(req.count, 4)) {
      pool = filtered;
    }
  }

  const selected = shuffle(pool).slice(0, Math.min(req.count, pool.length));
  const questions = selected.map((q) => bankToQuestion(q, req.difficulty));

  while (questions.length < req.count && pool.length > 0) {
    const extra = shuffle(pool)[0];
    questions.push(bankToQuestion(extra, req.difficulty));
  }

  return {
    title: `${topic} Quiz`,
    description: `A ${req.difficulty === "mixed" ? "varied" : req.difficulty} quiz about ${topic.toLowerCase()}.`,
    questions,
    source: "library",
  };
}

interface AiQuestion {
  text: string;
  options: string[];
  correctIndex: number;
  difficulty?: string;
}

function parseAiQuestions(raw: string): AiQuestion[] {
  const cleaned = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  const parsed = JSON.parse(cleaned);
  const list = Array.isArray(parsed)
    ? parsed
    : parsed.questions || parsed.items || [];
  return list.filter(
    (q: AiQuestion) =>
      q?.text &&
      Array.isArray(q.options) &&
      q.options.length >= 2 &&
      typeof q.correctIndex === "number"
  );
}

function aiToQuestions(
  items: AiQuestion[],
  difficulty: Difficulty
): Question[] {
  return items.map((q) => {
    const opts = q.options.slice(0, 4).map((text) => ({
      id: nanoid(6),
      text: String(text),
    }));
    while (opts.length < 2) {
      opts.push({ id: nanoid(6), text: "N/A" });
    }
    const correctIndex = Math.min(
      Math.max(0, q.correctIndex),
      opts.length - 1
    );
    const d = (q.difficulty as Difficulty) || difficulty;
    return {
      id: nanoid(8),
      type: "multiple-choice" as const,
      text: q.text.trim(),
      options: opts,
      correctOptionId: opts[correctIndex].id,
      timeLimit: d === "hard" ? 25 : d === "easy" ? 15 : 20,
      points: d === "hard" ? 150 : d === "easy" ? 80 : 100,
    };
  });
}

async function callChatApi(
  apiUrl: string,
  apiKey: string,
  model: string,
  system: string,
  user: string
): Promise<string> {
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.8,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI API error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function generateWithAi(
  req: GenerateRequest
): Promise<GenerateResult | null> {
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  let apiUrl = "";
  let apiKey = "";
  let model = "";

  if (groqKey) {
    apiUrl = "https://api.groq.com/openai/v1/chat/completions";
    apiKey = groqKey;
    model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  } else if (openaiKey) {
    apiUrl = "https://api.openai.com/v1/chat/completions";
    apiKey = openaiKey;
    model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  } else if (openRouterKey) {
    apiUrl = "https://openrouter.ai/api/v1/chat/completions";
    apiKey = openRouterKey;
    model = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";
  } else {
    return null;
  }

  const topic = req.customTopic?.trim() || req.categoryName;
  const difficultyLabel =
    req.difficulty === "mixed"
      ? "a mix of easy, medium, and hard"
      : req.difficulty;

  const system = `You are a quiz writer. Create clear, fair, fun trivia questions.
Return ONLY valid JSON in this exact shape:
{"title":"string","description":"string","questions":[{"text":"string","options":["A","B","C","D"],"correctIndex":0,"difficulty":"easy|medium|hard"}]}
Rules:
- Exactly ${req.count} questions
- Each question has exactly 4 short options
- correctIndex is 0-3 for the right answer
- No spoilers in the question text
- Facts must be accurate
- Keep language clean and family-friendly
- Vary the topics within the category`;

  const user = `Create a ${difficultyLabel} quiz about: ${topic}
Category: ${req.categoryName}`;

  try {
    const content = await callChatApi(apiUrl, apiKey, model, system, user);
    const parsed = JSON.parse(
      content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    );
    const items = parseAiQuestions(content);
    if (items.length === 0) return null;

    return {
      title: parsed.title || `${topic} Quiz`,
      description:
        parsed.description ||
        `An AI-generated ${req.difficulty} quiz about ${topic.toLowerCase()}.`,
      questions: aiToQuestions(items.slice(0, req.count), req.difficulty),
      source: "ai",
    };
  } catch {
    return null;
  }
}

export async function generateQuiz(
  req: GenerateRequest
): Promise<GenerateResult> {
  const ai = await generateWithAi(req);
  if (ai && ai.questions.length > 0) return ai;
  return generateFromLibrary(req);
}

export function hasAiConfigured(): boolean {
  return Boolean(
    process.env.GROQ_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.OPENROUTER_API_KEY
  );
}
