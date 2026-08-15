# SteamStats Frontend

Angular 22 standalone SPA for the SteamStats dashboard. It talks only to this repo’s backend (`/api/v1`). It never receives `STEAM_API_KEY`.

Root setup (env, Docker, workspaces): [README.md](../README.md).

---

## Run

From the **repo root** (backend should already be on `:3000`):

```bash
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
│       ├── api/                 # openapi.json + generated/ (ng-openapi-gen)
│       ├── interfaces/          # re-exports of generated model names
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
              →  generated Api.invoke(getProfile | getLibrary | …)
                    →  HttpClient  →  /api/v1/...
```

TypeBox validates JSON on the **API**. The SPA only gets TypeScript types from codegen; the browser does not re-run those schemas.

Codegen is **not** automatic. After you change a backend route or TypeBox schema, from the **repo root**:

```bash
npm run generate:api
```

That writes (do not hand-edit):

- [`api/openapi.json`](src/app/api/openapi.json) — dumped spec
- [`api/generated/`](src/app/api/generated/) — `Api`, functions such as `getProfile` / `getLibrary`, request helpers

Commit both so Docker frontend builds do not need a running API. Backend loop (Steam service → plugin → route → schema): [backend/README.md](../backend/README.md).

Use the generated functions from stores and pages, for example `this.api.invoke(getProfile, { steamId })`. Do **not** add a hand-written `*.api.service.ts` or call `HttpClient` yourself for `/api/v1`.

Short names (`OwnedGame`, `SteamProfile`) are re-exported from [`interfaces/api.ts`](src/app/interfaces/api.ts) for templates and stores.

Cockatiel retries (5xx / network only; not aborted requests) run in [`retry.interceptor.ts`](src/app/interceptors/retry.interceptor.ts).

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
- New `/api/v1` endpoint: implement it on the backend (see [backend/README.md](../backend/README.md) Extending), then `npm run generate:api` from the repo root. Wire the new generated function through a store or page with `Api.invoke(...)`. Do not hand-edit `api/generated/` or add raw `HttpClient` wrappers.
- Prefer Tailwind utilities and `ss-*` classes; keep SCSS for Material overrides and Steam `innerHTML`.
