# Sea-Plus-Plus

A browser-based aquarium game where players answer C++ trivia questions
to earn coins and unlock fish.

## Live Demo

<https://sea-plus-plus.onrender.com>

Hosted on Render's free tier — the first request after inactivity may take
30–50 seconds to wake the server.

## Tech Stack

- **Frontend:** React + Vite, Kaplay (2D HTML5 game engine)
- **Backend:** Spring Boot 4, Java 21
- **Deploy:** Single Render Web Service (Docker) — Spring Boot serves both
  the REST API (`/api/**`) and the bundled SPA from the same origin

## Team

- **Richard Huang** — Project Lead, Technical Lead
- **Rebecca Brautigam** — Interface Lead, Frontend/GUI
- **Vincent Zhang** — Mentor

## Run Locally

**Backend** (REST API + bundled SPA at http://localhost:8080):

```bash
cd backend
./mvnw spring-boot:run
```

**Frontend** (Vite dev server with HMR at http://localhost:5173):

```bash
npm install
npm run dev
```

## Course

EC327 — Boston University, Spring 2026
