# SteamStats

A Steam companion dashboard for exploring your Steam library.

Enter a **SteamID64** or **Steam profile URL** and view:

* Steam profile information
* Library statistics
* Recently played games
* Playtime distribution
* Random game picker

SteamStats is built as an **npm workspaces monorepo** containing:

* An Angular 21 frontend
* A Fastify TypeScript backend
* A shared type-only package

The backend securely proxies requests to the Steam Web API, keeping Steam credentials and external API communication isolated from the client application.

---

# Table of Contents

* [Overview](#overview)
* [Architecture](#architecture)
* [Project Structure](#project-structure)
* [Technology Stack](#technology-stack)
* [How Data Flows](#how-data-flows)
* [Prerequisites](#prerequisites)
* [Local Development](#local-development)
* [Running Development Servers](#running-development-servers)
* [Docker Deployment](#docker-deployment)
* [Environment Variables](#environment-variables)
* [Backend API](#backend-api)
* [Security](#security)
* [Shared Package](#shared-package)
* [Future Work](#future-work)
* [License](#license)

---

# Overview

SteamStats provides a dashboard experience around Steam user data.

Users can provide:

* A SteamID64
* A Steam profile URL
* A Steam vanity URL

The application resolves the user, retrieves Steam data through the backend, and presents statistics through the Angular frontend.

The application never exposes Steam API credentials to the browser.

---

# Architecture

SteamStats follows a three-package monorepo architecture:

```text
                    User Browser
                         |
                         |
                         v
              Angular Frontend (4200)
                         |
                         |
                    /api requests
                         |
                         v
              Fastify Backend (3000)
                         |
                         |
                         v
                 Steam Web API
```

The backend acts as a secure gateway between the frontend and Steam.

Responsibilities:

## Frontend

* User interface
* Routing
* Data visualization
* User interaction
* API consumption

## Backend

* Steam API communication
* Input validation
* Rate limiting
* CORS protection
* Data normalization
* API responses

## Shared Package

* Shared TypeScript interfaces
* Compile-time type safety
* No runtime dependencies

---

# Project Structure

```text
/
├── frontend/
│   └── steamstats/
│       Angular 21 application
│       - Standalone components
│       - Signals
│       - Tailwind CSS
│       - Angular Material
│
├── backend/
│   Fastify + TypeScript API
│
├── shared/
│   Shared type-only TypeScript definitions
│   (@steamstats/shared)
│
├── docker-compose.yml
├── .env.example
├── package.json
└── README.md
```

---

# Technology Stack

## Frontend

* Angular 21
* TypeScript
* Angular Signals
* Angular Material
* Tailwind CSS
* RxJS

## Backend

* Node.js 22+
* Fastify
* TypeScript
* Steam Web API integration

## Infrastructure

* Docker
* Docker Compose
* nginx reverse proxy

---

# How Data Flows

A typical request follows this path:

```text
User
 |
 v
Angular Component
 |
 v
Frontend Service
 |
 v
HTTP Request (/api/v1/*)
 |
 v
nginx / Angular Proxy
 |
 v
Fastify Route
 |
 v
Steam Service
 |
 v
Steam Web API
 |
 v
Normalized Response
 |
 v
Angular UI
```

---

# Prerequisites

Before running SteamStats locally, install:

* Node.js 22+
* npm
* Steam Web API key
* Docker + Docker Compose (optional)

Verify Node:

```bash
node --version
```

Verify npm:

```bash
npm --version
```

---

# Local Development

SteamStats uses npm workspaces.

From the repository root:

```bash
npm install
```

This installs dependencies for:

* frontend
* backend
* shared package

---

## Build Shared Types

The shared package contains TypeScript-only definitions.

Build it with:

```bash
npm run build:shared
```

Run this:

* After cloning the repository
* After modifying shared types

The shared package contains no runtime code.

It is removed completely during compilation.

---

## Configure Environment

Copy:

```bash
cp .env.example .env
```

Then configure:

```env
STEAM_API_KEY=your_key_here
```

---

# Running Development Servers

SteamStats requires both frontend and backend servers running.

Open two terminals.

---

## Start Backend

```bash
npm run dev:backend
```

Backend runs at:

```text
http://localhost:3000
```

The backend provides:

* Steam API access
* API routes
* Validation
* Security controls

---

## Start Frontend

```bash
npm run dev:frontend
```

Frontend runs at:

```text
http://localhost:4200
```

---

## Development Proxy

The Angular development server proxies:

```text
/api/*
```

to:

```text
http://localhost:3000
```

This means:

* Frontend does not need backend origin knowledge
* CORS issues are avoided during development
* API URLs remain consistent

---

# Docker Deployment

SteamStats can run completely containerized.

Build and start:

```bash
cp .env.example .env

docker compose up --build
```

The application becomes available at:

```text
http://localhost:8080
```

---

# Docker Architecture

Production container flow:

```text
              Browser
                 |
                 v
          Frontend nginx
             :8080
                 |
                 |
             /api/*
                 |
                 v
          Backend Container
             Fastify
              :3000
                 |
                 v
          Steam Web API
```

Important:

* Frontend exposes the public port
* Backend has no public host port
* nginx internally proxies API requests
* Steam API keys remain inside backend container

---

# Environment Variables

See:

```text
.env.example
```

Available configuration includes:

| Variable             | Purpose                      |
| -------------------- | ---------------------------- |
| STEAM_API_KEY        | Steam Web API authentication |
| FRONTEND_ORIGIN      | Allowed frontend URL         |
| RATE_LIMIT_MAX       | Maximum requests allowed     |
| RATE_LIMIT_WINDOW_MS | Rate limit window duration   |

---

# Backend API

All backend routes use:

```text
/api/v1
```

---

| Method | Path                | Description                                   |
| ------ | ------------------- | --------------------------------------------- |
| POST   | `/resolve`          | Resolve SteamID64, profile URL, or vanity URL |
| GET    | `/profile/:steamId` | Retrieve normalized player profile            |
| GET    | `/library/:steamId` | Retrieve owned games and library statistics   |
| GET    | `/recent/:steamId`  | Retrieve games played within the last 2 weeks |
| GET    | `/random/:steamId`  | Select a random owned game                    |

---

# Security

SteamStats follows several security principles.

## Steam API Key Protection

Only the backend accesses:

```text
STEAM_API_KEY
```

The frontend never receives Steam credentials.

---

## Input Validation

The backend validates:

* Steam IDs
* Profile URLs
* Request parameters

---

## Rate Limiting

Requests are throttled to prevent:

* Abuse
* Excessive Steam API usage
* Resource exhaustion

---

## CORS Protection

The backend restricts requests to:

```text
FRONTEND_ORIGIN
```

---

# Shared Package

The shared workspace:

```text
shared/
```

contains TypeScript interfaces used by both frontend and backend.

Example:

```text
Frontend Types
        |
        |
        v
@steamstats/shared
        ^
        |
        |
Backend Types
```

The package contains:

* Interfaces
* Type definitions
* Compile-time contracts

It contains:

* No runtime code
* No dependencies
* No shipped JavaScript

---

# Future Work

Planned improvements:

* Steam OpenID authentication
* Favorites and wishlist support
* Friends integration
* Achievement progress tracking
* Persistent storage
* Multi-user accounts
* Library genre breakdowns
* Steam Store metadata integration
* Response caching layer

---

# License

SteamStats is licensed under the MIT License.

You are free to:

* Use the project commercially
* Modify the source code
* Distribute copies
* Create derivative works

The only requirement is that the original copyright notice and license text remain included.

See:

```text
LICENSE
```

for the full license agreement.
