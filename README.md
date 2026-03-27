# HealthSync Companion

HealthSync Companion is a class project with:

- Frontend: React + Vite + TypeScript + Tailwind
- Backend: Node.js + Express + Prisma + SQLite + JWT auth

## Project structure

- `src/` - frontend app
- `backend/` - custom backend API
- `backend/prisma/schema.prisma` - database schema
- `backend/prisma/migrations/` - Prisma migrations

## Prerequisites

Install before running:

1. Node.js (LTS recommended)
2. npm

## Environment variables

### Frontend (`.env` in project root)

```env
VITE_API_BASE_URL="http://localhost:4000/api"
```

### Backend (`backend/.env`)

```env
DATABASE_URL="file:./healthsync.db"
PORT="4000"
JWT_SECRET="replace-with-a-strong-secret"
JWT_EXPIRES_IN="7d"
```

## Install dependencies

From project root:

```sh
npm install
```

From backend:

```sh
cd backend
npm install
```

## Database setup (Prisma + SQLite)

From `backend/`:

```sh
npm run prisma:generate
npx prisma db push
```

This creates/updates `backend/prisma/healthsync.db` based on `schema.prisma`.

## Run locally

Open two terminals.

### Terminal 1 (backend)

```sh
cd backend
npm run dev
```

Backend runs on `http://localhost:4000`.

### Terminal 2 (frontend)

```sh
npm run dev
```

Frontend runs on Vite URL (usually `http://localhost:8080` or `http://localhost:8081`).

## Build

Frontend build:

```sh
npm run build
```

## API overview

Base URL: `http://localhost:4000/api`

- Auth
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/me`
- Users
  - `GET /users/me`
  - `PATCH /users/me`
- Medications
  - `GET /medications`
  - `POST /medications`
  - `PATCH /medications/:id`
  - `DELETE /medications/:id`
- Dose logs
  - `GET /dose-logs`
  - `POST /dose-logs`
  - `PATCH /dose-logs/:id`
  - `DELETE /dose-logs/:id`
- Appointments
  - `GET /appointments`
  - `POST /appointments`
  - `PATCH /appointments/:id`
  - `DELETE /appointments/:id`

## Troubleshooting

### "Failed to fetch" during sign up/login

This usually means backend is not running.

1. Start backend:
   - `cd backend && npm run dev`
2. Confirm health endpoint:
   - `http://localhost:4000/api/health`
3. Confirm frontend `.env` uses:
   - `VITE_API_BASE_URL="http://localhost:4000/api"`

### Backend says missing script "dev"

Run:

```sh
cd backend
npm install
```

Then retry:

```sh
npm run dev
```
