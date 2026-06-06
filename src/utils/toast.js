// src/utils/toast.js
// Lightweight toast notifications. A single function appends a styled element
// to #toast-root, animates it in, and removes it automatically after a delay.
import { icon } from "@/utils/icons.js";

// Color + icon mapping per toast type.
const VARIANTS = {
  success: { color: "bg-emerald-600", icon: "check" },
  error: { color: "bg-rose-600", icon: "close" },
  info: { color: "bg-sky-600", icon: "ticket" },
  warning: { color: "bg-amber-500", icon: "calendar" },
};

// Fade/slide a toast out, then remove it from the DOM.
function dismiss(el) {
  el.classList.add("opacity-0", "translate-x-4");
  setTimeout(() => el.remove(), 300);
}

// Public API: show a message. `type` is one of VARIANTS keys.
export function showToast(message, type = "info") {
  const root = document.querySelector("#toast-root");
  if (!root) return;

  const variant = VARIANTS[type] || VARIANTS.info;
  const el = document.createElement("div");
  el.className = `flex items-center gap-2 ${variant.color} text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg opacity-0 translate-x-4 transition-all duration-300`;
  el.innerHTML = `${icon(variant.icon, "w-4 h-4 shrink-0")}<span>${message}</span>`;
  root.appendChild(el);

  // Trigger the enter transition on the next frame.
  requestAnimationFrame(() => el.classList.remove("opacity-0", "translate-x-4"));

  // Auto-dismiss after 3 seconds.
  setTimeout(() => dismiss(el), 3000);
}
