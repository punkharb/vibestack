# CLAUDE.md

> This file is the generic blueprint version. After cloning, edit
> [`projectscope.md`](./projectscope.md) and run `/adapt` in Claude Code to
> regenerate this file with project-specific guidance.

## Project Overview

A reusable web blueprint. Two top-level apps:

- `frontend/` — Next.js 16 (App Router, TS, Tailwind 4, shadcn/ui)
- `backend/` — Express 4 + TypeScript

Auth and Postgres come from Supabase. The frontend uses `@supabase/ssr` for
cookie-based auth; the backend uses a service-role admin client to verify
bearer tokens.

## Stack

| Layer    | Tech                                              |
|----------|---------------------------------------------------|
| UI       | Next.js 16 · React 19 · Tailwind 4 · shadcn/ui    |
| Auth     | Supabase Auth (email/password)                    |
| DB       | Supabase Postgres (RLS-first)                     |
| Backend  | Express 4 + TS, JWT-verified routes               |
| Workspace| pnpm workspaces                                   |

## Key Commands

```bash
pnpm install                    # install all workspaces
pnpm dev                        # frontend :3000 + backend :4000 in parallel
pnpm build                      # build both
pnpm --filter frontend dev      # frontend only
pnpm --filter backend dev       # backend only
```

## Conventions (defaults)

- TypeScript strict everywhere. No `any` without a `// reason: ...` comment.
- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`).
- Frontend route handlers and server components: use `lib/supabase/server.ts`. Browser code: `lib/supabase/client.ts`. Never mix.
- Backend protected routes: mount `requireAuth` from `src/middleware/auth.ts`.
- Frontend → backend calls: go through `frontend/src/lib/api.ts` so the bearer token is attached automatically.

## Claude Code Setup

- This repo ships only one skill: `adapt-project`. It reads `projectscope.md` and renders `.claude/templates/` into `.claude/agents/` and `.claude/skills/`, tailored to the actual project.
- After you fill in `projectscope.md`, run `/adapt`. Subsequent edits to `projectscope.md` plus another `/adapt` regenerate everything.
- Templates in `.claude/templates/` are the source of truth. Generated files in `.claude/agents/` and `.claude/skills/` are overwritten on every adapt.

## When in doubt

1. Check generated agents in `.claude/agents/` (after running `/adapt`).
2. Read existing patterns under `frontend/src/lib/supabase/` and `backend/src/middleware/`.
3. Match what's already there before introducing a new pattern.
