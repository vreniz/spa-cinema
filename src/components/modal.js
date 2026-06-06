// src/components/modal.js
// A generic, reusable modal dialog. Views build their form HTML and pass it to
// `openModal`; the controller then queries fields inside the returned panel.
// Keeping modal plumbing here avoids duplicating overlay markup in every CRUD
// screen.
let host = null;

// Lazily create (once) the element that hosts modals.
function getHost() {
  if (host) return host;
  host = document.createElement("div");
  document.body.appendChild(host);
  return host;
}

// Remove any open modal from the DOM.
export function closeModal() {
  getHost().innerHTML = "";
}

// Open a modal containing `innerHtml` and return its panel element so the
// caller can bind inputs/buttons. Closing happens on overlay click or on any
// element marked with [data-close].
export function openModal(innerHtml) {
  const root = getHost();
  root.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div data-close class="absolute inset-0 bg-black/60"></div>
      <div id="modal-panel"
        class="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl
               border border-slate-200 dark:border-slate-800 p-6">
        ${innerHtml}
      </div>
    </div>`;

  root.querySelectorAll("[data-close]").forEach((el) =>
    el.addEventListener("click", closeModal)
  );
  return root.querySelector("#modal-panel");
}
