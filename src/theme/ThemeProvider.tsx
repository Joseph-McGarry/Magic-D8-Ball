import React, { createContext, useMemo } from "react";
import { useAppStore } from "../state/store";
import { themeById, ThemeTokens } from "./themes";

export const ThemeContext = createContext<ThemeTokens>(themeById("neonViolet"));

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeId = useAppStore((s) => s.settings.themeId);
  const theme = useMemo(() => themeById(themeId), [themeId]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
