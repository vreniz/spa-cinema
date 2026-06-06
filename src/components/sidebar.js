// src/components/sidebar.js
// Role-aware navigation sidebar. It only renders the links the current role is
// allowed to use and highlights the active route. Logout and theme controls
// live in the header (see layout.js), keeping the sidebar focused on nav.
import { icon } from "@/utils/icons.js";
import { getSession } from "@/utils/storage.js";

// Full navigation map. Each entry declares which roles may see it.
const NAV = [
  { path: "/dashboard", label: "Dashboard", icon: "grid", roles: ["admin", "user"] },
  { path: "/shows", label: "Showtimes", icon: "film", roles: ["admin", "user"] },
  { path: "/reservations", label: "Reservations", icon: "ticket", roles: ["admin", "user"] },
  { path: "/rooms", label: "Rooms", icon: "building", roles: ["admin"] },
  { path: "/users", label: "Users", icon: "users", roles: ["admin"] },
  { path: "/profile", label: "Profile", icon: "user", roles: ["admin", "user"] },
];

// Build a single nav link, marking it active when it matches the current URL.
function navLink(item, currentPath) {
  const active = item.path === currentPath;
  const base =
    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors";
  const state = active
    ? "bg-amber-500 text-slate-900"
    : "text-slate-300 hover:bg-slate-800 hover:text-white";
  return `
    <a href="${item.path}" data-link class="${base} ${state}">
      ${icon(item.icon, "w-5 h-5")}
      <span>${item.label}</span>
    </a>`;
}

// Render the sidebar for the current session/role.
export function Sidebar() {
  const session = getSession();
  const role = session ? session.role : "user";
  const currentPath = window.location.pathname;
  const links = NAV.filter((item) => item.roles.includes(role))
    .map((item) => navLink(item, currentPath))
    .join("");

  return `
    <div class="flex flex-col h-full">
      <div class="flex items-center gap-2 px-2 mb-8">
        ${icon("film", "w-8 h-8 text-amber-500")}
        <div>
          <h1 class="text-lg font-bold leading-tight text-white">SPA Cinema</h1>
          <p class="text-xs text-slate-400 capitalize">${role} panel</p>
        </div>
      </div>
      <nav class="flex flex-col gap-1">${links}</nav>
    </div>`;
}
