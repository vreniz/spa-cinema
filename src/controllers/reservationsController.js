// src/controllers/reservationsController.js
// Behaviour for the Reservations screen. Enforces who can do what:
//  - admin: confirm (approve), cancel, or delete any reservation
//  - user: edit tickets (only while the show has not started) or cancel own
// All seat-count / status rules live in the reservation service.
import {
  getReservations,
  getReservationsByUser,
  confirmReservation,
  cancelReservation,
  deleteReservation,
  updateReservationTickets,
} from "@/services/reservationService.js";
import { getShows } from "@/services/showService.js";
import { getUsers } from "@/services/userService.js";
import { getSession } from "@/utils/storage.js";
import { formatDate, hasShowStarted } from "@/utils/datetime.js";
import { badge, card } from "@/components/ui.js";
import { icon } from "@/utils/icons.js";
import { openModal, closeModal } from "@/components/modal.js";
import { showToast } from "@/utils/toast.js";

// Screen state.
let reservations = [];
let shows = [];
let users = [];
let session = null;

// Lookup helpers.
function findShow(showId) {
  return shows.find((show) => show.id === showId) || null;
}
function userName(userId) {
  const user = users.find((item) => item.id === userId);
  return user ? user.name : `User #${userId}`;
}

// Admin action buttons depend on the reservation status.
function adminActions(reservation) {
  const confirmBtn =
    reservation.status === "Pending"
      ? `<button data-action="confirm" data-id="${reservation.id}"
           class="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10" aria-label="Confirm">
           ${icon("check", "w-4 h-4")}</button>`
      : "";
  const cancelBtn =
    reservation.status !== "Cancelled"
      ? `<button data-action="cancel" data-id="${reservation.id}"
           class="p-2 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10" aria-label="Cancel">
           ${icon("close", "w-4 h-4")}</button>`
      : "";
  return `${confirmBtn}${cancelBtn}
    <button data-action="delete" data-id="${reservation.id}"
      class="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10" aria-label="Delete">
      ${icon("trash", "w-4 h-4")}</button>`;
}

// User action buttons: edit (if show not started and not cancelled) + cancel.
function userActions(reservation) {
  const show = findShow(reservation.showId);
  const locked = reservation.status === "Cancelled" || (show && hasShowStarted(show));
  const editBtn = locked
    ? ""
    : `<button data-action="edit" data-id="${reservation.id}"
         class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Edit">
         ${icon("edit", "w-4 h-4")}</button>`;
  const cancelBtn =
    reservation.status === "Cancelled"
      ? ""
      : `<button data-action="cancel" data-id="${reservation.id}"
           class="p-2 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10" aria-label="Cancel">
           ${icon("close", "w-4 h-4")}</button>`;
  return `${editBtn}${cancelBtn}`;
}

// One reservation card.
function reservationCard(reservation) {
  const show = findShow(reservation.showId);
  const movie = show ? show.movie : "Unknown show";
  const when = show ? `${formatDate(show.date)} · ${show.time}` : "—";
  const actions = session.role === "admin" ? adminActions(reservation) : userActions(reservation);
  const owner = session.role === "admin" ? `<p class="text-xs text-slate-400 mt-1">By ${userName(reservation.userId)}</p>` : "";

  const inner = `
    <div class="p-5">
      <div class="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 class="font-semibold leading-tight">${movie}</h3>
          ${owner}
        </div>
        ${badge(reservation.status)}
      </div>
      <dl class="text-sm text-slate-500 dark:text-slate-400 space-y-1 mb-4">
        <div class="flex justify-between"><dt>Showtime</dt><dd class="text-slate-700 dark:text-slate-200">${when}</dd></div>
        <div class="flex justify-between"><dt>Tickets</dt><dd class="text-slate-700 dark:text-slate-200">${reservation.tickets}</dd></div>
        <div class="flex justify-between"><dt>Reserved on</dt><dd class="text-slate-700 dark:text-slate-200">${formatDate(reservation.reservationDate)}</dd></div>
      </dl>
      <div class="flex items-center justify-end gap-1">${actions}</div>
    </div>`;
  return card(inner);
}

// Filter by the selected status and render the list.
function renderList() {
  const status = document.querySelector("#statusFilter").value;
  const items = reservations.filter((item) => !status || item.status === status);
  const list = document.querySelector("#reservations-list");
  list.innerHTML = items.length
    ? items.map(reservationCard).join("")
    : `<p class="text-sm text-slate-500 dark:text-slate-400">No reservations found.</p>`;
}

// Reload reservations for the current role and re-render.
async function reload() {
  reservations =
    session.role === "admin"
      ? await getReservations()
      : await getReservationsByUser(session.id);
  renderList();
}

// Run a service action, then refresh with a success/error toast.
async function runAction(promise, successMessage) {
  try {
    await promise;
    showToast(successMessage, "success");
    await reload();
  } catch (error) {
    showToast(error.message || "Action failed", "error");
  }
}

// Open the "edit tickets" modal (users only) for an active reservation.
function openEditForm(reservation) {
  const show = findShow(reservation.showId);
  const max = show ? show.availableSeats + reservation.tickets : reservation.tickets;
  const panel = openModal(`
    <h3 class="text-lg font-semibold mb-4">Edit reservation</h3>
    <form id="editForm" class="flex flex-col gap-3">
      <label class="block text-sm">Tickets
        <input name="tickets" type="number" min="1" max="${max}" value="${reservation.tickets}" required
          class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" /></label>
      <div class="flex justify-end gap-2 mt-2">
        <button type="button" data-close class="px-4 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
        <button type="submit" class="px-4 py-2 rounded-lg bg-amber-500 text-slate-900 font-semibold text-sm hover:bg-amber-400">Save</button>
      </div>
    </form>`);

  panel.querySelector("#editForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const tickets = Number(event.target.tickets.value);
    closeModal();
    runAction(updateReservationTickets(reservation.id, tickets), "Reservation updated");
  });
}

// Map a delegated click to its action.
function handleListClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const id = Number(button.dataset.id);
  const action = button.dataset.action;
  if (action === "confirm") runAction(confirmReservation(id), "Reservation confirmed");
  if (action === "cancel") runAction(cancelReservation(id), "Reservation cancelled");
  if (action === "delete") runAction(deleteReservation(id), "Reservation deleted");
  if (action === "edit") openEditForm(reservations.find((item) => item.id === id));
}

// Controller entry point.
export async function initReservations() {
  session = getSession();
  try {
    // Admin needs user names; users only ever see their own records.
    const usersPromise = session.role === "admin" ? getUsers() : Promise.resolve([]);
    [shows, users] = await Promise.all([getShows(), usersPromise]);
    await reload();
    document.querySelector("#statusFilter").addEventListener("change", renderList);
    document.querySelector("#reservations-list").addEventListener("click", handleListClick);
  } catch {
    showToast("Could not load reservations. Is json-server running?", "error");
  }
}
