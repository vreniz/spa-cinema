// src/controllers/showsController.js
// Behaviour for the Showtimes screen:
//  - loads shows + rooms and renders responsive cards
//  - search by movie name and filter by date (bonus features)
//  - admin: create / edit / delete shows via a modal form
//  - user: reserve tickets via a modal (delegates rules to the service)
import { getShows, createShow, updateShow, deleteShow } from "@/services/showService.js";
import { getRooms } from "@/services/roomService.js";
import { createReservation } from "@/services/reservationService.js";
import { getSession } from "@/utils/storage.js";
import { formatDate } from "@/utils/datetime.js";
import { badge, card } from "@/components/ui.js";
import { icon } from "@/utils/icons.js";
import { openModal, closeModal } from "@/components/modal.js";
import { showToast } from "@/utils/toast.js";

// Module state for the active screen, refreshed every time it loads.
let shows = [];
let rooms = [];
let session = null;

// Resolve a room's display name from its id.
function roomName(roomId) {
  const room = rooms.find((item) => item.id === roomId);
  return room ? `${room.name} (${room.type})` : "—";
}

// Action buttons differ by role and show state.
function cardActions(show) {
  if (session.role === "admin") {
    return `
      <button data-action="edit" data-id="${show.id}"
        class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Edit">
        ${icon("edit", "w-4 h-4")}</button>
      <button data-action="delete" data-id="${show.id}"
        class="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10" aria-label="Delete">
        ${icon("trash", "w-4 h-4")}</button>`;
  }
  const disabled = show.status !== "Active" || show.availableSeats === 0;
  return `
    <button data-action="reserve" data-id="${show.id}" ${disabled ? "disabled" : ""}
      class="rounded-lg bg-amber-500 text-slate-900 font-semibold px-3 py-1.5 text-sm
             hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed">
      Reserve</button>`;
}

// One show card.
function showCard(show) {
  const inner = `
    <div class="p-5">
      <div class="flex items-start justify-between gap-2 mb-3">
        <h3 class="font-semibold leading-tight">${show.movie}</h3>
        ${badge(show.status)}
      </div>
      <dl class="text-sm text-slate-500 dark:text-slate-400 space-y-1 mb-4">
        <div class="flex justify-between"><dt>Room</dt><dd class="text-slate-700 dark:text-slate-200">${roomName(show.roomId)}</dd></div>
        <div class="flex justify-between"><dt>Date</dt><dd class="text-slate-700 dark:text-slate-200">${formatDate(show.date)} · ${show.time}</dd></div>
        <div class="flex justify-between"><dt>Seats</dt><dd class="text-slate-700 dark:text-slate-200">${show.availableSeats} / ${show.totalCapacity}</dd></div>
      </dl>
      <div class="flex items-center justify-end gap-1">${cardActions(show)}</div>
    </div>`;
  return card(inner);
}

// Apply search + date filters (and hide non-active shows from regular users).
function visibleShows() {
  const text = document.querySelector("#searchInput").value.trim().toLowerCase();
  const date = document.querySelector("#dateFilter").value;
  return shows.filter((show) => {
    const matchesText = show.movie.toLowerCase().includes(text);
    const matchesDate = !date || show.date === date;
    const visibleToRole = session.role === "admin" || show.status === "Active";
    return matchesText && matchesDate && visibleToRole;
  });
}

// Paint the filtered list (or an empty-state message).
function renderList() {
  const list = document.querySelector("#shows-list");
  const items = visibleShows();
  list.innerHTML = items.length
    ? items.map(showCard).join("")
    : `<p class="text-sm text-slate-500 dark:text-slate-400">No showtimes found.</p>`;
}

// Build the <option> list for the room selector.
function roomOptions(selectedId) {
  return rooms
    .map((room) => `<option value="${room.id}" ${room.id === selectedId ? "selected" : ""}>${room.name} · ${room.type}</option>`)
    .join("");
}

// Form markup for creating/editing a show (prefilled when editing).
function showFormHtml(show) {
  const data = show || { movie: "", roomId: rooms[0]?.id, date: "", time: "", totalCapacity: 100, status: "Active" };
  const title = show ? "Edit show" : "New show";
  const statusField = show
    ? `<label class="block text-sm">Status
         <select name="status" class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm">
           <option ${data.status === "Active" ? "selected" : ""}>Active</option>
           <option ${data.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
         </select></label>`
    : "";
  return `
    <h3 class="text-lg font-semibold mb-4">${title}</h3>
    <form id="showForm" class="flex flex-col gap-3">
      <label class="block text-sm">Movie
        <input name="movie" value="${data.movie}" required
          class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" /></label>
      <label class="block text-sm">Room
        <select name="roomId" class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm">${roomOptions(data.roomId)}</select></label>
      <div class="grid grid-cols-2 gap-3">
        <label class="block text-sm">Date
          <input name="date" type="date" value="${data.date}" required
            class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" /></label>
        <label class="block text-sm">Time
          <input name="time" type="time" value="${data.time}" required
            class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" /></label>
      </div>
      <label class="block text-sm">Total capacity
        <input name="totalCapacity" type="number" min="1" value="${data.totalCapacity}" required
          class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" /></label>
      ${statusField}
      <div class="flex justify-end gap-2 mt-2">
        <button type="button" data-close class="px-4 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
        <button type="submit" class="px-4 py-2 rounded-lg bg-amber-500 text-slate-900 font-semibold text-sm hover:bg-amber-400">Save</button>
      </div>
    </form>`;
}

// Read form values into a plain object.
function readShowForm(form) {
  return {
    movie: form.movie.value.trim(),
    roomId: form.roomId.value,
    date: form.date.value,
    time: form.time.value,
    totalCapacity: form.totalCapacity.value,
    status: form.status ? form.status.value : "Active",
  };
}

// Reload data from the API and re-render the list.
async function reload() {
  shows = await getShows();
  renderList();
}

// Open the create/edit modal and handle submission.
function openShowForm(show) {
  const panel = openModal(showFormHtml(show));
  const form = panel.querySelector("#showForm");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = readShowForm(form);
    try {
      if (show) await updateShow(show.id, data);
      else await createShow(data);
      closeModal();
      showToast(show ? "Show updated" : "Show created", "success");
      await reload();
    } catch {
      showToast("Could not save the show", "error");
    }
  });
}

// Delete a show after confirmation.
async function removeShow(id) {
  if (!window.confirm("Delete this show?")) return;
  try {
    await deleteShow(id);
    showToast("Show deleted", "success");
    await reload();
  } catch {
    showToast("Could not delete the show", "error");
  }
}

// Open the reservation modal for a user and create the reservation.
function openReserveForm(show) {
  const panel = openModal(`
    <h3 class="text-lg font-semibold mb-1">Reserve tickets</h3>
    <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">${show.movie} · ${show.availableSeats} seats left</p>
    <form id="reserveForm" class="flex flex-col gap-3">
      <label class="block text-sm">Tickets
        <input name="tickets" type="number" min="1" max="${show.availableSeats}" value="1" required
          class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" /></label>
      <div class="flex justify-end gap-2 mt-2">
        <button type="button" data-close class="px-4 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
        <button type="submit" class="px-4 py-2 rounded-lg bg-amber-500 text-slate-900 font-semibold text-sm hover:bg-amber-400">Confirm</button>
      </div>
    </form>`);

  panel.querySelector("#reserveForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const tickets = Number(event.target.tickets.value);
    try {
      await createReservation({ userId: session.id, showId: show.id, tickets });
      closeModal();
      showToast("Reservation created (pending approval)", "success");
      await reload();
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

// Route a delegated card-button click to the right handler.
function handleListClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const id = Number(button.dataset.id);
  const show = shows.find((item) => item.id === id);
  if (button.dataset.action === "edit") openShowForm(show);
  if (button.dataset.action === "delete") removeShow(id);
  if (button.dataset.action === "reserve") openReserveForm(show);
}

// Attach filter + button listeners.
function bindEvents() {
  document.querySelector("#searchInput").addEventListener("input", renderList);
  document.querySelector("#dateFilter").addEventListener("change", renderList);
  document.querySelector("#clearFilters").addEventListener("click", () => {
    document.querySelector("#searchInput").value = "";
    document.querySelector("#dateFilter").value = "";
    renderList();
  });
  document.querySelector("#newShowBtn")?.addEventListener("click", () => openShowForm(null));
  document.querySelector("#shows-list").addEventListener("click", handleListClick);
}

// Controller entry point.
export async function initShows() {
  session = getSession();
  try {
    [shows, rooms] = await Promise.all([getShows(), getRooms()]);
    renderList();
    bindEvents();
  } catch {
    showToast("Could not load showtimes. Is json-server running?", "error");
  }
}
