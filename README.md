# vibestack

[![ci](https://github.com/punkharb/vibestack/actions/workflows/ci.yml/badge.svg)](https://github.com/punkharb/vibestack/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Reusable full-stack web blueprint with a battle-tested Claude Code toolkit baked in. Clone, fill in `projectscope.md`, run `/adapt`, start building.

**Stack:** Next.js 16 (App Router, TS) · Tailwind CSS 4 · shadcn/ui · Express + TS · Supabase (Auth + Postgres) · pnpm workspaces.

**Claude Code:** ships with 60 agents, 230+ skills, and 75 commands vendored from [`affaan-m/everything-claude-code`](https://github.com/affaan-m/everything-claude-code) (MIT — full credit + license preserved, see [`NOTICE.md`](./NOTICE.md) and [`.claude/UPSTREAM-LICENSE`](./.claude/UPSTREAM-LICENSE)). `/adapt` prunes the ones that don't match your project and rebadges the survivors with your project name + domain.

## Layout

```
.
├── frontend/   Next.js 16 app (port 3000)
└── backend/    Express API (port 4000)
```

## Prerequisites

- Node `>=20`
- pnpm `>=9`
- A Supabase project (free tier fine): https://supabase.com/dashboard

## Supabase project setup (one-time)

1. Sign in at https://supabase.com/dashboard → **New project**. Pick any region; save the database password somewhere safe.
2. Wait ~1 min for provisioning. Then go to **Project Settings → API**:
   - Copy `Project URL` → that's your `NEXT_PUBLIC_SUPABASE_URL` (also `SUPABASE_URL` for the backend).
   - Copy `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Copy `service_role` (reveal first) → `SUPABASE_SERVICE_ROLE_KEY`. **Server-only. Never expose to the browser.**
3. Go to **Authentication → Sign In / Providers**, enable **Email** (password). Disable "Confirm email" for local development so you can sign in immediately after sign-up.
4. (Optional, for deployed builds) **Authentication → URL Configuration**: add your production origin to **Site URL** and **Redirect URLs**.

## Setup

```bash
# 1. clone + (optional) rename folder
git clone https://github.com/punkharb/vibestack.git my-project
cd my-project

# 2. install all workspace deps
pnpm install

# 3. configure env
cp frontend/.env.local.example frontend/.env.local
cp backend/.env.example backend/.env
# fill in SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY in both files

# 4. (optional) opt into the bundled MCP servers — see "MCP servers" section
cp .mcp.json.example .mcp.json

# 5. run dev (frontend + backend in parallel)
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

1. Clone this repo into a new directory (rename it whatever you want; nothing in the code refers to the folder name).
2. Update root `package.json` `name`.
3. Delete or modify example pages under `frontend/src/app`.
4. Add your own routes under `backend/src/routes` and mount in `backend/src/index.ts`.
5. Add tables to Supabase, generate types: `pnpm dlx supabase gen types typescript ...`.

## Claude Code setup

The repo vendors a full agent + skill library from
[`affaan-m/everything-claude-code`](https://github.com/affaan-m/everything-claude-code)
(MIT, see [`NOTICE.md`](./NOTICE.md)) and adds a `/adapt` command that
prunes what doesn't match your project.

```text
.claude/
├── agents/      60 specialist subagents       (vendored, pruned by /adapt)
├── skills/      230+ workflow skills          (vendored, pruned by /adapt)
├── commands/    75 slash commands             (vendored, pruned by /adapt)
├── rules/       20 always-follow rules        (vendored)
├── scripts/
│   └── adapt.mjs        prune + rebadge worker
├── skills/adapt-project/SKILL.md   first-party (the only added skill)
├── commands/adapt.md               first-party (/adapt entry point)
└── UPSTREAM-LICENSE                upstream MIT license
.mcp.json.example                   vendored MCP server config (opt-in)
```

To use:

1. Edit `projectscope.md` — name, pitch, domain, key entities, etc.
2. In Claude Code, run `/adapt` (or `node .claude/scripts/adapt.mjs --dry-run` first).
3. The script hard-deletes vendored agents/skills/commands whose filename
   tokens don't intersect your project's keywords, then prepends
   `[{name} · {domain}]` to the `description:` of every survivor, then
   rewrites root `CLAUDE.md`.
4. Re-run `/adapt` any time `projectscope.md` changes. Pruned files are
   *not* restored automatically — to widen the keep-set after a prune,
   re-vendor (see `NOTICE.md`).

To tune what survives without filling in `projectscope.md` differently,
edit the `ALWAYS_KEEP_*`, `ALWAYS_DROP`, and `buildKeywords()` sections
at the top of `.claude/scripts/adapt.mjs`.

## MCP servers (opt-in)

`.mcp.json.example` ships with six MCP server configurations (github,
context7, exa, memory, playwright, sequential-thinking). To activate:

```bash
cp .mcp.json.example .mcp.json
```

Claude Code reads `.mcp.json` automatically. Servers you don't have
installed locally fail silently — remove their entries from `.mcp.json` if
you want a clean startup. `.mcp.json` is gitignored so your local choices
don't pollute the blueprint.

## Credits

- Claude Code toolkit content (agents / skills / commands / rules / MCP config) is vendored from [`affaan-m/everything-claude-code`](https://github.com/affaan-m/everything-claude-code) (MIT, © 2026 Affaan Mustafa), pinned at commit `6d130cf`. See [`NOTICE.md`](./NOTICE.md) for the full attribution.
- First-party additions (the Next.js + Express + Supabase scaffold, the `adapt-project` skill, and `.claude/scripts/adapt.mjs`) are MIT-licensed by this repo (see [`LICENSE`](./LICENSE)).

## License

[MIT](./LICENSE).
