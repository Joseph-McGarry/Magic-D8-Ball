export const CATEGORIES = [
  "Active",
  "Adventurous",
  "Artsy",
  "Creative",
  "Romantic",
  "Food & Drink",
  "Cozy / Stay-In",
  "Games & Competition",
  "Outdoors / Nature",
  "Culture & Events"
] as const;
export type Category = typeof CATEGORIES[number];
