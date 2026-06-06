// theme.js
// Dark mode management. The chosen theme is persisted in localStorage so the
// preference survives page refreshes and new sessions.
const THEME_KEY = "cinema_theme";

// Read the saved theme, falling back to the OS preference the first time.
function getStoredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") return saved;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

// Apply a theme by toggling the `dark` class on <html>.
function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
}

// Called once on startup (before the first render) to avoid a flash.
export function initTheme() {
  applyTheme(getStoredTheme());
}

// Returns the current theme as a string.
export function getCurrentTheme() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

// Switch between light and dark, persist the choice, and return the new value.
export function toggleTheme() {
  const next = getCurrentTheme() === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
  return next;
}
