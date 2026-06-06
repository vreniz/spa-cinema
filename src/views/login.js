// src/views/login.js
// Standalone login page (rendered without the app layout). Provides the
// authentication form and a hint with the seeded demo credentials.
import { icon } from "@/utils/icons.js";

export function LoginView() {
  return `
    <div class="min-h-screen flex items-center justify-center p-4
                bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <div class="w-full max-w-md">
        <div class="flex items-center justify-center gap-3 mb-8">
          ${icon("film", "w-10 h-10 text-amber-500")}
          <h1 class="text-3xl font-bold tracking-tight">SPA Cinema</h1>
        </div>

        <div class="bg-slate-900/80 backdrop-blur rounded-2xl shadow-2xl border border-slate-800 p-8">
          <h2 class="text-xl font-semibold mb-1">Sign in</h2>
          <p class="text-sm text-slate-400 mb-6">Access the reservation panel</p>

          <!-- noValidate: validation is handled in JS so we control the UX -->
          <form id="loginForm" novalidate class="flex flex-col gap-4">
            <div>
              <label for="email" class="block text-sm mb-1 text-slate-300">Email</label>
              <input id="email" name="email" type="email" autocomplete="username"
                class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="admin@test.com" />
            </div>

            <div>
              <label for="password" class="block text-sm mb-1 text-slate-300">Password</label>
              <input id="password" name="password" type="password" autocomplete="current-password"
                class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="••••••" />
            </div>

            <button id="loginBtn" type="submit"
              class="mt-2 w-full rounded-lg bg-amber-500 text-slate-900 font-semibold py-2.5 text-sm
                     hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
              Sign in
            </button>
          </form>

          <div class="mt-6 text-xs text-slate-400 border-t border-slate-800 pt-4">
            <p class="font-medium text-slate-300 mb-1">Demo accounts (password: A123456)</p>
            <p>admin@test.com · user@test.com · user2@test.com</p>
          </div>
        </div>
      </div>
    </div>`;
}
