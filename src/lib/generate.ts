import { nanoid } from "nanoid";
import type { Difficulty } from "./categories";
import { getCleanBank, QUESTION_BANKS, type BankQuestion } from "./question-banks";
import type { Question, QuestionType } from "./types";

export interface GenerateRequest {
  categoryId: string;
  categoryName: string;
  customTopic?: string;
  count: number;
  difficulty: Difficulty;
  variety?: boolean;
}

export interface GenerateResult {
  title: string;
  description: string;
  questions: Question[];
  source: "ai" | "library";
}

const VARIETY_CYCLE: QuestionType[] = [
  "multiple-choice",
  "true-false",
  "short-answer",
  "checkboxes",
  "ordering",
  "numeric",
  "dropdown",
  "matching",
  "fill-blank",
  "picture-choice",
  "ranking",
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function timing(difficulty: Difficulty, qDiff?: string) {
  const d = qDiff || difficulty;
  const timeLimit = d === "hard" ? 25 : d === "easy" ? 15 : 20;
  const points = d === "hard" ? 150 : d === "easy" ? 80 : 100;
  return { timeLimit, points };
}

function bankToQuestion(
  q: BankQuestion,
  difficulty: Difficulty,
  preferredType?: QuestionType
): Question {
  const options = q.options.map((text) => ({ id: nanoid(6), text }));
  const correctOptionId = options[q.correctIndex]?.id ?? options[0].id;
  const { timeLimit, points } = timing(difficulty, q.difficulty);
  const type = preferredType || "multiple-choice";

  if (type === "true-false") {
    const statement = q.text.replace(/\?$/, "");
    const opts = [
      { id: nanoid(6), text: "True" },
      { id: nanoid(6), text: "False" },
    ];
    return {
      id: nanoid(8),
      type: "true-false",
      text: `True or false: ${options[q.correctIndex]?.text} — ${statement}?`,
      options: opts,
      correctOptionId: opts[0].id,
      timeLimit,
      points,
    };
  }

  if (type === "short-answer" || type === "fill-blank") {
    const answer = options[q.correctIndex]?.text || "";
    return {
      id: nanoid(8),
      type,
      text:
        type === "fill-blank"
          ? `${q.text.replace(/\?$/, "")} → ___`
          : q.text,
      options: [],
      correctText: answer,
      correctTexts: [],
      timeLimit: timeLimit + 5,
      points,
    };
  }

  if (type === "dropdown" || type === "picture-choice") {
    const picOpts =
      type === "picture-choice"
        ? options.map((o, i) => ({
            ...o,
            imageUrl: ["🍎", "🍋", "🍇", "🍊", "🥝", "🍑"][i % 6],
          }))
        : options;
    return {
      id: nanoid(8),
      type,
      text: q.text,
      options: picOpts,
      correctOptionId,
      timeLimit,
      points,
    };
  }

  if (type === "checkboxes") {
    // Mark correct + one distractor as "select all that apply" loosely — keep only correct as required
    return {
      id: nanoid(8),
      type: "checkboxes",
      text: q.text.replace(/\?$/, "") + "? (Select all that apply — one is correct)",
      options,
      correctOptionIds: [correctOptionId],
      timeLimit,
      points,
    };
  }

  if (type === "ordering" || type === "ranking") {
    return {
      id: nanoid(8),
      type,
      text:
        type === "ranking"
          ? `Rank these related to: ${q.text}`
          : `Put these in a sensible order related to: ${q.text}`,
      options,
      correctOrder: options.map((o) => o.id),
      timeLimit: timeLimit + 10,
      points,
    };
  }

  if (type === "numeric") {
    // Extract a number from options if present, else use index+1
    const numMatch = options[q.correctIndex]?.text.match(/-?\d+(\.\d+)?/);
    const correctNumber = numMatch ? Number(numMatch[0]) : q.correctIndex + 1;
    return {
      id: nanoid(8),
      type: "numeric",
      text: q.text,
      options: [],
      correctNumber,
      numberTolerance: 0,
      timeLimit,
      points,
    };
  }

  if (type === "matching") {
    const left = options.slice(0, 3).map((o) => ({ ...o, side: "left" as const }));
    const rightTexts = shuffle(q.options).slice(0, 3);
    const right = rightTexts.map((text) => ({
      id: nanoid(6),
      text,
      side: "right" as const,
    }));
    // Match left[i] to the right item with same original text when possible
    const correctMatches: Record<string, string> = {};
    left.forEach((l, i) => {
      const match = right.find((r) => r.text === q.options[i]) || right[i];
      if (match) correctMatches[l.id] = match.id;
    });
    return {
      id: nanoid(8),
      type: "matching",
      text: `Match each item related to: ${q.text}`,
      options: [...left, ...right],
      correctMatches,
      timeLimit: timeLimit + 10,
      points,
    };
  }

  // default multiple-choice
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
  const questions = selected.map((q, i) =>
    bankToQuestion(
      q,
      req.difficulty,
      req.variety === false ? "multiple-choice" : VARIETY_CYCLE[i % VARIETY_CYCLE.length]
    )
  );

  while (questions.length < req.count && pool.length > 0) {
    const extra = shuffle(pool)[0];
    questions.push(
      bankToQuestion(
        extra,
        req.difficulty,
        VARIETY_CYCLE[questions.length % VARIETY_CYCLE.length]
      )
    );
  }

  return {
    title: `${topic} Quiz`,
    description: `A ${req.difficulty === "mixed" ? "varied" : req.difficulty} quiz about ${topic.toLowerCase()} with mixed question formats.`,
    questions,
    source: "library",
  };
}

interface AiRawQuestion {
  type?: string;
  text: string;
  options?: string[];
  correctIndex?: number;
  correctIndexes?: number[];
  correctText?: string;
  correctTexts?: string[];
  correctNumber?: number;
  numberTolerance?: number;
  left?: string[];
  right?: string[];
  correctMatches?: number[][]; // [[leftIdx, rightIdx], ...]
  correctOrder?: number[]; // indices into options
  imageHints?: string[];
  difficulty?: string;
}

function parseAiPayload(raw: string): {
  title?: string;
  description?: string;
  questions: AiRawQuestion[];
} {
  const cleaned = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  const parsed = JSON.parse(cleaned);
  const list = Array.isArray(parsed)
    ? parsed
    : parsed.questions || parsed.items || [];
  return {
    title: parsed.title,
    description: parsed.description,
    questions: list.filter((q: AiRawQuestion) => q?.text),
  };
}

function aiToQuestion(q: AiRawQuestion, difficulty: Difficulty): Question | null {
  const type = (q.type || "multiple-choice") as QuestionType;
  const { timeLimit, points } = timing(difficulty, q.difficulty);
  const id = nanoid(8);

  switch (type) {
    case "multiple-choice":
    case "dropdown":
    case "true-false":
    case "picture-choice": {
      let opts = (q.options || []).map((text, i) => ({
        id: nanoid(6),
        text: String(text),
        ...(type === "picture-choice"
          ? { imageUrl: q.imageHints?.[i] || ["🍎", "🍋", "🍇", "🍊"][i % 4] }
          : {}),
      }));
      if (type === "true-false") {
        opts = [
          { id: nanoid(6), text: "True" },
          { id: nanoid(6), text: "False" },
        ];
      }
      if (opts.length < 2) return null;
      const correctIndex = Math.min(
        Math.max(0, q.correctIndex ?? 0),
        opts.length - 1
      );
      return {
        id,
        type,
        text: q.text.trim(),
        options: opts,
        correctOptionId: opts[correctIndex].id,
        timeLimit,
        points,
      };
    }
    case "checkboxes": {
      const opts = (q.options || []).map((text) => ({
        id: nanoid(6),
        text: String(text),
      }));
      if (opts.length < 2) return null;
      const indexes = q.correctIndexes?.length
        ? q.correctIndexes
        : [q.correctIndex ?? 0];
      return {
        id,
        type,
        text: q.text.trim(),
        options: opts,
        correctOptionIds: indexes
          .map((i) => opts[i]?.id)
          .filter(Boolean) as string[],
        timeLimit,
        points,
      };
    }
    case "short-answer":
    case "fill-blank": {
      if (!q.correctText) return null;
      return {
        id,
        type,
        text: q.text.trim(),
        options: [],
        correctText: q.correctText,
        correctTexts: q.correctTexts || [],
        timeLimit: timeLimit + 5,
        points,
      };
    }
    case "long-answer":
      return {
        id,
        type,
        text: q.text.trim(),
        options: [],
        timeLimit: 60,
        points,
        autoGrade: false,
      };
    case "numeric": {
      if (q.correctNumber === undefined) return null;
      return {
        id,
        type,
        text: q.text.trim(),
        options: [],
        correctNumber: q.correctNumber,
        numberTolerance: q.numberTolerance ?? 0,
        timeLimit,
        points,
      };
    }
    case "matching": {
      const left = (q.left || []).map((text) => ({
        id: nanoid(6),
        text: String(text),
        side: "left" as const,
      }));
      const right = (q.right || []).map((text) => ({
        id: nanoid(6),
        text: String(text),
        side: "right" as const,
      }));
      if (left.length < 2 || right.length < 2) return null;
      const correctMatches: Record<string, string> = {};
      (q.correctMatches || left.map((_, i) => [i, i])).forEach(([li, ri]) => {
        if (left[li] && right[ri]) correctMatches[left[li].id] = right[ri].id;
      });
      return {
        id,
        type,
        text: q.text.trim(),
        options: [...left, ...right],
        correctMatches,
        timeLimit: timeLimit + 10,
        points,
      };
    }
    case "ordering":
    case "ranking": {
      const opts = (q.options || []).map((text) => ({
        id: nanoid(6),
        text: String(text),
      }));
      if (opts.length < 2) return null;
      const orderIdx = q.correctOrder?.length
        ? q.correctOrder
        : opts.map((_, i) => i);
      return {
        id,
        type,
        text: q.text.trim(),
        options: opts,
        correctOrder: orderIdx.map((i) => opts[i]?.id).filter(Boolean) as string[],
        timeLimit: timeLimit + 10,
        points,
      };
    }
    default:
      return null;
  }
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
    model =
      process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";
  } else {
    return null;
  }

  const topic = req.customTopic?.trim() || req.categoryName;
  const difficultyLabel =
    req.difficulty === "mixed"
      ? "a mix of easy, medium, and hard"
      : req.difficulty;

  const system = `You are an expert quiz designer. Create engaging, accurate trivia with VARIED question formats.

Return ONLY valid JSON:
{
  "title":"string",
  "description":"string",
  "questions":[ ... ]
}

Supported question types and required fields:
1. multiple-choice | dropdown | picture-choice: { "type","text","options":["A","B","C","D"],"correctIndex":0,"imageHints":["🍎","🍋","🍇","🍊"] optional for picture-choice }
2. true-false: { "type":"true-false","text":"statement?","correctIndex":0 } // 0=True, 1=False
3. checkboxes: { "type":"checkboxes","text","options":[...],"correctIndexes":[0,2] }
4. short-answer | fill-blank: { "type","text","correctText":"answer","correctTexts":["alt"] }
5. long-answer: { "type":"long-answer","text" }
6. numeric: { "type":"numeric","text","correctNumber":42,"numberTolerance":0 }
7. matching: { "type":"matching","text","left":["L1","L2","L3"],"right":["R1","R2","R3"],"correctMatches":[[0,0],[1,1],[2,2]] }
8. ordering | ranking: { "type","text","options":["first","second","third"],"correctOrder":[0,1,2] }

Rules:
- Exactly ${req.count} questions
- Mix at least 4 different types across Selection, Open Entry, and Arrangement families
- Prefer: multiple-choice, true-false, short-answer, ordering, checkboxes, matching, numeric, fill-blank
- Use long-answer at most once
- Facts must be accurate; family-friendly language
- Vary subtopics within the category`;

  const user = `Create a ${difficultyLabel} quiz about: ${topic}
Category: ${req.categoryName}
Include a healthy mix of Selection, Open Entry, and Arrangement question formats.`;

  try {
    const content = await callChatApi(apiUrl, apiKey, model, system, user);
    const parsed = parseAiPayload(content);
    const questions = parsed.questions
      .map((q) => aiToQuestion(q, req.difficulty))
      .filter((q): q is Question => !!q)
      .slice(0, req.count);

    if (questions.length === 0) return null;

    return {
      title: parsed.title || `${topic} Quiz`,
      description:
        parsed.description ||
        `An AI-generated ${req.difficulty} quiz about ${topic.toLowerCase()} with mixed formats.`,
      questions,
      source: "ai",
    };
  } catch {
    return null;
  }
}

export async function generateQuiz(
  req: GenerateRequest
): Promise<GenerateResult> {
  const ai = await generateWithAi({ ...req, variety: req.variety !== false });
  if (ai && ai.questions.length > 0) return ai;
  return generateFromLibrary({ ...req, variety: req.variety !== false });
}

export function hasAiConfigured(): boolean {
  return Boolean(
    process.env.GROQ_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.OPENROUTER_API_KEY
  );
}
