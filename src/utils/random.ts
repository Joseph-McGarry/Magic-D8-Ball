import type { Idea } from "../state/store";

export function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickIdeasFromPool(pool: Idea[], count: 1 | 2): Idea[] {
  const shuffled = shuffle(pool);
  if (count === 1) return [shuffled[0]];
  // Caller must ensure pool.length >= 2 before requesting count=2 (roll() guards this).
  if (shuffled.length >= 2) return [shuffled[0], shuffled[1]];
  return [shuffled[0]];
}

export function coinFlip() {
  return Math.random() < 0.5 ? "heads" : "tails";
}

export function fiftyFifty<T>(a: T, b: T) {
  return Math.random() < 0.5 ? a : b;
}
