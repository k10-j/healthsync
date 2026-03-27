# HealthSync Companion

HealthSync Companion is a class project with:

- Frontend: React + Vite + TypeScript + Tailwind (`frontend/`)
- Backend: Node.js + Express + Prisma + PostgreSQL + JWT auth (`backend/`)

## Project structure

```
healthsync/
├── frontend/          # React frontend app
│   ├── src/           # App source code
│   ├── public/        # Static assets
│   └── ...            # Vite/TS/Tailwind config
└── backend/           # Express API
    ├── src/           # Server source code
    └── prisma/        # Schema & migrations
```

## Prerequisites

- Node.js (LTS)
- npm

## Environment variables

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL="http://localhost:4000/api"
```

### Backend (`backend/.env`)

```env
DATABASE_URL="postgresql://..."
PORT="4000"
JWT_SECRET="replace-with-a-strong-secret"
JWT_EXPIRES_IN="7d"
```

## Install dependencies

```sh
cd frontend && npm install
cd ../backend && npm install
```

## Database setup

```sh
cd backend
npm run prisma:generate
npx prisma db push
```

## Run locally

### Terminal 1 — Backend

```sh
cd backend
npm run dev
```

### Terminal 2 — Frontend

```sh
cd frontend
npm run dev
```

Frontend: `http://localhost:8080` · Backend: `http://localhost:4000`

## Build

```sh
cd frontend
npm run build
```

## API overview

Base URL: `http://localhost:4000/api`

| Method | Path |
|--------|------|
| POST | /auth/register |
| POST | /auth/login |
| GET | /auth/me |
| GET/PATCH | /users/me |
| GET/POST | /medications |
| PATCH/DELETE | /medications/:id |
| GET/POST | /dose-logs |
| PATCH/DELETE | /dose-logs/:id |
| GET/POST | /appointments |
| PATCH/DELETE | /appointments/:id |

## Troubleshooting

**"Failed to fetch" on login/signup** — backend isn't running. Start it with `cd backend && npm run dev` and confirm `http://localhost:4000/api/health` responds.
