// src/services/reservationService.js
// Reservation CRUD plus the business rules from the spec:
//  - cannot reserve more tickets than available seats
//  - a cancelled show cannot receive new reservations
//  - cancelled reservations cannot be reactivated
//  - seat counts update automatically on create / cancel / edit
// Each rule lives in its own tiny helper to keep functions simple (low
// cyclomatic complexity) and individually testable.
import { api } from "@/services/api.js";
import { getShow } from "@/services/showService.js";
import { todayIso } from "@/utils/datetime.js";

// ---- Reads -------------------------------------------------------------

// All reservations (admin view).
export function getReservations() {
  return api.get("/reservations");
}

// Reservations belonging to a single user (standard user view).
export function getReservationsByUser(userId) {
  return api.get(`/reservations?userId=${userId}`);
}

// ---- Seat math ---------------------------------------------------------

// Keep a seat value within [0, totalCapacity].
function clampSeats(show, value) {
  if (value < 0) return 0;
  if (value > show.totalCapacity) return show.totalCapacity;
  return value;
}

// Apply a delta to a show's available seats (positive frees seats,
// negative reserves them) and persist it.
function applySeatDelta(show, delta) {
  const seats = clampSeats(show, show.availableSeats + delta);
  return api.patch(`/shows/${show.id}`, { availableSeats: seats });
}

// ---- Guards ------------------------------------------------------------

// Validate that a brand-new reservation is allowed for this show.
function assertCanReserve(show, tickets) {
  if (show.status !== "Active") throw new Error("This show is cancelled");
  if (tickets < 1) throw new Error("At least one ticket is required");
  if (tickets > show.availableSeats) throw new Error("Not enough seats available");
}

// Validate that an extra-seat request (when editing) can be fulfilled.
function assertSeatChange(show, extraNeeded) {
  if (extraNeeded > show.availableSeats) {
    throw new Error("Not enough seats available");
  }
}

// ---- Writes ------------------------------------------------------------

// Create a reservation: reserve the seats, then store the record as "Pending"
// so an administrator can approve (confirm) it later.
export async function createReservation({ userId, showId, tickets }) {
  const show = await getShow(showId);
  assertCanReserve(show, tickets);
  await applySeatDelta(show, -tickets);
  return api.post("/reservations", {
    userId: Number(userId),
    showId: Number(showId),
    tickets: Number(tickets),
    reservationDate: todayIso(),
    status: "Pending",
  });
}

// Change the ticket count of an active reservation, adjusting seats by the
// difference. Cancelled reservations cannot be modified.
export async function updateReservationTickets(id, newTickets) {
  const reservation = await api.get(`/reservations/${id}`);
  if (reservation.status === "Cancelled") {
    throw new Error("A cancelled reservation cannot be modified");
  }
  const show = await getShow(reservation.showId);
  const difference = newTickets - reservation.tickets; // >0 means more seats
  assertSeatChange(show, difference > 0 ? difference : 0);
  await applySeatDelta(show, -difference);
  return api.patch(`/reservations/${id}`, { tickets: Number(newTickets) });
}

// Approve a reservation (Pending -> Confirmed). Seats already reserved at
// creation time, so no seat change is needed here.
export function confirmReservation(id) {
  return api.patch(`/reservations/${id}`, { status: "Confirmed" });
}

// Cancel a reservation and return its seats to the show. A reservation that is
// already cancelled cannot be cancelled (or reactivated) again.
export async function cancelReservation(id) {
  const reservation = await api.get(`/reservations/${id}`);
  if (reservation.status === "Cancelled") {
    throw new Error("Reservation is already cancelled");
  }
  const show = await getShow(reservation.showId);
  await applySeatDelta(show, reservation.tickets);
  return api.patch(`/reservations/${id}`, { status: "Cancelled" });
}

// Hard-delete a reservation (admin only). Frees the seats if it was still
// active so seat counts stay accurate.
export async function deleteReservation(id) {
  const reservation = await api.get(`/reservations/${id}`);
  if (reservation.status !== "Cancelled") {
    const show = await getShow(reservation.showId);
    await applySeatDelta(show, reservation.tickets);
  }
  return api.remove(`/reservations/${id}`);
}
