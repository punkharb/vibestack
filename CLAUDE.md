# CLAUDE.md

> This is the generic blueprint version. After cloning, edit
> [`projectscope.md`](./projectscope.md) and run `/adapt` in Claude Code
> to prune the vendored agent/skill toolkit and rewrite this file for your
> specific project.

## Project Overview

A reusable web blueprint plus a battle-tested Claude Code toolkit. Two
top-level apps:

- `frontend/` — Next.js 16 (App Router, TS, Tailwind 4, shadcn/ui)
- `backend/` — Express 4 + TypeScript

Supabase handles auth and Postgres. The frontend uses `@supabase/ssr` for
cookie-based auth. The backend verifies bearer tokens against the
service-role admin client.

## Claude Code toolkit

This repo vendors agents, skills, commands, and rules from
[`affaan-m/everything-claude-code`](https://github.com/affaan-m/everything-claude-code)
(MIT — see [`NOTICE.md`](./NOTICE.md) and `.claude/UPSTREAM-LICENSE`).

```
.claude/
├── agents/      60 specialist subagents (until pruned)
├── skills/      230+ workflow skills (until pruned)
├── commands/    75 slash commands (until pruned)
├── rules/       20 always-follow rules
├── scripts/
│   └── adapt.mjs        prune + rebadge worker
├── skills/adapt-project/SKILL.md   the only first-party skill
└── commands/adapt.md               /adapt entry point
```

### Workflow per clone

1. Edit `projectscope.md` (name, pitch, domain, key_entities, etc.).
2. Run `/adapt` in Claude Code (or `node .claude/scripts/adapt.mjs`).
3. The script hard-deletes vendored agents/skills/commands whose filename
   tokens don't intersect your project's keywords. Survivors get
   `[{name} · {domain}]` prepended to their `description:` line. Root
   `CLAUDE.md` is rewritten.
4. Commit the diff on a branch so you can re-vendor cleanly later.

### How to tune the prune

Edit `.claude/scripts/adapt.mjs`:

- `ALWAYS_KEEP_AGENTS`, `ALWAYS_KEEP_SKILLS`, `ALWAYS_KEEP_COMMANDS` — names that survive regardless of keywords.
- `ALWAYS_DROP` — names that die regardless of keywords.
- `buildKeywords(vars)` — how `projectscope.md` fields are mapped into the keyword pool.

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

- TypeScript strict. No `any` without a `// reason: ...` comment.
- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`).
- Frontend route handlers / server components: `lib/supabase/server.ts`. Browser code: `lib/supabase/client.ts`. Never mix.
- Backend protected routes: mount `requireAuth` from `backend/src/middleware/auth.ts`.
- Frontend → backend calls: go through `frontend/src/lib/api.ts` so the bearer token is attached automatically.

## When in doubt

1. Run `/adapt` so this file describes the project, not the blueprint.
2. Then check the relevant agent under `.claude/agents/`.
3. Match existing patterns in `frontend/src/` and `backend/src/` before inventing new ones.
