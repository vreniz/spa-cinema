// main.js
// Application entry point. It wires up global styles, applies the saved theme
// before the first paint, and hands control to the client-side router.
import "./src/styles/main.css";
import { initTheme } from "./theme.js";
import { startRouter } from "@/router/router.js";

// Apply the persisted (or system) theme first so there is no light/dark flash.
initTheme();

// Boot the SPA: render the route that matches the current URL.
startRouter();
