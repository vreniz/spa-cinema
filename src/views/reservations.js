// src/views/reservations.js
// Reservations screen shell. Admins manage every reservation; users see only
// their own. A status filter (All / Pending / Confirmed / Cancelled) is
// provided for convenience. The list is rendered by the controller.
import { pageHeader } from "@/components/ui.js";
import { getSession } from "@/utils/storage.js";

export function ReservationsView() {
  const isAdmin = getSession().role === "admin";
  const subtitle = isAdmin ? "All reservations across the cinema" : "Your reservations";

  return `
    ${pageHeader("Reservations", subtitle)}

    <div class="flex flex-wrap gap-3 mb-5">
      <select id="statusFilter"
        class="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900
               px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
        <option value="">All statuses</option>
        <option value="Pending">Pending</option>
        <option value="Confirmed">Confirmed</option>
        <option value="Cancelled">Cancelled</option>
      </select>
    </div>

    <div id="reservations-list" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <p class="text-sm text-slate-500 dark:text-slate-400">Loading reservations…</p>
    </div>`;
}
