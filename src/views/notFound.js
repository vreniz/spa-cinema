// src/views/notFound.js
// Fallback view for any URL that does not match a known route (404).
import { icon } from "@/utils/icons.js";
import { getSession } from "@/utils/storage.js";

export function NotFoundView() {
  // Send the user somewhere useful depending on whether they are signed in.
  const target = getSession() ? "/dashboard" : "/";
  const label = getSession() ? "Back to dashboard" : "Back to login";

  return `
    <div class="min-h-screen flex items-center justify-center p-4
                bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div class="text-center max-w-md">
        <div class="flex justify-center mb-4 text-amber-500">${icon("film", "w-16 h-16")}</div>
        <h1 class="text-5xl font-bold mb-2">404</h1>
        <p class="text-lg font-medium mb-1">Page not found</p>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">
          The page you are looking for does not exist.
        </p>
        <a href="${target}" data-link
          class="inline-block rounded-lg bg-amber-500 text-slate-900 font-semibold px-5 py-2.5 text-sm
                 hover:bg-amber-400 transition-colors">
          ${label}
        </a>
      </div>
    </div>`;
}
