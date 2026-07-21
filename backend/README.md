# SteamStats Backend

The backend service for **SteamStats** is a lightweight TypeScript API responsible for securely communicating with Steam services and exposing Steam statistics to the frontend application.

The backend acts as a middle layer between the client application and the Steam Web API. It handles configuration, API security, request validation, rate limiting, Steam data retrieval, and consistent response formatting.

---

# Table of Contents

* [Overview](#overview)
* [Architecture](#architecture)
* [Technology Stack](#technology-stack)
* [Project Structure](#project-structure)
* [Application Startup Flow](#application-startup-flow)
* [Fastify Application Lifecycle](#fastify-application-lifecycle)
* [Configuration System](#configuration-system)
* [Plugin System](#plugin-system)
* [Request Flow](#request-flow)
* [Steam Service Layer](#steam-service-layer)
* [API Versioning](#api-versioning)
* [Error Handling](#error-handling)
* [Middleware and Security](#middleware-and-security)
* [Development Setup](#development-setup)
* [Production Build](#production-build)
* [Docker Support](#docker-support)
* [Future Improvements](#future-improvements)

---

# Overview

SteamStats Backend provides the API layer required by the SteamStats application.

Its responsibilities include:

* Starting and configuring the HTTP server
* Loading environment configuration
* Registering Fastify plugins
* Enabling CORS support
* Applying API rate limits
* Connecting Steam-related services
* Exposing versioned API routes
* Handling Steam API failures gracefully
* Returning consistent JSON responses

The backend follows a modular architecture where infrastructure, configuration, services, and routes are separated.

---

# Architecture

The backend follows this general flow:

```
Client
  |
  |
  v
Fastify HTTP Server
  |
  |
  +----------------+
  |                |
  v                v
Plugins          Routes
  |                |
  |                v
  |            Controllers
  |                |
  |                v
  |            Services
  |                |
  +----------------+
                   |
                   v
             Steam Web API
```

The backend does not expose Steam credentials or API keys to the frontend. Instead, the frontend communicates only with this backend API.

---

# Technology Stack

## Runtime

* Node.js

## Language

* TypeScript

## Framework

* Fastify

Fastify provides:

* High performance HTTP handling
* Plugin-based architecture
* Built-in request lifecycle hooks
* Schema validation support

## Main Dependencies

| Package             | Purpose                         |
| ------------------- | ------------------------------- |
| fastify             | HTTP API framework              |
| @fastify/cors       | Cross-origin request handling   |
| @fastify/rate-limit | Request throttling              |
| @fastify/sensible   | Utility helpers and HTTP errors |
| fastify-plugin      | Plugin creation utilities       |
| dotenv              | Environment variable loading    |

---

# Project Structure

```
backend/
│
├── src/
│   │
│   ├── index.ts
│   │
│   ├── app.ts
│   │
│   ├── config/
│   │   └── env.ts
│   │
│   ├── plugins/
│   │   ├── config.plugin.ts
│   │   ├── cors.plugin.ts
│   │   ├── rate-limit.plugin.ts
│   │   └── steam-service.plugin.ts
│   │
│   ├── routes/
│   │   └── v1 routes
│   │
│   └── services/
│       ├── steam-api.client.ts
│       └── steam.service.ts
│
├── package.json
├── tsconfig.json
└── DOCKERFILE
```

---

# Application Startup Flow

The backend begins execution inside:

```
src/index.ts
```

The startup process is:

```
S
```

---

# Entry Point

## index.ts

The entry file performs three main tasks:

1. Load environment configuration
2. Create the Fastify application
3. Start the HTTP server

Pseudo-flow:

```typescript
const config = loadConfig();

const app = buildApp(config);

await app.listen({
    host: config.host,
    port: config.port
});
```

The entry point intentionally contains minimal logic.

Application behavior belongs inside:

* configuration modules
* plugins
* routes
* services

This keeps startup simple and maintainable.

---

# Fastify Application Lifecycle

The application factory exists inside:

```
src/app.ts
```

The `buildApp()` function creates and configures Fastify.

The lifecycle:

```
Create Fastify Instance
        |
        v
Register Configuration Plugin
        |
        v
Register Sensible Utilities
        |
        v
Register CORS
        |
        v
Register Rate Limiting
        |
        v
Register Steam Service
        |
        v
Register API Routes
        |
        v
Register Health Endpoint
        |
        v
Register Error Handler
```

---

# Health Endpoint

The backend exposes:

```
GET /health
```

Response:

```json
{
    "status": "ok"
}
```

This endpoint is used for:

* uptime checks
* container health checks
* deployment verification

---

# Configuration System

Environment configuration is loaded through:

```
src/config/env.ts
```

The configuration layer centralizes:

* server host
* server port
* environment mode
* Steam API credentials
* runtime settings

Instead of accessing environment variables throughout the application, configuration is loaded once and injected where needed.

Example:

```
.env
 |
 |
 v
loadConfig()
 |
 |
 v
AppConfig
 |
 |
 v
Fastify Plugins
```

---

# Plugin System

SteamStats uses Fastify plugins to keep infrastructure isolated.

---

# Config Plugin

Responsible for making application configuration available throughout Fastify.

Purpose:

* Avoid global variables
* Provide dependency injection
* Keep configuration centralized

---

# CORS Plugin

Responsible for controlling frontend access.

Handles:

* allowed origins
* browser cross-origin rules
* API accessibility

Flow:

```
Browser Request
       |
       v
CORS Validation
       |
       v
Request Accepted / Rejected
```

---

# Rate Limit Plugin

Protects the API from excessive requests.

Purpose:

* Prevent abuse
* Reduce Steam API pressure
* Protect server resources

Flow:

```
Incoming Request
       |
       v
Rate Limit Check
       |
       +---- Allowed
       |
       v
Continue Request

       OR

       +---- Too Many Requests
       |
       v
Reject
```

---

# Steam Service Plugin

The Steam service plugin injects Steam functionality into the Fastify application.

Responsibilities:

* Create Steam service instances
* Provide Steam API access
* Make Steam logic available to routes

---

# Request Flow

A typical API request follows:

```
Frontend
   |
   v
HTTP Request
   |
   v
Fastify Server
   |
   v
Plugins Execute
   |
   v
Route Handler
   |
   v
Steam Service
   |
   v
Steam API Client
   |
   v
Steam Web API
   |
   v
Response Formatting
   |
   v
Frontend
```

---

# Steam Service Layer

Steam communication is separated into multiple layers.

## Steam API Client

Responsible for:

* Performing external HTTP requests
* Communicating directly with Steam APIs
* Handling external API failures

---

## Steam Service

Responsible for application-level Steam logic.

Examples:

* Finding player information
* Transforming Steam responses
* Handling missing users
* Preparing frontend-friendly data

The separation allows Steam API communication to change without rewriting application logic.

---

# API Versioning

Routes are registered under:

```
/api/v1
```

Example:

```
GET /api/v1/example
```

Versioning allows future changes:

```
/api/v1
/api/v2
```

without breaking existing clients.

---

# Error Handling

The backend uses centralized error handling.

Errors are converted into predictable responses.

Supported cases include:

## Steam User Not Found

Response:

```json
{
    "statusCode":404,
    "error":"Not Found",
    "message":"..."
}
```

---

## Steam API Failure

Response:

```json
{
    "statusCode":502,
    "error":"Bad Gateway",
    "message":"..."
}
```

---

## Validation Failure

Response:

```json
{
    "statusCode":400,
    "error":"Bad Request",
    "message":"..."
}
```

---

## Unknown Errors

Production:

```json
{
    "statusCode":500,
    "error":"Internal Server Error"
}
```

Development environments expose more detailed debugging information.

---

# Middleware and Security

The backend includes several protections.

## CORS Protection

Controls who can access the API.

---

## Rate Limiting

Controls request frequency.

---

## Environment Isolation

Sensitive configuration remains server-side.

Examples:

* Steam API keys
* Runtime configuration
* Deployment settings

---

# Development Setup

## Install Dependencies

```bash
npm install
```

---

## Create Environment File

Create:

```
.env
```

Configure required variables.

---

## Run Development Server

```bash
npm run dev
```

This starts the backend using TypeScript execution with automatic reload.

---

# Type Checking

Run:

```bash
npm run typecheck
```

This verifies TypeScript correctness without producing build output.

---

# Production Build

Compile TypeScript:

```bash
npm run build
```

This generates:

```
dist/
```

Run production server:

```bash
npm start
```

---

# Docker Support

The backend includes a Dockerfile for containerized deployment.

Typical deployment flow:

```
Docker Build
      |
      v
Container Image
      |
      v
Runtime Container
      |
      v
Fastify Server
```

---

# Design Principles

The backend follows these principles:

## Separation of Concerns

Routes handle HTTP.

Services handle business logic.

Clients handle external APIs.

---

## Dependency Injection

Services are provided through Fastify plugins instead of imported globally.

---

## Defensive API Design

External failures are converted into controlled responses.

---

## Maintainability

Each system component has one responsibility.

---

# Future Improvements

Possible enhancements:

* Automated API documentation with OpenAPI
* Integration tests
* Better request schemas
* Redis caching for Steam responses
* Background refresh jobs
* Expanded Steam statistics endpoints
* Metrics and monitoring
* Structured logging

---

# Summary

SteamStats Backend is a modular Fastify API that securely connects the frontend application with Steam services.

The complete flow is:

```
User
 |
 v
Frontend
 |
 v
Fastify API
 |
 v
Routes
 |
 v
Steam Service
 |
 v
Steam API Client
 |
 v
Steam Web API
 |
 v
Formatted Response
 |
 v
Frontend Display
```

The architecture is designed to remain lightweight, secure, and easy to extend as more Steam statistics and features are added.
