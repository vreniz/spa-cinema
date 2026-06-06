// src/services/authService.js
// Authentication logic: validate credentials against json-server and manage
// the persisted session. The UI never talks to storage directly for auth.
import { api } from "@/services/api.js";
import { saveSession, getSession, clearSession } from "@/utils/storage.js";

// Build the public session object (never store the password).
function buildSession(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// Validate email + password against the users collection.
// Throws "Invalid credentials" when no matching user exists.
export async function login(email, password) {
  const matches = await api.get(`/users?email=${encodeURIComponent(email)}`);
  const user = matches.find((candidate) => candidate.password === password);
  if (!user) {
    throw new Error("Invalid credentials");
  }
  const session = buildSession(user);
  saveSession(session);
  return session;
}

// Clear all session data (clean logout).
export function logout() {
  clearSession();
}

// Re-export the current session getter for convenience.
export { getSession };
