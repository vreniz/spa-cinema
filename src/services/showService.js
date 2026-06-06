// src/services/showService.js
// CRUD operations for "shows" (cinema showtimes). A new show starts with all
// seats available; seat counts are then adjusted by the reservation service.
import { api } from "@/services/api.js";

// List every show.
export function getShows() {
  return api.get("/shows");
}

// Fetch a single show by id.
export function getShow(id) {
  return api.get(`/shows/${id}`);
}

// Create a show. availableSeats is initialised to the total capacity.
export function createShow(data) {
  const show = {
    movie: data.movie,
    roomId: Number(data.roomId),
    date: data.date,
    time: data.time,
    totalCapacity: Number(data.totalCapacity),
    availableSeats: Number(data.totalCapacity),
    status: "Active",
  };
  return api.post("/shows", show);
}

// Update editable fields of an existing show (movie, room, date, time, status).
export function updateShow(id, data) {
  return api.patch(`/shows/${id}`, data);
}

// Delete a show permanently.
export function deleteShow(id) {
  return api.remove(`/shows/${id}`);
}
