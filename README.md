# claude-web-blueprint

Reusable full-stack starter. Clone, rename, build.

**Stack:** Next.js 15 (App Router, TS) · Tailwind CSS · shadcn/ui · Express + TS · Supabase (Auth + Postgres) · pnpm workspaces.

## Layout

```
.
├── frontend/   Next.js 15 app (port 3000)
└── backend/    Express API (port 4000)
```

## Prerequisites

- Node `>=20`
- pnpm `>=9`
- A Supabase project (free tier fine): https://supabase.com/dashboard

## Setup

```bash
# 1. install all workspace deps
pnpm install

# 2. configure env
cp frontend/.env.local.example frontend/.env.local
cp backend/.env.example backend/.env
# fill in SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY in both files

# 3. run dev (frontend + backend in parallel)
pnpm dev
```

Visit:
- Frontend: http://localhost:3000
- Backend health: http://localhost:4000/health

## Example flows wired

- `/` landing
- `/login` email + password sign in / sign up (Supabase Auth)
- `/dashboard` server-gated layout, redirects to `/login` if no session, calls backend `/me`
- `/settings` placeholder protected page

Backend:
- `GET /health` public
- `GET /me` requires `Authorization: Bearer <supabase-access-token>`

## Build

```bash
pnpm build
# frontend -> .next/
# backend  -> backend/dist/
```

## Deployment notes (per clone, not pre-configured)

- Frontend → Vercel (zero config) or self-host with `pnpm --filter frontend start`.
- Backend → Render / Fly / Railway / any Node host. Build: `pnpm --filter backend build`. Start: `node backend/dist/index.js`.
- Set Supabase Auth redirect URLs to match your deployed origin.

## Customize for a new project

1. Clone this repo into a new directory.
2. Update root `package.json` `name`.
3. Delete or modify example pages under `frontend/src/app`.
4. Add your own routes under `backend/src/routes` and mount in `backend/src/index.ts`.
5. Add tables to Supabase, generate types: `pnpm dlx supabase gen types typescript ...`.
