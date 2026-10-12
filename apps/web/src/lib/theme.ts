export type ThemePreference = "system" | "light" | "dark";

const THEME_STORAGE_KEY = "socialsphere-theme";
const THEME_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

let preference: ThemePreference | undefined;
const listeners = new Set<() => void>();

function savedPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(saved) ? saved : "system";
  } catch { return "system"; }
}

export function getThemeSnapshot(): ThemePreference {
  return preference ??= savedPreference();
}

export function getServerThemeSnapshot(): ThemePreference { return "system"; }

function applyTheme() {
  const theme = getThemeSnapshot();
  document.documentElement.dataset.theme = theme === "system" ? (matchMedia(THEME_MEDIA_QUERY).matches ? "dark" : "light") : theme;
}

export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  const media = matchMedia(THEME_MEDIA_QUERY);
  const onSystemChange = () => { if (getThemeSnapshot() === "system") applyTheme(); };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
    preference = savedPreference();
    applyTheme();
    listeners.forEach(notify => notify());
  };
  applyTheme();
  media.addEventListener("change", onSystemChange);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", onSystemChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function setThemePreference(theme: ThemePreference): boolean {
  preference = theme;
  applyTheme();
  listeners.forEach(notify => notify());
  try { localStorage.setItem(THEME_STORAGE_KEY, theme); return true; } catch { return false; }
}

// Apply the saved preference before the first paint to prevent a theme flash.
export const themeInitializationScript = `(()=>{let theme="system";try{const saved=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(saved==="light"||saved==="dark")theme=saved}catch{}document.documentElement.dataset.theme=theme==="system"?(matchMedia(${JSON.stringify(THEME_MEDIA_QUERY)}).matches?"dark":"light"):theme})();`;
