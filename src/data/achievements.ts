export type AchievementId =
  | "first_roll"
  | "three_rolls"
  | "ten_rolls"
  | "save_one"
  | "save_five"
  | "save_ten"
  | "custom_one"
  | "custom_five"
  | "filter_tweak"
  | "exclude_one"
  | "exclude_five"
  | "theme_two"
  | "theme_all"
  | "faceoff_one"
  | "faceoff_five"
  | "streak_two_days"
  | "streak_seven_days"
  | "late_night"
  | "early_bird"
  | "cozy_bias"
  | "outdoor_bias"
  | "culture_bias"
  | "reschedule_one"
  | "reminder_on"
  | "history_hoarder";

export type AchievementMeta = { id: AchievementId; title: string; flavor?: string; icon: string };
export const ACHIEVEMENTS: AchievementMeta[] = [
  { id: "first_roll", title: "First Roll", flavor: "You broke the seal.", icon: "sparkles" },
  { id: "three_rolls", title: "Getting Warm", flavor: "Three spins into destiny.", icon: "flame" },
  { id: "ten_rolls", title: "In the Zone", flavor: "Ten rolls. Keep going.", icon: "pulse" },
  { id: "save_one", title: "Plans, Please", flavor: "You saved your first date.", icon: "bookmark" },
  { id: "save_five", title: "Planner Energy", flavor: "Five dates on the books.", icon: "calendar" },
  { id: "save_ten", title: "Booked & Busy", flavor: "Ten future memories.", icon: "calendar-outline" },
  { id: "custom_one", title: "Personal Touch", flavor: "You added your own idea.", icon: "create" },
  { id: "custom_five", title: "Co-Creators", flavor: "Five custom ideas added.", icon: "brush" },
  { id: "filter_tweak", title: "Curator", flavor: "You adjusted your pool.", icon: "funnel" },
  { id: "exclude_one", title: "Not That One", flavor: "You excluded an idea.", icon: "ban" },
  { id: "exclude_five", title: "Quality Control", flavor: "Five ideas benched.", icon: "shield" },
  { id: "theme_two", title: "Neon Drifter", flavor: "Tried a second theme.", icon: "color-palette" },
  { id: "theme_all", title: "Spectrum", flavor: "Tried all themes.", icon: "prism" },
  { id: "faceoff_one", title: "Settled It", flavor: "First Face Off completed.", icon: "disc" },
  { id: "faceoff_five", title: "Referee", flavor: "Five Face Offs done.", icon: "trophy" },
  { id: "streak_two_days", title: "Back Tomorrow", flavor: "Used the app on 2 days.", icon: "sunny" },
  { id: "streak_seven_days", title: "One-Week Spark", flavor: "Used it across a week.", icon: "sparkles-outline" },
  { id: "late_night", title: "Midnight Magic", flavor: "Rolled late at night.", icon: "moon" },
  { id: "early_bird", title: "Early Spark", flavor: "Rolled early in the day.", icon: "sunrise" },
  { id: "cozy_bias", title: "Homebody", flavor: "Lots of cozy vibes lately.", icon: "home" },
  { id: "outdoor_bias", title: "Fresh Air", flavor: "Nature keeps calling.", icon: "leaf" },
  { id: "culture_bias", title: "Arts Patron", flavor: "Culture dates stack up.", icon: "ticket" },
  { id: "reschedule_one", title: "Life Happens", flavor: "You rescheduled a plan.", icon: "repeat" },
  { id: "reminder_on", title: "Nudge Me", flavor: "Scheduled a reminder.", icon: "notifications" },
  { id: "history_hoarder", title: "Memory Lane", flavor: "Built a healthy history.", icon: "time" },
];
