# SteamStats

A Steam companion dashboard: enter a SteamID64 or Steam profile URL and see your library stats,
recently played games, playtime distribution, and a random game picker. Built as a monorepo with
an Angular frontend and a Fastify backend that securely proxies the Steam Web API.

## Project structure

```
/
├── frontend/steamstats/   Angular 21 app (standalone components, signals, Tailwind, Material)
├── backend/               Fastify + TypeScript API
├── shared/                Shared, type-only TypeScript definitions (@steamstats/shared)
├── docker-compose.yml
├── .env.example
└── README.md
```

This is an npm workspaces monorepo (see the root `package.json`). `shared` contains **only**
TypeScript interfaces/types with no runtime code - it's erased entirely at compile time, so
neither the frontend nor backend ship it at runtime.

## Prerequisites

- Node.js 22+
- A [Steam Web API key](https://steamcommunity.com/dev/apikey)
- Docker + Docker Compose (for containerized runs)

## Local development

```bash
npm install                 # installs all workspaces
npm run build:shared        # builds the shared types package (required once, and after changes to shared/)
cp .env.example .env        # then fill in STEAM_API_KEY
npm run dev:backend         # starts the Fastify API on http://localhost:3000
npm run dev:frontend        # starts the Angular dev server on http://localhost:4200
```

The Angular dev server proxies `/api/*` to `http://localhost:3000` (see `proxy.conf.json`), so the
frontend never needs to know the backend's exact origin, and CORS is a non-issue in dev too.

## Docker

```bash
cp .env.example .env        # fill in STEAM_API_KEY
docker compose up --build
```

The app is served at **http://localhost:8080**. The backend container has **no published host
port** - it's only reachable from the frontend's nginx reverse proxy over the internal Docker
network. The frontend calls relative `/api/v1/...` paths, which nginx forwards to the backend
container internally.

## Backend API

All endpoints are prefixed with `/api/v1`.

| Method | Path                     | Description                                      |
| ------ | ------------------------ | ------------------------------------------------- |
| POST   | `/resolve`               | Resolves a SteamID64, profile URL, or vanity URL into a SteamID64 |
| GET    | `/profile/:steamId`      | Normalized player profile summary                 |
| GET    | `/library/:steamId`      | Owned games + aggregate library stats             |
| GET    | `/recent/:steamId`       | Games played in the last 2 weeks                  |
| GET    | `/random/:steamId`       | A random game from the player's library           |

The backend validates all input, rate-limits requests, restricts CORS to `FRONTEND_ORIGIN`, and
is the only part of the system that ever sees `STEAM_API_KEY`.

## Environment variables

See [.env.example](.env.example) for the full list (`STEAM_API_KEY`, `FRONTEND_ORIGIN`,
`RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`).

## Future work

- Steam OpenID login
- Favorites, wishlist, friends
- Achievement progress
- Caching layer and persistent storage for multi-user support
- Library-by-genre breakdown (requires per-app Steam Store metadata)
