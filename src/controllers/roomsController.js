// src/controllers/roomsController.js
// CRUD behaviour for the Rooms screen (admin only). Same pattern as shows:
// render cards, then create/edit/delete via a modal form.
import { getRooms, createRoom, updateRoom, deleteRoom } from "@/services/roomService.js";
import { badge, card } from "@/components/ui.js";
import { icon } from "@/utils/icons.js";
import { openModal, closeModal } from "@/components/modal.js";
import { showToast } from "@/utils/toast.js";

const ROOM_TYPES = ["2D", "3D", "IMAX"];
let rooms = [];

// One room card with edit/delete actions.
function roomCard(room) {
  const inner = `
    <div class="p-5">
      <div class="flex items-start justify-between gap-2 mb-3">
        <h3 class="font-semibold leading-tight">${room.name}</h3>
        ${badge(room.status)}
      </div>
      <dl class="text-sm text-slate-500 dark:text-slate-400 space-y-1 mb-4">
        <div class="flex justify-between"><dt>Type</dt><dd class="text-slate-700 dark:text-slate-200">${room.type}</dd></div>
        <div class="flex justify-between"><dt>Capacity</dt><dd class="text-slate-700 dark:text-slate-200">${room.capacity}</dd></div>
      </dl>
      <div class="flex items-center justify-end gap-1">
        <button data-action="edit" data-id="${room.id}"
          class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Edit">${icon("edit", "w-4 h-4")}</button>
        <button data-action="delete" data-id="${room.id}"
          class="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10" aria-label="Delete">${icon("trash", "w-4 h-4")}</button>
      </div>
    </div>`;
  return card(inner);
}

// Render the room list.
function renderList() {
  const list = document.querySelector("#rooms-list");
  list.innerHTML = rooms.length
    ? rooms.map(roomCard).join("")
    : `<p class="text-sm text-slate-500 dark:text-slate-400">No rooms yet.</p>`;
}

// Build type <option>s for the form.
function typeOptions(selected) {
  return ROOM_TYPES.map((type) => `<option ${type === selected ? "selected" : ""}>${type}</option>`).join("");
}

// Create/edit form markup.
function roomFormHtml(room) {
  const data = room || { name: "", capacity: 80, type: "2D", status: "Active" };
  return `
    <h3 class="text-lg font-semibold mb-4">${room ? "Edit room" : "New room"}</h3>
    <form id="roomForm" class="flex flex-col gap-3">
      <label class="block text-sm">Name
        <input name="name" value="${data.name}" required
          class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" /></label>
      <label class="block text-sm">Capacity
        <input name="capacity" type="number" min="1" value="${data.capacity}" required
          class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" /></label>
      <div class="grid grid-cols-2 gap-3">
        <label class="block text-sm">Type
          <select name="type" class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm">${typeOptions(data.type)}</select></label>
        <label class="block text-sm">Status
          <select name="status" class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm">
            <option ${data.status === "Active" ? "selected" : ""}>Active</option>
            <option ${data.status === "Inactive" ? "selected" : ""}>Inactive</option>
          </select></label>
      </div>
      <div class="flex justify-end gap-2 mt-2">
        <button type="button" data-close class="px-4 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
        <button type="submit" class="px-4 py-2 rounded-lg bg-amber-500 text-slate-900 font-semibold text-sm hover:bg-amber-400">Save</button>
      </div>
    </form>`;
}

// Reload from the API.
async function reload() {
  rooms = await getRooms();
  renderList();
}

// Open the create/edit modal and persist on submit.
function openRoomForm(room) {
  const panel = openModal(roomFormHtml(room));
  panel.querySelector("#roomForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.target;
    const data = { name: form.name.value.trim(), capacity: form.capacity.value, type: form.type.value, status: form.status.value };
    try {
      if (room) await updateRoom(room.id, data);
      else await createRoom(data);
      closeModal();
      showToast(room ? "Room updated" : "Room created", "success");
      await reload();
    } catch {
      showToast("Could not save the room", "error");
    }
  });
}

// Delete a room with confirmation.
async function removeRoom(id) {
  if (!window.confirm("Delete this room?")) return;
  try {
    await deleteRoom(id);
    showToast("Room deleted", "success");
    await reload();
  } catch {
    showToast("Could not delete the room", "error");
  }
}

// Delegate card clicks.
function handleListClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const id = Number(button.dataset.id);
  if (button.dataset.action === "edit") openRoomForm(rooms.find((room) => room.id === id));
  if (button.dataset.action === "delete") removeRoom(id);
}

// Controller entry point.
export async function initRooms() {
  try {
    await reload();
    document.querySelector("#newRoomBtn").addEventListener("click", () => openRoomForm(null));
    document.querySelector("#rooms-list").addEventListener("click", handleListClick);
  } catch {
    showToast("Could not load rooms. Is json-server running?", "error");
  }
}
