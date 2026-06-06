// src/services/roomService.js
// CRUD operations for cinema rooms. Only administrators reach these (enforced
// by the router guards), so no role checks are needed here.
import { api } from "@/services/api.js";

// List all rooms.
export function getRooms() {
  return api.get("/rooms");
}

// Create a room with the given attributes.
export function createRoom(data) {
  const room = {
    name: data.name,
    capacity: Number(data.capacity),
    type: data.type,
    status: data.status || "Active",
  };
  return api.post("/rooms", room);
}

// Update an existing room.
export function updateRoom(id, data) {
  return api.patch(`/rooms/${id}`, data);
}

// Delete a room.
export function deleteRoom(id) {
  return api.remove(`/rooms/${id}`);
}
