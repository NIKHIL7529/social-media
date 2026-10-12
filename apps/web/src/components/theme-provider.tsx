"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import toast from "react-hot-toast";

import { getThemeSnapshot, getServerThemeSnapshot, setThemePreference, subscribeTheme, type ThemePreference } from "@/lib/theme";

const ThemeContext = createContext<{ theme: ThemePreference; setTheme: (theme: ThemePreference) => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);
  function setTheme(preference: ThemePreference) {
    if (!setThemePreference(preference)) toast.error("Theme changed for this session. Your browser blocked saving the preference.");
  }
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider.");
  return context;
}
