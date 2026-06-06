// src/router/router.js
// Client-side router built on the History API (NOT hash-based). It maps URL
// paths to a view (HTML) and an optional controller (behaviour), applies route
// guards, and renders inside #app without ever reloading the page.
import { resolveRedirect } from "@/guards/authGuard.js";
import { Layout, bindLayout } from "@/components/layout.js";

import { LoginView } from "@/views/login.js";
import { initLogin } from "@/controllers/loginController.js";
import { DashboardView } from "@/views/dashboard.js";
import { initDashboard } from "@/controllers/dashboardController.js";
import { ShowsView } from "@/views/shows.js";
import { initShows } from "@/controllers/showsController.js";
import { ReservationsView } from "@/views/reservations.js";
import { initReservations } from "@/controllers/reservationsController.js";
import { RoomsView } from "@/views/rooms.js";
import { initRooms } from "@/controllers/roomsController.js";
import { UsersView } from "@/views/users.js";
import { initUsers } from "@/controllers/usersController.js";
import { ProfileView } from "@/views/profile.js";
import { UnauthorizedView } from "@/views/unauthorized.js";
import { NotFoundView } from "@/views/notFound.js";

// Route table. `auth` marks protected routes; `roles` restricts by role;
// `layout: false` renders a standalone page (no sidebar/header).
const routes = [
  { path: "/", view: LoginView, controller: initLogin, auth: false, layout: false },
  { path: "/dashboard", view: DashboardView, controller: initDashboard, auth: true },
  { path: "/shows", view: ShowsView, controller: initShows, auth: true },
  { path: "/reservations", view: ReservationsView, controller: initReservations, auth: true },
  { path: "/rooms", view: RoomsView, controller: initRooms, auth: true, roles: ["admin"] },
  { path: "/users", view: UsersView, controller: initUsers, auth: true, roles: ["admin"] },
  { path: "/profile", view: ProfileView, auth: true },
  { path: "/unauthorized", view: UnauthorizedView, auth: true, layout: false },
];

// Fallback route for any URL that does not match the table (404).
const notFoundRoute = { path: "*", view: NotFoundView, auth: false, layout: false };

// Look up a route by exact path, or return the 404 route.
function findRoute(pathname) {
  return routes.find((route) => route.path === pathname) || notFoundRoute;
}

// Render a route's HTML (wrapped in the layout unless disabled) and run its
// controller. Kept linear and short on purpose.
async function mount(route) {
  const app = document.querySelector("#app");
  const content = route.view();

  if (route.layout === false) {
    app.innerHTML = content;
  } else {
    app.innerHTML = Layout(content);
    bindLayout(); // wire sidebar navigation, theme toggle and logout
  }

  if (route.controller) await route.controller();
}

// Resolve the current URL: find its route, check guards, then mount or redirect.
async function renderRoute() {
  const route = findRoute(window.location.pathname);
  const redirect = resolveRedirect(route);
  if (redirect) {
    navigateTo(redirect);
    return;
  }
  await mount(route);
}

// Programmatic navigation: push a new history entry and re-render. Used by the
// app code (e.g. after login) and by intercepted link clicks.
export function navigateTo(path) {
  window.history.pushState({}, "", path);
  renderRoute();
}

// Intercept clicks on elements marked with [data-link] so internal navigation
// stays within the SPA (no full page reload).
function handleLinkClick(event) {
  const link = event.target.closest("[data-link]");
  if (!link) return;
  event.preventDefault();
  navigateTo(link.getAttribute("href"));
}

// Boot the router: set up global listeners and render the first route.
export function startRouter() {
  document.addEventListener("click", handleLinkClick);
  window.addEventListener("popstate", renderRoute); // Back/Forward buttons
  renderRoute();
}
