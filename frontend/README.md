# SteamStats Frontend

Angular 22 standalone SPA for the SteamStats dashboard. It talks only to this repo’s backend (`/api/v1`). It never receives `STEAM_API_KEY`.

Root setup (env, Docker, workspaces): [README.md](../README.md).

---

## Run

From the **repo root** (backend should already be on `:3000`):

```bash
npm run build:shared
npm run dev:frontend
```

UI: http://localhost:4200

`ng serve` uses [`proxy.conf.dev.json`](proxy.conf.dev.json) so `/api` goes to `http://localhost:3000`.

Docker Compose (dev) uses [`proxy.conf.json`](proxy.conf.json) (`http://backend:3000`) and `--host 0.0.0.0`.

---

## Layout

```text
frontend/
├── src/
│   ├── main.ts
│   ├── styles.scss              # Tailwind theme + ss-panel utilities
│   ├── material-theme.scss
│   └── app/
│       ├── app.ts / app.html    # shell: toolbar, sidenav, footer
│       ├── app.routes.ts
│       ├── api/                 # ApiService + profile/library/game/cache
│       ├── components/
│       ├── pages/
│       ├── services/            # SteamSessionService, GameDetailsStore
│       ├── interceptors/
│       └── utils/
├── proxy.conf.json
├── proxy.conf.dev.json
├── nginx.conf
├── dockerfile
├── dockerfile.dev
└── package.json
```

Shared surfaces: `ss-panel`, `ss-panel-muted`, `ss-panel-error`, `ss-link` in `src/styles.scss`. Material sidenav/collapsed-rail rules stay in `src/app/app.scss`. Game-details Steam HTML (`.prose-steam`) stays in `pages/gamedetails/game-details.scss`.

---

## Routes

| Path | Page |
| ---- | ---- |
| `/dashboard` | Search + profile summary + stats |
| `/library` | Filterable owned games |
| `/random` | Random owned game |
| `/statistics` | Playtime distribution |
| `/settings` | Clear session |
| `/game-details/:id` | Store details for one app |
| `/privacy`, `/terms` | Legal |

Unknown paths redirect to dashboard.

---

## Data flow

```text
Page  →  SteamSessionService / GameDetailsStore
              →  ProfileApiService / LibraryApiService / GameApiService
                    →  ApiService.request()  →  /api/v1/...
```

- [`ApiService`](src/app/api/api.service.ts) — generic HTTP + cockatiel retries
- Per-resource APIs under `src/app/api/` — paths and types only
- [`SteamSessionService`](src/app/services/steam-session.service.ts) — active Steam ID, profile, library
- [`GameDetailsStore`](src/app/services/game-details.store.ts) — Store details with a short local cache

Library card art uses [`steam-artwork.ts`](src/app/utils/steam-artwork.ts) (CDN fallbacks). Hashed `header.jpg` URLs for some new titles only appear on game details (`header_image` from Store `appdetails`).

---

## Build and Docker

```bash
npm run build --workspace=frontend -- --configuration production
```

Output: `frontend/dist/steamstats/browser`.

| File | Role |
| ---- | ---- |
| `dockerfile.dev` | `ng serve` for `docker compose.yml` (port 4200) |
| `dockerfile` | nginx image for `docker-compose.prod.example.yml` (host 8080 → container 80) |
| `nginx.conf` | SPA fallback + `/api/` proxy to the `backend` service |

---

## Extending

- New page: add a route in `app.routes.ts` and a folder under `pages/`.
- New backend call: add a method on the matching `*.api.service.ts` that calls `this.api.request({ path, method, ... })`.
- Prefer Tailwind utilities and `ss-*` classes; keep SCSS for Material overrides and Steam `innerHTML`.
