// src/controllers/dashboardController.js
// Loads data and renders the statistics cards. Admins see global occupancy and
// activity; standard users see a summary of their own reservations.
import { getShows } from "@/services/showService.js";
import { getReservations, getReservationsByUser } from "@/services/reservationService.js";
import { getSession } from "@/utils/storage.js";
import { icon } from "@/utils/icons.js";
import { card } from "@/components/ui.js";
import { showToast } from "@/utils/toast.js";

// Render a single statistic card.
function statCard({ label, value, name, accent }) {
  const inner = `
    <div class="p-5 flex items-center gap-4">
      <div class="w-11 h-11 rounded-xl flex items-center justify-center ${accent}">
        ${icon(name, "w-6 h-6")}
      </div>
      <div>
        <p class="text-2xl font-bold leading-tight">${value}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400">${label}</p>
      </div>
    </div>`;
  return card(inner);
}

// Compute the global occupancy percentage over active shows.
function occupancyPercent(shows) {
  const active = shows.filter((show) => show.status === "Active");
  const capacity = active.reduce((sum, show) => sum + show.totalCapacity, 0);
  const taken = active.reduce((sum, show) => sum + (show.totalCapacity - show.availableSeats), 0);
  if (capacity === 0) return 0;
  return Math.round((taken / capacity) * 100);
}

// Stats shown to administrators.
function adminStats(shows, reservations) {
  const activeShows = shows.filter((show) => show.status === "Active").length;
  return [
    { label: "Total shows", value: shows.length, name: "film", accent: "bg-amber-500/15 text-amber-500" },
    { label: "Active shows", value: activeShows, name: "calendar", accent: "bg-emerald-500/15 text-emerald-500" },
    { label: "Reservations", value: reservations.length, name: "ticket", accent: "bg-sky-500/15 text-sky-500" },
    { label: "Occupancy", value: `${occupancyPercent(shows)}%`, name: "chart", accent: "bg-violet-500/15 text-violet-500" },
  ];
}

// Stats shown to standard users (based on their own reservations).
function userStats(reservations) {
  const confirmed = reservations.filter((item) => item.status === "Confirmed").length;
  const pending = reservations.filter((item) => item.status === "Pending").length;
  const cancelled = reservations.filter((item) => item.status === "Cancelled").length;
  return [
    { label: "My reservations", value: reservations.length, name: "ticket", accent: "bg-amber-500/15 text-amber-500" },
    { label: "Confirmed", value: confirmed, name: "check", accent: "bg-emerald-500/15 text-emerald-500" },
    { label: "Pending", value: pending, name: "calendar", accent: "bg-sky-500/15 text-sky-500" },
    { label: "Cancelled", value: cancelled, name: "close", accent: "bg-rose-500/15 text-rose-500" },
  ];
}

// Fetch the data needed for the current role and return the stat definitions.
async function loadStats(session) {
  if (session.role === "admin") {
    const [shows, reservations] = await Promise.all([getShows(), getReservations()]);
    return adminStats(shows, reservations);
  }
  const reservations = await getReservationsByUser(session.id);
  return userStats(reservations);
}

// Controller entry point: load, compute, and paint the cards.
export async function initDashboard() {
  const container = document.querySelector("#dashboard-stats");
  const session = getSession();
  try {
    const stats = await loadStats(session);
    container.innerHTML = stats.map(statCard).join("");
  } catch {
    container.innerHTML = "";
    showToast("Could not load statistics. Is json-server running?", "error");
  }
}
