// Color schemes; the palettes themselves live in globals.css as `[data-theme]` blocks.

export type Theme = { name: string; description: string };

export const themes: Theme[] = [
  { name: "default", description: "GitHub dark, the house style" },
  { name: "dracula", description: "purple haze for night owls" },
  { name: "matrix", description: "follow the white rabbit" },
  { name: "gruvbox", description: "retro groove, warm and earthy" },
  { name: "solarized", description: "precision colors, dark variant" },
];

export const DEFAULT_THEME = "default";
export const THEME_STORAGE_KEY = "term-folio:theme";

export function isTheme(name: string): boolean {
  return themes.some((t) => t.name === name);
}

export function currentTheme(): string {
  if (typeof document === "undefined") return DEFAULT_THEME;
  return document.documentElement.dataset.theme ?? DEFAULT_THEME;
}

export function applyTheme(name: string) {
  document.documentElement.dataset.theme = name;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, name);
  } catch {
    // Storage can be unavailable (private mode); the theme still applies for this visit.
  }
}

// Runs before first paint so a saved theme never flashes the default palette.
export const themeBootScript = `try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t&&${JSON.stringify(themes.map((t) => t.name))}.indexOf(t)>-1)document.documentElement.dataset.theme=t}catch(e){}`;
