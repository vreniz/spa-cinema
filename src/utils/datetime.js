// src/utils/datetime.js
// Small date/time helpers shared across views. Centralising them keeps the
// "has the show already started?" rule consistent everywhere it is used.

// Build a Date from a show's "date" (YYYY-MM-DD) and "time" (HH:mm) fields.
export function getShowDateTime(show) {
  return new Date(`${show.date}T${show.time}:00`);
}

// True when the show's scheduled start is in the past. Users may only edit
// reservations for shows that have NOT started yet.
export function hasShowStarted(show) {
  return getShowDateTime(show).getTime() <= Date.now();
}

// Human-friendly date label, e.g. "Jun 12, 2026".
export function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Today's date as YYYY-MM-DD, handy as a default form value.
export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
