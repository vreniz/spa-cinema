// src/controllers/usersController.js
// Loads and renders the registered users table (admin only).
import { getUsers } from "@/services/userService.js";
import { badge } from "@/components/ui.js";
import { showToast } from "@/utils/toast.js";

// Build one table row. Admins get an "Active" tone, users a neutral one.
function userRow(user) {
  const roleTone = user.role === "admin" ? badge("Active") : badge("Active");
  return `
    <tr class="border-b border-slate-100 dark:border-slate-800 last:border-0">
      <td class="px-5 py-3 font-medium">${user.name}</td>
      <td class="px-5 py-3 text-slate-500 dark:text-slate-400">${user.email}</td>
      <td class="px-5 py-3"><span class="capitalize mr-2">${user.role}</span>${roleTone}</td>
    </tr>`;
}

// Controller entry point.
export async function initUsers() {
  const body = document.querySelector("#users-body");
  try {
    const users = await getUsers();
    body.innerHTML = users.map(userRow).join("");
  } catch {
    body.innerHTML = "";
    showToast("Could not load users. Is json-server running?", "error");
  }
}
