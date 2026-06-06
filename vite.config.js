// vite.config.js
// Vite configuration for the SPA.
// - Registers the Tailwind CSS v4 plugin (CSS-first, no PostCSS step required).
// - Defines the "@" alias so modules can be imported as "@/..." instead of
//   long relative paths. This keeps imports clean and refactor-friendly.
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      // "@/router/router.js" -> "<project>/src/router/router.js"
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // History API fallback: any deep URL (e.g. /shows) returns index.html so
    // the client-side router can take over instead of Vite returning a 404.
   //  historyApiFallback: true,
    watch{
      ignore:  ["**/db.json"],
    }
  }
});
