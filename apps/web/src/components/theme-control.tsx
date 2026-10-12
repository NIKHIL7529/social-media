"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { isThemePreference } from "@/lib/theme";

export function ThemeControl() {
  const { theme, setTheme } = useTheme();

  return <fieldset aria-label="Color theme" className="theme-options flex shrink-0 gap-1 rounded-xl border border-line bg-surface-raised p-1">{[
    { value: "system", label: "System", icon: Monitor },
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
  ].map(({value, label, icon: OptionIcon}) => <label key={value} title={label} className={`flex cursor-pointer items-center gap-2 rounded-lg p-2 text-sm font-semibold focus-within:outline focus-within:outline-2 focus-within:outline-accent ${theme === value ? "bg-accent-soft text-accent-deep" : "text-ink-muted hover:bg-surface"}`}><input type="radio" name="color-theme" aria-label={label} checked={theme === value} onChange={() => { if (isThemePreference(value)) setTheme(value); }} className="sr-only" /><OptionIcon size={18} aria-hidden="true" /><span className="hidden sm:inline">{label}</span></label>)}</fieldset>;
}
