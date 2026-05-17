---
name: artifact-port
description: Use when the user pastes an HTML+CSS or JSX/TSX UI artifact (e.g. from a claude.ai conversation or artifact) and wants it ported 1:1 into the vibestack frontend (Next.js 16 + Tailwind 4 + shadcn/ui at frontend/src). Enforces token mapping to globals.css OKLch vars, shadcn primitive substitution, and visual-parity validation. Adapted from the figma-implement-design workflow for HTML/JSX sources instead of Figma nodes.
---

# Artifact Port

## Overview

This skill provides a structured workflow for translating a UI artifact produced elsewhere (typically claude.ai HTML+CSS or JSX/TSX) into production-ready code inside `frontend/src` with 1:1 visual fidelity. It ensures the port uses the repo's shadcn/ui primitives, Tailwind v4 `@theme` tokens, and project path aliases — rather than dropping raw foreign markup into the codebase.

## When to Use

- The user pastes or links a self-contained UI snippet from claude.ai (or any external source) and asks to "add this to the app", "make it match", "port this design", "use this layout", etc.
- The deliverable is real code inside `frontend/src/`, not a sandbox.
- The target visual must match the source as closely as the design system allows.

## When Not to Use

- The user wants you to **generate** a new design from scratch — use `frontend-design:frontend-design` instead.
- The source is a Figma file or URL — use `figma:figma-implement-design`.
- The source is a folder of screenshots and the target is Vue — use `ui-to-vue`.
- The user only wants design tokens audited — use `design-system`.

## Inputs Accepted

- A single `.html` blob containing markup plus `<style>` or inline `style` attributes.
- A single `.tsx` or `.jsx` blob (React component, optionally with Tailwind classes).
- A pasted code fence inside the prompt. If multiple snippets are pasted, ask which one is the source of truth before starting Step 1.

## Required Workflow

**Follow these steps in order. Do not skip steps.**

### Step 1 — Capture Artifact

1. Create `frontend/.scratch/` if missing and add it to `frontend/.gitignore` if not already ignored.
2. Save the raw artifact verbatim to `frontend/.scratch/artifact-<slug>.{html,tsx}`. Slug should be short kebab-case derived from what the artifact is (e.g. `pricing-card`, `onboarding-step-2`).
3. This file is the **source of truth** for the rest of the workflow. Do not edit it.

### Step 2 — Extract Design Context

Produce a manifest in your reply (no file written). For the artifact, list:

- **Colors** — every unique `#hex`, `rgb()`, `hsl()`, `oklch()`, and Tailwind arbitrary color (`bg-[#xxx]`).
- **Typography** — font families, weights, sizes, line heights.
- **Radii** — every `border-radius` value or Tailwind `rounded-*` token.
- **Spacing** — distinct padding/margin/gap values.
- **Breakpoints** — any `@media` rules or responsive class prefixes.
- **States** — hover / focus / active / disabled / aria-* selectors present.
- **Assets** — `<img src>`, `<svg>`, icon component imports, background-image URLs.
- **Behavior** — any inline JS, event handlers, state hooks. Flag explicitly: this is *behavior*, not style; do not lose it.

### Step 3 — Visual Reference

- If the source is HTML, open `frontend/.scratch/artifact-<slug>.html` in a browser (or via Playwright MCP if available) and take screenshots at **1440**, **768**, **375** widths.
- If the source is JSX/TSX, mount it once in a throwaway route (e.g. `frontend/src/app/(scratch)/_artifact-<slug>/page.tsx`) and screenshot at the same widths.
- Note the screenshot paths in your reply. These are the diff target for Step 7. Delete the scratch route after porting.

### Step 4 — Asset Handling

- Inline `<svg>` → stays inline in the ported component.
- `<img src>` → `next/image` with explicit `width` and `height` matching the artifact's rendered size; `alt` required.
- Lucide-style icons → import from `lucide-react` (already used in this repo per `frontend/components.json`).
- Remote image URLs → only keep if already allow-listed in `next.config.*`; otherwise download to `frontend/public/ported/<slug>/<file>` and reference as `/ported/<slug>/<file>`.
- Fonts → do **not** add new `@import url(fonts.googleapis…)`. Map to `var(--font-sans)`, `var(--font-mono)`, or `var(--font-heading)` from `globals.css`.

### Step 5 — Translate to Project Conventions

This is the substitution table the skill enforces.

| Artifact source | Replace with |
|---|---|
| Raw `#hex` / `rgb()` / inline `oklch()` | Nearest `var(--color-*)` from `frontend/src/app/globals.css` (`--color-primary`, `--color-secondary`, `--color-muted`, `--color-accent`, `--color-destructive`, `--color-background`, `--color-foreground`, sidebar, chart, etc.). If no token is within reasonable visual distance, add a new token under `@theme` and use it. **Never** leave a literal hex in component code. |
| Tailwind arbitrary color (`bg-[#101010]`) | Token-backed utility (`bg-background`, `bg-foreground`, `bg-card`, `bg-muted`, …). |
| Font family in CSS / JSX | `var(--font-sans)` / `var(--font-mono)` / `var(--font-heading)`. Do not add a new font without user confirmation. |
| `border-radius: Npx` or `rounded-[Npx]` | Nearest `var(--radius-*)` (`sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`). |
| `<button …>` | `import { Button } from "@/components/ui/button"`. Pick `variant` from `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`. Pick `size` from `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`. |
| `<input …>` | `import { Input } from "@/components/ui/input"`. |
| `<label …>` | `import { Label } from "@/components/ui/label"`. |
| Card-like container | `import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"` (use the sub-parts that exist; do not invent new sub-parts). |
| String concatenation for classes / `clsx` | `import { cn } from "@/lib/utils"` and call `cn(...)`. |
| Inline `<svg>` from a known icon set | Corresponding `lucide-react` icon. |
| Inline `style={{ … }}` for static values | Tailwind utilities backed by `@theme` tokens. Keep inline `style` only for genuinely runtime-dynamic values (e.g. `transform: translateX(${x}px)`). |
| Plain `<a href="/…">` for internal nav | `import Link from "next/link"`. External links stay as `<a>` with `rel="noopener noreferrer"`. |
| Data fetch to own backend | `import { apiFetch } from "@/lib/api"` so the Supabase bearer is attached. |
| Server-side Supabase | `frontend/src/lib/supabase/server.ts`. Client-side Supabase: `frontend/src/lib/supabase/client.ts`. Never mix. |

**File placement rules:**

- A full page → `frontend/src/app/<route>/page.tsx` (add `layout.tsx` only if the artifact implies a shared shell).
- A reusable section → `frontend/src/components/<feature>/<Component>.tsx`. PascalCase file, **named export**, CVA when the artifact implies ≥2 visual variants.
- A new shared primitive that belongs to the design system → `frontend/src/components/ui/<name>.tsx`. Only add with user confirmation; do not silently grow shadcn.
- Component shape:
  ```tsx
  import { cn } from "@/lib/utils"

  interface PricingCardProps {
    title: string
    price: string
    className?: string
  }

  export function PricingCard({ title, price, className }: PricingCardProps) {
    return (
      <div className={cn("…token-backed-utilities…", className)}>…</div>
    )
  }
  ```
  - PascalCase file name, named export, explicit prop interface.
  - No `React.FC`.
  - No `any` without a `// reason:` comment per the repo's TypeScript rules.
  - `className?: string` is accepted and merged through `cn()`.

### Step 6 — Achieve 1:1 Parity

1. Run `pnpm --filter frontend dev`.
2. Mount the new component on its real route, or on a temporary scratch route if it is a sub-section, and visually compare against the Step 3 screenshots at 1440 / 768 / 375.
3. Adjust spacing, font weights, and radii by swapping between tokens (`--radius-md` ↔ `--radius-lg`, `bg-muted` ↔ `bg-muted/70`, etc.). **Never** reintroduce literal hex or `rounded-[Npx]` to "fix" a small mismatch.
4. If the source design uses a color that genuinely has no nearby token, add a single new entry to `globals.css` under `@theme` (both light and dark) rather than inlining the value.

### Step 7 — Validate

Before reporting the port complete, run through this checklist. All must pass:

- [ ] No literal `#hex`, `rgb(`, `hsl(`, or `oklch(` outside `frontend/src/app/globals.css`.
- [ ] No new `@import url(fonts.googleapis…)` or new font package.
- [ ] All `rounded-*` values resolve to `var(--radius-*)` (no `rounded-[Npx]` arbitrary values).
- [ ] All buttons/inputs/labels/cards in the source that map to a shadcn primitive use that primitive.
- [ ] The component file is PascalCase with a named export.
- [ ] Props have an explicit `interface` (no `any` without `// reason:`).
- [ ] `pnpm --filter frontend build` passes.
- [ ] `pnpm --filter frontend lint` passes.
- [ ] Visual diff vs Step 3 screenshots is within token-rounding tolerance at all three widths.
- [ ] If `frontend/src/app/globals.css` defines a `.dark` block, the ported component renders coherently with `.dark` toggled on `<html>`.
- [ ] Any temporary scratch route from Step 3 / Step 6 has been deleted.
- [ ] `frontend/.scratch/artifact-<slug>.…` is gitignored.

## Implementation Rules

### Component Organization

- Components live under `frontend/src/components/`; primitives under `frontend/src/components/ui/`.
- Pages live under `frontend/src/app/<route>/page.tsx`.
- Never colocate ported components under `frontend/.scratch/`.

### Design System Integration

- Always check `frontend/src/components/ui/` (currently `button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`) before recreating a primitive.
- Map artifact colors to existing `--color-*` tokens before considering a new token.
- Use the project's `cn()` helper — not a fresh `clsx` import.

### Code Quality

- TypeScript strict. `any` requires a `// reason:` comment.
- No `console.log` left in ported code.
- Server / client Supabase imports stay separate (`server.ts` vs `client.ts`).
- Backend calls go through `@/lib/api`.

## Examples

### Example 1 — Porting a pricing card (HTML input)

User pastes an HTML+CSS pricing card from a claude.ai conversation.

**Actions:**

1. Save it to `frontend/.scratch/artifact-pricing-card.html`.
2. Extract manifest: 3 colors (`#0a0a0a`, `#f5f5f5`, `#3b82f6`), 1 font (Inter), 2 radii (`12px`, `9999px`), one CTA button.
3. Screenshot at 1440 / 768 / 375.
4. Translate:
   - `#0a0a0a` → `bg-foreground`.
   - `#f5f5f5` → `bg-muted`.
   - `#3b82f6` → closest is `--color-primary`; use it.
   - Inter → drop, use `var(--font-sans)`.
   - `12px` → `rounded-lg`. `9999px` → `rounded-full`.
   - CTA `<button>` → `<Button variant="default" size="lg">`.
   - Card container → `<Card><CardHeader><CardTitle>…</CardTitle></CardHeader><CardContent>…</CardContent></Card>`.
5. Result file: `frontend/src/components/pricing/PricingCard.tsx` with a named export, `PricingCardProps` interface, and `className?: string` merged via `cn()`.
6. Mount on the relevant page and diff vs Step 3 screenshots.
7. Run validation checklist.

### Example 2 — Porting a settings form (JSX input with arbitrary Tailwind)

User pastes a TSX settings form using classes like `bg-[#101010]` and `rounded-[14px]`.

**Actions:**

1. Save to `frontend/.scratch/artifact-settings-form.tsx`.
2. Extract manifest: arbitrary color `#101010`, arbitrary radius `14px`, two `<input>` rows with labels, one submit button.
3. Mount in a scratch route, screenshot at 1440 / 768 / 375.
4. Translate:
   - `bg-[#101010]` → `bg-background` (in `.dark`) / `bg-foreground` (in `:root`) — pick the one that matches the rendered intent in both themes.
   - `rounded-[14px]` → `rounded-xl` (nearest `--radius-xl`) or, if visually off, add `--radius-2xl` adjustment and use that.
   - `<input>` → `<Input>` from `@/components/ui/input`.
   - `<label>` → `<Label>` from `@/components/ui/label`.
   - Submit `<button>` → `<Button>` with the matching variant/size.
   - Class concatenation `(`${base} ${active ? "…" : ""}`)` → `cn(base, active && "…")`.
5. Result file: `frontend/src/components/settings/SettingsForm.tsx`.
6. Diff at all three widths, toggle `.dark` on `<html>`, confirm parity in both themes.
7. Delete the scratch route, run validation checklist.

## Best Practices

### Always Capture Before Translating

Do not start substituting components without Steps 1–3. The frozen artifact file plus the screenshots are what makes the port verifiable.

### Token First, Then Component, Then Layout

When translating, fix tokens (colors, radii, fonts) first, swap in shadcn primitives second, adjust layout utilities last. Reversing this order tends to leave literal hex behind.

### Reuse Over Recreation

If a primitive already exists in `frontend/src/components/ui/`, use it — even if the artifact's version looks slightly different. Adjust via `className` and CVA variants, not by forking a new copy.

### Document Deviations

If the port deliberately deviates from the artifact (accessibility, RTL, dark-mode coherence), add a single-line comment at the point of deviation explaining why.

## Common Issues and Solutions

### Issue: No shadcn primitive matches the artifact's element

**Cause:** The artifact uses a widget (toggle, tabs, dialog) that is not yet in `frontend/src/components/ui/`.
**Solution:** Ask the user before adding a new primitive. If approved, install via the project's shadcn workflow rather than hand-rolling, and re-run Step 5 with the new primitive.

### Issue: The closest `--color-*` token is visibly different from the artifact color

**Cause:** The artifact uses a color outside the design system's range.
**Solution:** Add one new entry to `@theme` in `globals.css` (both `:root` and `.dark` blocks). Use the new token in the ported component. Do not inline the color.

### Issue: The artifact uses `rounded-[14px]` and no `--radius-*` matches

**Cause:** Mid-radius gap between tokens.
**Solution:** Pick the nearer token and accept a 1–2px difference, or add a single intermediate `--radius-*` token. Do not leave `rounded-[Npx]` in component code.

### Issue: The ported component looks right in light theme but broken in dark theme

**Cause:** Hardcoded color that only works against one background.
**Solution:** Replace with a `--color-*` token whose `.dark` value is defined in `globals.css`. Re-run Step 6 with `.dark` toggled.

## Additional Resources

- Repo conventions: `CLAUDE.md` (root) and `.claude/rules/web/*`, `.claude/rules/typescript/*`.
- Token surface: `frontend/src/app/globals.css`.
- Shadcn config: `frontend/components.json`.
- Existing primitives: `frontend/src/components/ui/{button,card,input,label}.tsx`.
- Helpers: `frontend/src/lib/utils.ts` (`cn`), `frontend/src/lib/api.ts` (`apiFetch`), `frontend/src/lib/supabase/{client,server}.ts`.
