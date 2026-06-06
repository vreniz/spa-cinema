// src/views/dashboard.js
// Dashboard shell. The statistics grid is filled by the controller once the
// data has loaded, so the user sees the page structure immediately.
import { pageHeader } from "@/components/ui.js";
import { getSession } from "@/utils/storage.js";

export function DashboardView() {
  const session = getSession();
  const subtitle =
    session.role === "admin"
      ? "Occupancy and activity across the cinema"
      : "A summary of your reservations";

  return `
    ${pageHeader(`Hello, ${session.name}`, subtitle)}
    <div id="dashboard-stats" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <p class="text-sm text-slate-500 dark:text-slate-400">Loading statistics…</p>
    </div>`;
}
