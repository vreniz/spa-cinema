// src/views/users.js
// Registered users screen shell (admin only). The table body is filled by the
// controller. Read-only by design — it satisfies "view all registered users".
import { pageHeader, card } from "@/components/ui.js";

export function UsersView() {
  const table = `
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th class="px-5 py-3 font-medium">Name</th>
            <th class="px-5 py-3 font-medium">Email</th>
            <th class="px-5 py-3 font-medium">Role</th>
          </tr>
        </thead>
        <tbody id="users-body">
          <tr><td class="px-5 py-3 text-slate-500" colspan="3">Loading users…</td></tr>
        </tbody>
      </table>
    </div>`;

  return `
    ${pageHeader("Users", "All registered accounts")}
    ${card(table, "overflow-hidden")}`;
}
