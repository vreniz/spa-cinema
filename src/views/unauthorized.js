// src/views/unauthorized.js
// Shown when an authenticated user tries to reach a route their role is not
// allowed to access (e.g. a standard user opening /rooms).
import { icon } from "@/utils/icons.js";

export function UnauthorizedView() {
  return `
    <div class="min-h-screen flex items-center justify-center p-4
                bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div class="text-center max-w-md">
        <div class="flex justify-center mb-4 text-rose-500">${icon("close", "w-16 h-16")}</div>
        <h1 class="text-5xl font-bold mb-2">403</h1>
        <p class="text-lg font-medium mb-1">Access denied</p>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">
          You do not have permission to view this page.
        </p>
        <a href="/dashboard" data-link
          class="inline-block rounded-lg bg-amber-500 text-slate-900 font-semibold px-5 py-2.5 text-sm
                 hover:bg-amber-400 transition-colors">
          Back to dashboard
        </a>
      </div>
    </div>`;
}
