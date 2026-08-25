import { promises as fs } from "fs";
import path from "path";
import type { Quiz } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const QUIZ_FILE = path.join(DATA_DIR, "quizzes.json");

async function ensureStore() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(QUIZ_FILE);
  } catch {
    await fs.writeFile(QUIZ_FILE, "{}", "utf8");
  }
}

export async function loadSavedQuizzes(): Promise<Record<string, Quiz>> {
  try {
    await ensureStore();
    const raw = await fs.readFile(QUIZ_FILE, "utf8");
    return JSON.parse(raw || "{}") as Record<string, Quiz>;
  } catch {
    return {};
  }
}

export async function saveQuizToDisk(quiz: Quiz): Promise<void> {
  await ensureStore();
  const all = await loadSavedQuizzes();
  all[quiz.id] = { ...quiz, saved: true, updatedAt: Date.now() };
  await fs.writeFile(QUIZ_FILE, JSON.stringify(all, null, 2), "utf8");
}

export async function deleteQuizFromDisk(id: string): Promise<void> {
  await ensureStore();
  const all = await loadSavedQuizzes();
  delete all[id];
  await fs.writeFile(QUIZ_FILE, JSON.stringify(all, null, 2), "utf8");
}
