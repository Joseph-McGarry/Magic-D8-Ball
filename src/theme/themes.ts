export type ThemeId =
  | "neonViolet"
  | "neonCyan"
  | "neonMagenta"
  | "neonLime"
  | "neonSunset"
  | "neonMono";

export type ThemeTokens = {
  id: ThemeId;
  name: string;
  background: [string, string, string];
  glow: string;
  card: string;
  cardBorder: string;
  text: string;
  mutedText: string;
  button: string;
  buttonText: string;
  tabActive: string;
};

export const THEMES: ThemeTokens[] = [
  {
    id: "neonViolet",
    name: "Neon Violet",
    background: ["#0B0618", "#2B0B5E", "#7A00FF"],
    glow: "#E44CFF",
    card: "rgba(15, 10, 30, 0.55)",
    cardBorder: "rgba(255,255,255,0.12)",
    text: "#FFFFFF",
    mutedText: "rgba(255,255,255,0.72)",
    button: "rgba(228, 76, 255, 0.20)",
    buttonText: "#FFFFFF",
    tabActive: "#E44CFF",
  },
  {
    id: "neonCyan",
    name: "Neon Cyan",
    background: ["#050A14", "#003B5C", "#00E5FF"],
    glow: "#00E5FF",
    card: "rgba(5, 10, 20, 0.58)",
    cardBorder: "rgba(255,255,255,0.12)",
    text: "#FFFFFF",
    mutedText: "rgba(255,255,255,0.72)",
    button: "rgba(0, 229, 255, 0.18)",
    buttonText: "#FFFFFF",
    tabActive: "#00E5FF",
  },
  {
    id: "neonMagenta",
    name: "Neon Magenta",
    background: ["#120015", "#4A003D", "#FF2EE6"],
    glow: "#FF2EE6",
    card: "rgba(18, 0, 21, 0.56)",
    cardBorder: "rgba(255,255,255,0.12)",
    text: "#FFFFFF",
    mutedText: "rgba(255,255,255,0.72)",
    button: "rgba(255, 46, 230, 0.18)",
    buttonText: "#FFFFFF",
    tabActive: "#FF2EE6",
  },
  {
    id: "neonLime",
    name: "Neon Lime",
    background: ["#041008", "#0F3B1B", "#8CFF3D"],
    glow: "#8CFF3D",
    card: "rgba(4, 16, 8, 0.56)",
    cardBorder: "rgba(255,255,255,0.12)",
    text: "#FFFFFF",
    mutedText: "rgba(255,255,255,0.72)",
    button: "rgba(140, 255, 61, 0.16)",
    buttonText: "#FFFFFF",
    tabActive: "#8CFF3D",
  },
  {
    id: "neonSunset",
    name: "Neon Sunset",
    background: ["#10030A", "#4B0A2A", "#FF7A00"],
    glow: "#FF4EDB",
    card: "rgba(16, 3, 10, 0.56)",
    cardBorder: "rgba(255,255,255,0.12)",
    text: "#FFFFFF",
    mutedText: "rgba(255,255,255,0.72)",
    button: "rgba(255, 122, 0, 0.16)",
    buttonText: "#FFFFFF",
    tabActive: "#FF7A00",
  },
  {
    id: "neonMono",
    name: "Neon Mono",
    background: ["#000000", "#121212", "#2A2A2A"],
    glow: "#FFFFFF",
    card: "rgba(0, 0, 0, 0.55)",
    cardBorder: "rgba(255,255,255,0.14)",
    text: "#FFFFFF",
    mutedText: "rgba(255,255,255,0.72)",
    button: "rgba(255, 255, 255, 0.10)",
    buttonText: "#FFFFFF",
    tabActive: "#FFFFFF",
  },
];

export const themeById = (id: ThemeId) => THEMES.find(t => t.id === id) ?? THEMES[0];
