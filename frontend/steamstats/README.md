# SteamStats Frontend

The frontend application for **SteamStats** is an Angular-based single page application (SPA) responsible for presenting Steam statistics to users.

The frontend provides the user interface layer of the application and communicates with the backend API through HTTP requests. It is designed to run as a production-ready static application served by nginx while securely routing API traffic internally to the backend service.

---

# Table of Contents

* [Overview](#overview)
* [Architecture](#architecture)
* [Technology Stack](#technology-stack)
* [Project Structure](#project-structure)
* [Application Lifecycle](#application-lifecycle)
* [Angular Bootstrap Flow](#angular-bootstrap-flow)
* [Component Architecture](#component-architecture)
* [Routing System](#routing-system)
* [State and Data Flow](#state-and-data-flow)
* [API Communication](#api-communication)
* [Service Worker Support](#service-worker-support)
* [Production Build Process](#production-build-process)
* [Docker Architecture](#docker-architecture)
* [nginx Configuration](#nginx-configuration)
* [Development Setup](#development-setup)
* [Production Deployment](#production-deployment)
* [Security Considerations](#security-considerations)
* [Future Improvements](#future-improvements)

---

# Overview

SteamStats Frontend is the client-side application responsible for:

* Rendering Steam statistics
* Providing user interaction
* Communicating with the backend API
* Managing application navigation
* Handling API responses
* Displaying Steam-related information

The frontend does **not** communicate directly with Steam services.

The communication chain is:

```
User
 |
 v
Angular Application
 |
 v
Backend API
 |
 v
Steam Services
```

This keeps Steam credentials and external API logic isolated inside the backend.

---

# Architecture

The frontend follows a standard Angular SPA architecture.

```
Browser
   |
   |
   v
Angular Application
   |
   +----------------+
   |                |
   v                v
Components       Services
   |                |
   |                v
   |            HTTP Client
   |
   v
Templates
   |
   v
Rendered UI
```

The application is compiled into static assets and served by nginx.

---

# Technology Stack

## Framework

Angular

The application uses Angular for:

* Component architecture
* Routing
* Dependency injection
* Reactive programming
* Build tooling

---

## Language

TypeScript

Benefits:

* Strong typing
* Better maintainability
* Safer refactoring
* Improved developer experience

---

## UI Framework

Angular Material

Used for:

* UI components
* Layout elements
* User interaction controls
* Consistent design patterns

---

## Reactive Programming

RxJS

Used for:

* HTTP streams
* Async operations
* Event handling
* Observable data flows

---

## Styling

Tailwind CSS tooling is included for utility-based styling.

---

# Project Structure

```
frontend/
│
├── steamstats/
│   │
│   ├── src/
│   │   │
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   ├── guards/
│   │   │   └── routes/
│   │   │
│   │   ├── assets/
│   │   │
│   │   ├── environments/
│   │   │
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.css
│   │
│   ├── package.json
│   ├── angular.json
│   └── tsconfig.json
│
├── DOCKERFILE
│
└── nginx.conf
```

---

# Application Lifecycle

The frontend startup process:

```
Browser Opens Application
          |
          v
index.html Loaded
          |
          v
Angular Runtime Starts
          |
          v
main.ts Executes
          |
          v
Root Application Created
          |
          v
Router Initialized
          |
          v
Components Render
          |
          v
User Interacts
```

---

# Angular Bootstrap Flow

The entry point is:

```
src/main.ts
```

The bootstrap process:

```
main.ts
 |
 |
 v
Angular Bootstrap
 |
 |
 v
Root Component
 |
 |
 v
Application Configuration
 |
 |
 v
Router Setup
 |
 |
 v
Rendered Application
```

Angular dependency injection creates the services required by the application.

---

# Component Architecture

Angular components are responsible for UI sections.

A typical component contains:

```
Component
 |
 +-- TypeScript Logic
 |
 +-- HTML Template
 |
 +-- Styling
```

Responsibilities:

## Component Class

Handles:

* Data preparation
* User events
* Service communication

---

## Template

Handles:

* Rendering data
* User interaction
* UI structure

---

## Styles

Handles:

* Component presentation
* Layout
* Visual appearance

---

# Routing System

Angular Router controls navigation.

The flow:

```
User Clicks Navigation
          |
          v
Angular Router
          |
          v
Route Matching
          |
          v
Component Loading
          |
          v
Page Displayed
```

Benefits:

* No full page reloads
* Faster navigation
* SPA behavior

---

# State and Data Flow

The frontend follows a predictable data flow:

```
User Action
     |
     v
Component
     |
     v
Service
     |
     v
HTTP Request
     |
     v
Backend API
     |
     v
Observable Response
     |
     v
Component Updates
     |
     v
UI Refresh
```

---

# API Communication

The frontend communicates with the backend using HTTP.

Example flow:

```
Component
    |
    v
Angular Service
    |
    v
HttpClient
    |
    v
/api/*
    |
    v
nginx Proxy
    |
    v
Backend Container
```

The frontend only knows the API path.

It does not need to know the backend container location.

---

# Service Layer

Angular services provide separation between:

* UI logic
* Data retrieval
* API communication

Example responsibility:

```
Component
   |
   v
Steam Service
   |
   v
HTTP Client
   |
   v
Backend API
```

Benefits:

* Reusable logic
* Easier testing
* Cleaner components

---

# Service Worker Support

The application includes Angular service worker support.

Benefits:

* Offline caching capabilities
* Faster repeat loads
* Progressive Web App features

Special nginx handling prevents caching issues with:

```
ngsw-worker.js
ngsw.json
```

---

# Production Build Process

The Docker build process creates the production application.

Flow:

```
Source Code
     |
     v
npm install
     |
     v
Angular Build
     |
     v
Generated Static Files
     |
     v
nginx Container
```

The final output is:

```
frontend/steamstats/dist/
```

which contains:

* HTML
* JavaScript bundles
* CSS
* Assets

---

# Docker Architecture

The frontend uses a multi-stage Docker build.

## Stage 1 - Build

Base image:

```
node:22-alpine
```

Responsibilities:

* Install dependencies
* Build shared package
* Build Angular application

Flow:

```
Node Container
      |
      v
npm ci
      |
      v
Build Shared Package
      |
      v
Build Angular App
```

---

## Stage 2 - Runtime

Base image:

```
nginx:1.27-alpine
```

Responsibilities:

* Serve static files
* Handle SPA routing
* Proxy backend API requests

Flow:

```
nginx
 |
 +-- Static Angular Files
 |
 +-- /api Proxy
       |
       v
    Backend Container
```

---

# Dockerfile Logic

The Dockerfile performs:

```
Copy package definitions
        |
        v
Install dependencies
        |
        v
Copy application source
        |
        v
Build Angular application
        |
        v
Copy build output into nginx
        |
        v
Start nginx
```

---

# nginx Configuration

The nginx server performs two major tasks.

---

## Static File Hosting

Requests:

```
/
```

are served from:

```
/usr/share/nginx/html
```

---

## Backend Proxy

Requests:

```
/api/*
```

are forwarded internally:

```
Browser
   |
   v
nginx
   |
   v
backend:3000/api/
```

The backend does not need to be publicly exposed.

---

# SPA Fallback

Angular applications rely on client-side routing.

Example:

```
/profile
/settings
/stats
```

nginx redirects unknown routes back to:

```
index.html
```

Angular then handles the route.

---

# Development Setup

## Install Dependencies

From the frontend application:

```bash
npm install
```

---

## Start Development Server

```bash
npm start
```

or:

```bash
ng serve
```

---

## Production Build

```bash
npm run build
```

---

# Production Deployment

Production deployment flow:

```
Developer
    |
    v
Docker Build
    |
    v
Frontend Image
    |
    v
Container Deployment
    |
    v
nginx Starts
    |
    v
Users Access Application
```

---

# Security Considerations

The frontend follows several security principles:

## No Steam Credentials

Steam API keys remain backend-only.

---

## Internal API Routing

The browser communicates with nginx.

nginx communicates with backend.

---

## Static Asset Isolation

Only compiled frontend files are publicly exposed.

---

## Environment Separation

Development and production configurations remain separate.

---

# Design Principles

The frontend follows:

## Component Separation

UI elements are isolated into reusable components.

---

## Service-Based Data Access

API communication stays outside components.

---

## Reactive Data Handling

Async operations use observable streams.

---

## Production Optimization

The application is compiled and served as optimized static assets.

---

# Future Improvements

Possible enhancements:

* Additional lazy-loaded routes
* More comprehensive component tests
* Improved state management
* Advanced caching strategies
* User preference storage
* More dashboard visualizations
* Progressive Web App enhancements

---

# Summary

SteamStats Frontend is an Angular SPA responsible for presenting Steam statistics through a modern web interface.

The complete request flow:

```
User
 |
 v
Angular Application
 |
 v
Angular Service
 |
 v
HTTP Request
 |
 v
nginx Proxy
 |
 v
Backend API
 |
 v
Steam Data
 |
 v
Angular Component
 |
 v
User Interface
```

The frontend architecture keeps presentation, API communication, and deployment concerns separated while providing a scalable foundation for future SteamStats features.
