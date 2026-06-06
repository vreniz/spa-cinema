// src/components/layout.js
// Application shell shared by every authenticated view. It places the sidebar,
// a top header (mobile menu button, theme toggle, user info, logout) and the
// content area. `bindLayout` attaches the behaviour after the HTML is mounted.
import { Sidebar } from "@/components/sidebar.js";
import { icon } from "@/utils/icons.js";
import { getSession } from "@/utils/storage.js";
import { getCurrentTheme, toggleTheme } from "../../theme.js";
import { logout } from "@/services/authService.js";
import { navigateTo } from "@/router/router.js";
import { showToast } from "@/utils/toast.js";

// Wrap a view's HTML in the responsive layout. The sidebar is an off-canvas
// drawer on mobile and a fixed column on medium+ screens.
export function Layout(content) {
  const session = getSession();
  const name = session ? session.name : "";
  const themeIcon = getCurrentTheme() === "dark" ? "sun" : "moon";

  return `
    <div class="min-h-screen flex bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <!-- Sidebar (drawer on mobile) -->
      <aside id="sidebar"
        class="fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 p-4 transition-transform duration-300
               -translate-x-full md:translate-x-0 md:static md:z-auto">
        ${Sidebar()}
      </aside>

      <!-- Backdrop shown behind the mobile drawer -->
      <div id="backdrop" class="fixed inset-0 z-30 bg-black/50 hidden md:hidden"></div>

      <!-- Main column -->
      <div class="flex-1 flex flex-col min-w-0">
        <header class="flex items-center justify-between gap-3 px-4 py-3 bg-white border-b border-slate-200
                       dark:bg-slate-900 dark:border-slate-800">
          <button id="menuBtn" class="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open menu">${icon("menu")}</button>

          <div class="flex-1"></div>

          <button id="themeBtn" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle theme">${icon(themeIcon)}</button>

          <span class="hidden sm:block text-sm font-medium">${name}</span>

          <button id="logoutBtn"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-600
                   hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10">
            ${icon("logout", "w-4 h-4")}<span class="hidden sm:inline">Logout</span>
          </button>
        </header>

        <main class="flex-1 p-4 sm:p-6 view-enter">${content}</main>
      </div>
    </div>`;
}

// Open/close the mobile sidebar drawer.
function setDrawer(open) {
  const sidebar = document.querySelector("#sidebar");
  const backdrop = document.querySelector("#backdrop");
  sidebar.classList.toggle("-translate-x-full", !open);
  backdrop.classList.toggle("hidden", !open);
}

// Swap the header icon to reflect the active theme.
function refreshThemeIcon() {
  const btn = document.querySelector("#themeBtn");
  const next = getCurrentTheme() === "dark" ? "sun" : "moon";
  btn.innerHTML = icon(next);
}

// Perform logout: clear the session, notify, and return to the login page.
function handleLogout() {
  logout();
  showToast("Signed out", "info");
  navigateTo("/");
}

// Attach all layout event handlers. Called by the router right after mount.
export function bindLayout() {
  document.querySelector("#menuBtn")?.addEventListener("click", () => setDrawer(true));
  document.querySelector("#backdrop")?.addEventListener("click", () => setDrawer(false));
  document.querySelector("#themeBtn")?.addEventListener("click", () => {
    toggleTheme();
    refreshThemeIcon();
  });
  document.querySelector("#logoutBtn")?.addEventListener("click", handleLogout);
}
