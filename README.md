# SteamStats

A Steam companion dashboard for exploring public profile and library data.

Enter a **SteamID64** or **Steam profile URL** to view:

- Profile information
- Owned games and playtime
- Recently played games
- Simple library statistics
- A random game picker

Steam credentials never leave the backend. The browser only talks to this app’s `/api/v1` routes.

SteamStats is an **npm workspaces** monorepo:

| Package | Role |
| ------- | ---- |
| `frontend/` | Angular 22 SPA (Material + Tailwind) |
| `backend/` | Fastify API that proxies Steam Web API and Store `appdetails` |
| `shared/` | Type-only `@steamstats/shared` interfaces |

More detail: [backend/README.md](backend/README.md) · [frontend/README.md](frontend/README.md)

---

## Prerequisites

- Node.js 22+
- npm 10+
- A [Steam Web API key](https://steamcommunity.com/dev/apikey)
- Docker + Docker Compose (optional)

---

## Setup

```bash
git clone https://github.com/slurrps-mcgee/SteamStats.git
cd SteamStats
cp .env.example .env
```

Edit `.env`:

| Variable | Purpose |
| -------- | ------- |
| `STEAM_API_KEY` | Steam Web API key (required; never expose to the browser) |
| `FRONTEND_ORIGIN` | CORS origin of the UI |
| `RATE_LIMIT_MAX` | Max requests per window |
| `RATE_LIMIT_WINDOW_MS` | Rate-limit window |

Set `FRONTEND_ORIGIN` to the origin you actually open in the browser:

- Local npm or `docker compose` (dev): `http://localhost:4200`
- Prod-like nginx compose: `http://localhost:8080` (or your public origin)

```bash
npm ci
npm run build:shared
```

---

## Local development (npm)

Two terminals from the repo root:

```bash
npm run dev:backend
```

API: [http://localhost:3000](http://localhost:3000) · health: [http://localhost:3000/health](http://localhost:3000/health) · Swagger: [http://localhost:3000/docs](http://localhost:3000/docs)

```bash
npm run dev:frontend
```

UI: [http://localhost:4200](http://localhost:4200)

The Angular dev server proxies `/api` to `http://localhost:3000` (`frontend/proxy.conf.dev.json`).

---

## Docker

Copy `.env` as above first.

**Dev (live reload)** — bind-mounts the repo; `tsx watch` + `ng serve`:

```bash
docker compose up --build
```

- UI: [http://localhost:4200](http://localhost:4200)
- API: [http://localhost:3000](http://localhost:3000)

The frontend container uses `frontend/proxy.conf.json` (`/api` → `http://backend:3000`).

**Production-like** — multi-stage images; nginx on 8080, backend not published:

```bash
docker compose -f docker-compose.prod.example.yml up --build -d
```

UI: [http://localhost:8080](http://localhost:8080) (`/api` reverse-proxied by nginx)

---

## Project layout

```text
/
├── frontend/          Angular app
├── backend/           Fastify API
├── shared/            @steamstats/shared types
├── scripts/           Docker dev entrypoint
├── docker-compose.yml
├── docker-compose.prod.example.yml
├── .env.example
└── package.json
```

---

## Backend API

All app routes are under `/api/v1`.

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/api/v1/profile/resolve` | Resolve SteamID64, profile URL, or vanity name |
| GET | `/api/v1/profile/:steamId` | Normalized player profile |
| GET | `/api/v1/library/:steamId` | Owned games and library stats |
| GET | `/api/v1/library/:steamId/random` | Random owned game |
| GET | `/api/v1/library/:steamId/recent` | Games played in the last 2 weeks |
| GET | `/api/v1/library/refresh` | Refresh cached Steam app list |
| GET | `/api/v1/games/:appId` | Steam Store details for one app |
| GET | `/api/v1/cache/clear` | Clear backend cache |
| GET | `/health` | Liveness |

---

## Security

- `STEAM_API_KEY` is used only by the backend.
- CORS is limited to `FRONTEND_ORIGIN`.
- Helmet and rate limiting are enabled on the API.

---

## License

[MIT](LICENSE)
