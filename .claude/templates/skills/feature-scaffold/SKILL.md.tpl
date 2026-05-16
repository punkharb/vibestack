---
name: feature-scaffold
description: Use when adding a new page, a new backend route, or a new shared component to {{PROJECT_NAME}}. Encodes the exact file paths and minimal patterns that match this stack (Next.js 16 App Router + Express + Supabase + shadcn base-ui).
---

# feature-scaffold — {{PROJECT_NAME}}

How to add common pieces to this codebase. Follow the layout below before
inventing a new structure.

Existing surface to reference:
- Frontend pages: {{EXISTING_PAGES}}
- Backend routes: {{EXISTING_ROUTES}}

## Add a new public page

1. Create `frontend/src/app/<route>/page.tsx`.
2. Use a server component by default. Add `"use client"` only when you need browser-only APIs (state, effects, event handlers).
3. For navigation buttons, use `<Link className={buttonVariants()}>` — the shadcn base-ui `Button` does not support `asChild`.

## Add a new protected page

1. Place the page under a folder that has a `layout.tsx` performing the auth check (see `frontend/src/app/dashboard/layout.tsx` and `settings/layout.tsx` for the pattern).
2. If you need a new gated section, create `frontend/src/app/<section>/layout.tsx` that calls `await createClient()` from `lib/supabase/server.ts`, runs `supabase.auth.getUser()`, and redirects to `/login` when null.

## Add a new backend route

1. Create `backend/src/routes/<name>.ts` exporting `export const <name>Router = Router()`.
2. For protected routes, mount `requireAuth` from `backend/src/middleware/auth.ts`.
3. Mount in `backend/src/index.ts`: `app.use("/<name>", <name>Router);`.
4. Re-run `pnpm --filter backend dev`.

## Call the backend from the frontend

Always go through `frontend/src/lib/api.ts`:

```ts
import { apiFetch } from "@/lib/api";
const data = await apiFetch<MyType>("/my-route");
```

This attaches the Supabase access token automatically.

## Add a shared UI component

- shadcn-style primitives → install with `pnpm dlx shadcn@latest add <name>` from `frontend/`. Files land in `frontend/src/components/ui/`.
- Project-specific components → `frontend/src/components/<name>.tsx`. Use the `Nav` component as a reference for client-side patterns.

## Add a domain entity ({{KEY_ENTITIES}})

1. Schema lives in Supabase. Add a migration for the new table.
2. Enable RLS. Write policies so each user sees only their own rows.
3. Optional: generate TypeScript types with `pnpm dlx supabase gen types typescript ...` and place under `frontend/src/lib/database.types.ts`.
4. CRUD from the client → use `lib/supabase/client.ts`. Server-only mutations that need to bypass RLS → put behind a backend route protected by `requireAuth`.

## Conventions

{{CONVENTIONS}}
