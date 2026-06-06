// src/views/rooms.js
// Rooms management screen shell (admin only; enforced by the router guard).
import { pageHeader } from "@/components/ui.js";
import { icon } from "@/utils/icons.js";

export function RoomsView() {
  const action = `
    <button id="newRoomBtn"
      class="flex items-center gap-2 rounded-lg bg-amber-500 text-slate-900 font-semibold
             px-4 py-2 text-sm hover:bg-amber-400 transition-colors">
      ${icon("plus", "w-4 h-4")} New room
    </button>`;

  return `
    ${pageHeader("Rooms", "Manage cinema rooms", action)}
    <div id="rooms-list" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <p class="text-sm text-slate-500 dark:text-slate-400">Loading rooms…</p>
    </div>`;
}
