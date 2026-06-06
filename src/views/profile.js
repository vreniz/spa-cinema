// src/views/profile.js
// Read-only profile page built directly from the persisted session. No API
// call is needed, so this view has no controller.
import { getSession } from "@/utils/storage.js";
import { pageHeader, card, badge } from "@/components/ui.js";
import { icon } from "@/utils/icons.js";

// One labelled row inside the profile card.
function row(label, value) {
  return `
    <div class="flex justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span class="text-sm text-slate-500 dark:text-slate-400">${label}</span>
      <span class="text-sm font-medium">${value}</span>
    </div>`;
}

export function ProfileView() {
  const session = getSession();
  const roleBadge = session.role === "admin" ? badge("Active") : badge("Confirmed");

  const body = `
    <div class="p-6">
      <div class="flex items-center gap-4 mb-6">
        <div class="w-16 h-16 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center">
          ${icon("user", "w-8 h-8")}
        </div>
        <div>
          <p class="text-lg font-bold">${session.name}</p>
          <p class="text-sm text-slate-500 dark:text-slate-400 capitalize">${session.role}</p>
        </div>
      </div>
      ${row("Name", session.name)}
      ${row("Email", session.email)}
      ${row("Role", `<span class="capitalize">${session.role}</span> ${roleBadge}`)}
      ${row("User ID", String(session.id))}
    </div>`;

  return `
    ${pageHeader("Profile", "Your account details")}
    <div class="max-w-lg">${card(body)}</div>`;
}
