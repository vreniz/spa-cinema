// src/views/shows.js
// Showtimes screen shell. Admins get a "New show" button; everyone gets a date
// filter and a search box (bonus features). The list itself is rendered by the
// controller into #shows-list.
import { pageHeader } from "@/components/ui.js";
import { icon } from "@/utils/icons.js";
import { getSession } from "@/utils/storage.js";

export function ShowsView() {
  const session = getSession();
  const isAdmin = session.role === "admin";

  // Admins can create shows; users only browse the billboard.
  const action = isAdmin
    ? `<button id="newShowBtn"
         class="flex items-center gap-2 rounded-lg bg-amber-500 text-slate-900 font-semibold
                px-4 py-2 text-sm hover:bg-amber-400 transition-colors">
         ${icon("plus", "w-4 h-4")} New show
       </button>`
    : "";

  const subtitle = isAdmin ? "Create and manage showtimes" : "Available Movies";

  return `
    ${pageHeader("Showtimes", subtitle, action)}

    <div class="flex flex-wrap gap-3 mb-5">
      <div class="relative flex-1 min-w-[180px]">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          ${icon("search", "w-4 h-4")}
        </span>
        <input id="searchInput" type="text" placeholder="Search movie…"
          class="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900
                 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
      </div>
      <input id="dateFilter" type="date"
        class="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900
               px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
      <button id="clearFilters"
        class="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm
               hover:bg-slate-100 dark:hover:bg-slate-800">Clear</button>
    </div>

    <div id="shows-list" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <p class="text-sm text-slate-500 dark:text-slate-400">Loading showtimes…</p>
    </div>`;
}
