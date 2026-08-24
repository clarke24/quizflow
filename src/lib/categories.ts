export interface CategoryDef {
  id: string;
  name: string;
  description: string;
  accent: string;
  emoji: string;
}

export const QUIZ_CATEGORIES: CategoryDef[] = [
  {
    id: "movies",
    name: "Movies",
    description: "Film classics, blockbusters & cinema trivia",
    accent: "#e11d48",
    emoji: "🎬",
  },
  {
    id: "music",
    name: "Music",
    description: "Hits, artists, albums & music history",
    accent: "#8b5cf6",
    emoji: "🎵",
  },
  {
    id: "sports",
    name: "Sports",
    description: "Games, athletes, teams & championships",
    accent: "#059669",
    emoji: "⚽",
  },
  {
    id: "science",
    name: "Science",
    description: "Physics, biology, space & discoveries",
    accent: "#0284c7",
    emoji: "🔬",
  },
  {
    id: "history",
    name: "History",
    description: "World events, leaders & eras",
    accent: "#b45309",
    emoji: "📜",
  },
  {
    id: "geography",
    name: "Geography",
    description: "Countries, capitals, landmarks & maps",
    accent: "#0d9488",
    emoji: "🌍",
  },
  {
    id: "food",
    name: "Food & Drink",
    description: "Cuisine, cooking & culinary culture",
    accent: "#ea580c",
    emoji: "🍕",
  },
  {
    id: "tech",
    name: "Tech",
    description: "Computers, internet, gadgets & innovation",
    accent: "#4f46e5",
    emoji: "💻",
  },
  {
    id: "animals",
    name: "Animals",
    description: "Wildlife, pets & the natural world",
    accent: "#65a30d",
    emoji: "🦁",
  },
  {
    id: "pop-culture",
    name: "Pop Culture",
    description: "TV, celebrities, memes & trends",
    accent: "#db2777",
    emoji: "✨",
  },
  {
    id: "general",
    name: "General Knowledge",
    description: "A mix of everyday trivia",
    accent: "#6366f1",
    emoji: "🧠",
  },
  {
    id: "custom",
    name: "Custom Topic",
    description: "Describe any topic and generate from it",
    accent: "#64748b",
    emoji: "✏️",
  },
];

export type Difficulty = "easy" | "medium" | "hard" | "mixed";

export const DIFFICULTY_OPTIONS: { id: Difficulty; label: string }[] = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
  { id: "mixed", label: "Mixed" },
];
