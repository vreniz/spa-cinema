# spa-cinema

A Single Page Application (SPA) for a cinema chain to manage **showtimes** and
**ticket reservations**, built with **Vanilla JavaScript**, **Vite** and
**Tailwind CSS v4**, consuming a simulated REST API powered by **json-server**.

---

## Project Name

**spa-cinema** is deployed on Vercel and available at [SPA-CINEMA](https://spa-cinema.vercel.app/)



## Description

`spa-cinema` modernizes the way a cinema chain manages its billboard and
bookings. It replaces a manual process (which caused seat overselling and poor
visibility of room occupancy) with a role-based web platform:

- **Standard users** browse the available billboard, reserve tickets, and
  manage their own reservations.
- **Administrators** create and manage showtimes, rooms, approve or cancel
  reservations, view all users, and monitor occupancy statistics.

The whole experience runs without page reloads: views are rendered dynamically
in JavaScript and navigation is handled with the browser **History API**.

## Technologies

| Tool | Purpose |
| --- | --- |
| **JavaScript (ES Modules, Vanilla)** | Application logic, DOM rendering, routing |
| **Vite `^8`** | Dev server and production bundler |
| **Tailwind CSS v4** (`@tailwindcss/vite`) | Utility-first styling (CSS-first config) |
| **json-server `^0.17`** | Mock REST API backed by `db.json` |
| **concurrently** | Runs Vite and json-server together with one command |
| **Fetch API** | HTTP communication with the mock API |
| **History API** | Clean client-side routing (no hash URLs) |
| **localStorage** | Session and theme persistence |

## Installation

```bash
# 1. Clone or download the project, then enter the folder
cd spa-cinema

# 2. Install dependencies
npm install
```

> Requires Node.js 18+.

## Running the Project

Start the Vite dev server **and** json-server together (recommended):

```bash
npm run dev
```

- App (Vite): `http://localhost:5173`
- API (json-server): `http://localhost:3001`

Production build / preview:

```bash
npm run build      # outputs to /dist
npm run preview    # serves the built app
```

## Running JSON Server

The `npm run dev` script already launches json-server via `concurrently`.
To run the mock API on its own:

```bash
npx json-server --watch db.json --port 3001
```

Available resources:

- `GET/POST/PUT/PATCH/DELETE  http://localhost:3001/shows`
- `GET/POST/PUT/PATCH/DELETE  http://localhost:3001/reservations`
- `GET/POST/PUT/PATCH/DELETE  http://localhost:3001/rooms`
- `GET                        http://localhost:3001/users`

## Test Users

All accounts use the password **`A123456`**.

| Email | Password | Role | Name |
| --- | --- | --- | --- |
| `admin@test.com` | `A123456` | admin | Administrador |
| `user@test.com`  | `A123456` | user  | Usuario |
| `user2@test.com` | `A123456` | user  | Usuario 2 |

## Project Structure

```
spa-cinema/
├── db.json                       # Mock database (users, rooms, shows, reservations)
├── index.html                    # SPA shell (#app + #toast-root)
├── package.json
├── README.md
├── main.js                       # Entry point: init theme + start router
├── theme.js                      # Dark mode persistence and toggle
├── tailwind.config.js
├── vite.config.js                # Tailwind plugin + "@" alias + history fallback
└── src/
    ├── components/
    │   ├── layout.js             # App shell: sidebar + header + content
    │   ├── sidebar.js            # Role-aware navigation
    │   ├── modal.js              # Reusable modal dialog
    │   └── ui.js                 # Shared render helpers (header, badge, card)
    ├── controllers/              # Behaviour for each view (events + data)
    │   ├── loginController.js
    │   ├── dashboardController.js
    │   ├── showsController.js
    │   ├── reservationsController.js
    │   ├── roomsController.js
    │   └── usersController.js
    ├── guards/
    │   └── authGuard.js          # Route protection (auth + role)
    ├── router/
    │   └── router.js             # History API router + route table
    ├── services/                 # API access layer
    │   ├── api.js                # Fetch wrapper
    │   ├── authService.js
    │   ├── showService.js
    │   ├── reservationService.js # CRUD + business rules
    │   ├── roomService.js
    │   └── userService.js
    ├── styles/
    │   └── main.css              # @import "tailwindcss" + dark variant
    ├── utils/
    │   ├── icons.js              # Inline SVG icon set
    │   ├── storage.js            # localStorage session helpers
    │   ├── toast.js              # Toast notifications
    │   ├── validators.js         # Regex form validation
    │   └── datetime.js           # Date helpers (e.g. "has the show started")
    └── views/                    # Pure functions returning HTML strings
        ├── login.js
        ├── dashboard.js
        ├── shows.js
        ├── reservations.js
        ├── rooms.js
        ├── users.js
        ├── profile.js
        ├── unauthorized.js
        └── notFound.js
```

## Role Permissions

| Action | Admin | User |
| --- | :---: | :---: |
| View dashboard | ✅ (global stats) | ✅ (personal stats) |
| Browse showtimes | ✅ (all) | ✅ (active only) |
| Create / edit / delete shows | ✅ | ❌ |
| Reserve tickets | — | ✅ |
| View reservations | ✅ (all) | ✅ (own only) |
| Approve (confirm) reservations | ✅ | ❌ |
| Cancel reservations | ✅ (any) | ✅ (own) |
| Edit reservation tickets | ✅ (any) | ✅ (own, before show starts) |
| Delete reservations | ✅ | ❌ |
| Manage rooms (`/rooms`) | ✅ | ❌ → **403 Unauthorized** |
| View users (`/users`) | ✅ | ❌ → **403 Unauthorized** |
| Edit profile / theme | ✅ | ✅ |

### Business rules enforced

- You cannot reserve more tickets than the available seats.
- A cancelled show cannot receive new reservations.
- A user can only modify reservations that are still active.
- Cancelled reservations cannot be reactivated.
- The administrator can modify any reservation.
- Available seats update automatically when a reservation is created, edited,
  or cancelled.

## Technical Decisions

- **History API routing (not hash-based).** `src/router/router.js` uses
  `history.pushState` and a `popstate` listener. Internal links carry a
  `data-link` attribute; a single delegated click handler intercepts them and
  navigates without reloading. Vite is configured with `historyApiFallback` so
  deep links (e.g. `/shows`) return `index.html`.

- **Route guards.** `src/guards/authGuard.js` exposes `resolveRedirect(route)`,
  a pure function that returns a redirect path (or `null`). It centralizes three
  rules: redirect authenticated users away from the login page, send anonymous
  users to login, and send the wrong role to `/unauthorized`. Unknown URLs fall
  through to a 404 view.

- **State & session management.** The authenticated session lives in
  `localStorage` (`src/utils/storage.js`), so it survives refreshes; logout
  clears it completely. The dark-mode preference is persisted the same way in
  `theme.js`. There is no global store: each controller fetches the data it
  needs and keeps it in module scope while the view is mounted.

- **Component architecture (view / controller / service).** Views are pure
  functions that return HTML strings; controllers attach events and load data
  after the view mounts; services own all API access. This separation keeps
  rendering, behaviour, and I/O independent and easy to reason about.

- **Low cyclomatic complexity.** Logic is split into many small, single-purpose
  functions (e.g. `assertCanReserve`, `applySeatDelta`, `clampSeats`). Decisions
  are flattened with early returns instead of deep nesting, keeping each
  function within a low complexity range.

- **Tailwind CSS v4, CSS-first.** Styling uses the `@tailwindcss/vite` plugin;
  `main.css` only needs `@import "tailwindcss"`. Class-based dark mode is enabled
  with `@custom-variant dark (&:where(.dark, .dark *))` so the theme can be
  toggled manually and all `dark:` utilities respond to a `.dark` class on
  `<html>`.

- **Inline SVG icons.** Icons are inline SVG strings that inherit `currentColor`,
  so they follow the theme automatically and require no icon-font dependency.

- **Resilient API layer.** A single `api` wrapper (`src/services/api.js`)
  centralizes the base URL and throws on non-2xx responses, letting controllers
  use `try/catch` and surface errors through toast notifications.

- **Login UX.** On submit the button is disabled to prevent duplicate requests.
  On any validation or authentication error the form is fully reset and focus
  returns to the email field.
