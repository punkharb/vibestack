---
name: conventions
description: Use when writing or reviewing code, commits, or PRs for {{PROJECT_NAME}}. Loads project-specific conventions, commit format, and supabase/migration discipline so that generated code matches the rest of the codebase.
---

# Conventions — {{PROJECT_NAME}}

These are the project rules. Apply them to every change. They override generic
defaults, but never the user's explicit instructions.

## Project context

- **{{PROJECT_NAME}}** — {{PITCH}}
- **Domain:** {{DOMAIN}}
- **Key entities:** {{KEY_ENTITIES}}

## Project-specific conventions

{{CONVENTIONS}}

## Baseline (always apply)

### TypeScript

- Strict everywhere. No new `any`.
- Prefer `type` for unions/aliases, `interface` for object contracts that may be extended.
- Use `satisfies` for literal config objects to keep inference + validation.

### File organization

- Frontend pages → `frontend/src/app/<route>/page.tsx`.
- Frontend shared components → `frontend/src/components/`.
- Frontend client/server utility split → `frontend/src/lib/supabase/{client,server,middleware}.ts`.
- Backend routes → `backend/src/routes/<name>.ts`, mounted in `backend/src/index.ts`.
- Backend middleware → `backend/src/middleware/`.

### Supabase / data

- Use `@supabase/ssr` patterns in the frontend.
- `supabase.auth.getUser()` for any auth-gated path. Never trust `getSession()` alone for authorization.
- Service-role key is server-only. Never reference `SUPABASE_SERVICE_ROLE_KEY` from a file under `frontend/`.
- Database changes ship as migrations in version control. Never edit production data ad-hoc.

### API boundary

- Frontend calls backend through `frontend/src/lib/api.ts`. That wrapper attaches the user's bearer token automatically.
- New backend route requiring identity → mount `requireAuth`.

### Commits — Conventional Commits

Format:

```
<type>(<scope>): <imperative summary, ≤72 chars>

<optional body — only when "why" isn't obvious>
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `build`, `ci`.

Subject in imperative mood: "add user filter", not "added user filter".

### Testing

Current setup: {{TESTING}}.

If testing is `none`, do not invent test files — but flag in PR descriptions
that a feature is untested.

## Notes

{{NOTES}}
