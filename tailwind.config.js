// tailwind.config.js
// Tailwind CSS v4 is configured primarily from CSS (see src/styles/main.css).
// This file is kept minimal for editor tooling and to document the content
// sources that Tailwind scans for class names.
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,html}", "./main.js"],
  theme: {
    extend: {},
  },
  plugins: [],
};
