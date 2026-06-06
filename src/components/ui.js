// src/components/ui.js
// Small presentational helpers reused by views to avoid repeating markup and
// to keep each view function short and readable.

// Map a domain status to a colored badge tone.
const TONES = {
  Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  Confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  Cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
};

// A pill-shaped status badge.
export function badge(status) {
  const tone = TONES[status] || "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200";
  return `<span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${tone}">${status}</span>`;
}

// A consistent page header with title, subtitle and an optional actions slot.
export function pageHeader(title, subtitle, actions = "") {
  return `
    <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h2 class="text-2xl font-bold">${title}</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">${subtitle}</p>
      </div>
      <div class="flex items-center gap-2">${actions}</div>
    </div>`;
}

// A surface card container.
export function card(inner, extra = "") {
  return `<div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
                      rounded-2xl shadow-sm ${extra}">${inner}</div>`;
}
