// src/services/userService.js
// Read-only access to the users collection, used by the admin "Users" view.
import { api } from "@/services/api.js";

// Fetch all registered users.
export function getUsers() {
  return api.get("/users");
}
