// src/guards/authGuard.js
// Simulated route guard. Given a matched route and the current session, it
// returns a redirect path when access should be blocked, or null when the
// route may render. The router calls this before mounting any route.
import { getSession } from "@/utils/storage.js";

// Decide whether a route can be displayed.
// Rules, in priority order:
//  1. Visiting "/" (login) while already authenticated -> go to dashboard.
//  2. A route that needs auth but has no session -> go to login.
//  3. A role-restricted route accessed by the wrong role -> unauthorized page.
export function resolveRedirect(route) {
  const session = getSession();

  if (route.path === "/" && session) return "/dashboard";
  if (route.auth && !session) return "/";
  if (route.roles && session && !route.roles.includes(session.role)) {
    return "/unauthorized";
  }
  return null;
}
