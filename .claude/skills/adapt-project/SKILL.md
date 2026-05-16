---
name: adapt-project
description: Use when the user runs /adapt, edits projectscope.md, or asks to "adapt the blueprint", "tailor Claude config for this project", or "rewrite the agents for this project". Reads projectscope.md plus current repo state, renders .claude/templates/ into .claude/agents/ + .claude/skills/, and overwrites root CLAUDE.md with project-specific guidance. Idempotent and re-runnable.
---

# adapt-project

Bootstrap the project's Claude Code configuration from `projectscope.md`.

## When to invoke

- The user runs `/adapt`.
- The user has just edited `projectscope.md` and wants the change reflected.
- The user asks to "adapt the blueprint", "tailor the Claude config", "regenerate the agents for this project", or similar.

## Inputs

- **`projectscope.md`** at the repo root. Required. Contains a YAML front-matter block plus a free-form Notes section.
- **`.claude/templates/`** — directory of `*.tpl` files. The source of truth for what gets generated.
- **Current repo state** — file system. Used to enumerate existing pages and backend routes so generated agents know the real layout.

## Outputs (overwritten on every run)

- Root `CLAUDE.md`
- Files under `.claude/agents/` (one per agent template)
- Files under `.claude/skills/` (one folder per skill template)

## Procedure

Follow these steps exactly. Do not invent extra steps.

### 1. Load the scope file

Read `projectscope.md` at the repo root.

If the file is missing, or every field still contains a `<placeholder>`-style value, halt and print:

> projectscope.md has not been filled in. Edit it with the project's details (name, pitch, domain, key entities, auth, backend, testing, deploy, conventions) and run /adapt again.

Do not generate anything in that case.

### 2. Parse the variables

Extract the YAML front matter and the body after the front matter. Build this variable map:

| Variable           | Source                              |
|--------------------|--------------------------------------|
| `PROJECT_NAME`     | `name`                              |
| `PITCH`            | `pitch`                             |
| `DOMAIN`           | `domain`                            |
| `TARGET_USERS`     | `target_users`                      |
| `KEY_ENTITIES`     | `key_entities` joined as `A, B, C`  |
| `AUTH`             | `auth`                              |
| `BACKEND`          | `backend`                           |
| `TESTING`          | `testing`                           |
| `DEPLOY`           | `deploy`                            |
| `CONVENTIONS`      | `conventions`                       |
| `NOTES`            | Everything after the `---` close until the "How to use this file" section (or end of file if absent) |

For any missing field, substitute the literal string `(unspecified)` and continue. Do not halt for partial scopes after the initial placeholder check has passed.

### 3. Probe the repo

Use `Glob` to collect:

- `EXISTING_PAGES` — list of `frontend/src/app/**/page.tsx`, rendered as their route paths (e.g. `/`, `/login`, `/dashboard`, `/settings`).
- `EXISTING_ROUTES` — list of `backend/src/routes/*.ts`, rendered as `GET /<name>` (consult the file briefly if a route needs a different verb).

If either folder is absent, set the value to `(none yet)`.

### 4. Render templates

Walk `.claude/templates/` recursively. For each file ending in `.tpl`:

1. Read its contents.
2. Replace every `{{VARIABLE}}` token with the corresponding value from the variable map. Unknown tokens (no matching variable) stay untouched and are reported as warnings at the end.
3. Compute the output path: take the template path, drop the `.claude/templates/` prefix, drop the `.tpl` suffix, and prefix with `.claude/`.

   Examples:
   - `.claude/templates/CLAUDE.md.tpl` → repo root `CLAUDE.md` (special case — root, not under `.claude/`).
   - `.claude/templates/agents/code-reviewer.md.tpl` → `.claude/agents/code-reviewer.md`.
   - `.claude/templates/skills/conventions/SKILL.md.tpl` → `.claude/skills/conventions/SKILL.md`.
4. Create any missing parent directories.
5. Write the rendered content, overwriting any existing file.

The only special-case path mapping is `CLAUDE.md.tpl` → repo-root `CLAUDE.md`. All others mirror the template path under `.claude/`.

### 5. Report

After all files are written, print a compact table to the user:

```
template                                            -> output                                action
.claude/templates/CLAUDE.md.tpl                     -> CLAUDE.md                              overwritten
.claude/templates/agents/code-reviewer.md.tpl       -> .claude/agents/code-reviewer.md        created
.claude/templates/agents/feature-planner.md.tpl     -> .claude/agents/feature-planner.md      created
...
```

Then, if any `{{TOKEN}}` placeholders went unresolved, list them under "Unresolved tokens:" with the file path of the first occurrence.

Do not print explanations beyond that. The user can re-run after editing `projectscope.md`.

## Rules

- **Templates are read-only.** Never edit anything under `.claude/templates/` from this skill. They are the source of truth.
- **Generated files are write-only.** Always overwrite. Do not merge with existing content. If the user has manually edited a generated file, that edit is expected to be lost on the next `/adapt`.
- **Skip nothing.** Always render every template, even if the output appears identical to the existing file.
- **Do not touch other files.** This skill changes only `CLAUDE.md` at the repo root and files under `.claude/agents/` and `.claude/skills/`.
- **Do not commit.** Leave staging and committing to the user.

## Failure modes

| Symptom                                        | Cause                                                 | Recovery                                                                 |
|------------------------------------------------|-------------------------------------------------------|--------------------------------------------------------------------------|
| Halt at step 1                                 | `projectscope.md` missing or all placeholders         | Edit the file, fill the required fields, re-run `/adapt`.                |
| "Unresolved tokens" in report                  | Template references a variable not in the map         | Either add the field to `projectscope.md`'s front matter, or edit the template to drop the token. |
| Generated agent looks wrong                    | Template is wrong                                     | Edit the template under `.claude/templates/`, re-run `/adapt`.           |
| Want a fresh start                             | Generated files diverged                              | `git checkout` the templates, delete generated files, re-run `/adapt`.   |
