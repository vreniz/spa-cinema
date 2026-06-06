// src/utils/storage.js
// Thin wrapper around localStorage used to persist the authenticated session.
// Keeping all storage access here means the rest of the app never touches
// localStorage keys directly, which makes the session logic easy to change.
const SESSION_KEY = "cinema_session";

// Persist the session object as JSON. Called right after a successful login.
export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

// Return the stored session, or null if there is none / it is corrupted.
export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    // Defensive: if the stored value is not valid JSON, treat it as no session.
    return null;
  }
}

// Completely remove session data (used on logout for a clean state).
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// Convenience boolean for guards and views.
export function isAuthenticated() {
  return getSession() !== null;
}
