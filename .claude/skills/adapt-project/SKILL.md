---
name: adapt-project
description: Use when the user runs /adapt, edits projectscope.md, or asks to "adapt the blueprint", "prune unused agents", "tailor Claude config", or "rewrite agents for this project". Runs .claude/scripts/adapt.mjs which deletes vendored agents/skills/commands not relevant to projectscope.md and rebadges the survivors with the project name and domain.
---

# adapt-project

Tailor the vendored Claude Code toolkit (from
[`affaan-m/everything-claude-code`](https://github.com/affaan-m/everything-claude-code),
MIT) to the project described in `projectscope.md`.

## When to invoke

- The user runs `/adapt`.
- The user just edited `projectscope.md` and wants it reflected.
- Phrases: "adapt the blueprint", "prune unused agents", "tailor Claude config", "rewrite agents for this project".

## What this skill does

It shells out to the worker script. Claude does not need to delete files
manually — that's the script's job.

```bash
node .claude/scripts/adapt.mjs               # apply
node .claude/scripts/adapt.mjs --dry-run     # plan only
node .claude/scripts/adapt.mjs --verbose     # add per-file kept/dropped lists
```

## Procedure

1. **Sanity-check `projectscope.md`.** Read the file. If `name`, `pitch`, or `domain` still contain `<placeholder>` text, stop and tell the user to fill them in. Do not call the script in that state.
2. **Dry-run first.** Run `node .claude/scripts/adapt.mjs --dry-run` and show the output.
3. **Pause for confirmation.** Surface the kept/dropped counts to the user. Confirm before deleting (~hundreds of files).
4. **Apply.** Run `node .claude/scripts/adapt.mjs` (no flag). Print the report.
5. **Surface follow-ups.** Mention that:
   - The pruned files are deletable via the `/adapt` script and recoverable via `git checkout`.
   - Re-running adds nothing back — to widen the keep-set after a prune, re-vendor from upstream (see `NOTICE.md`).
   - To change which files survive, edit the `ALWAYS_KEEP_*`, `ALWAYS_DROP`, and `buildKeywords()` sections at the top of `.claude/scripts/adapt.mjs`.

## What the script does internally

- Parses `projectscope.md` YAML front matter.
- Builds a keyword pool from: a baseline (`typescript javascript react nextjs tailwind css web api frontend backend`) plus tokens from `auth`, `backend`, `testing`, `domain`, `target_users`, `key_entities`, `conventions`, `notes`.
- For each agent / skill / command, splits the filename on `-_./` and keeps it iff (a) it is in an `ALWAYS_KEEP_*` list, or (b) any of its tokens are in the keyword pool. Files listed in `ALWAYS_DROP` always die.
- Hard-deletes everything else.
- For survivors, prepends `[{name} · {domain}]` to the `description:` line of the YAML front matter, idempotently.
- Rewrites root `CLAUDE.md` from an inline template that lists the kept agents and skills.

## Rules

- **Do not delete or rewrite by hand.** Always go through the script.
- **Do not commit the result for the user.** Leave staging and committing to them.
- **Do not vendor or re-vendor.** That is a manual step documented in `NOTICE.md`. The skill only prunes what is already on disk.
- **Do not edit files under `.claude/agents/`, `.claude/skills/`, or `.claude/commands/` manually.** Those are vendored. To change behavior, edit `.claude/scripts/adapt.mjs` (or `projectscope.md`).

## Failure modes

| Symptom                                            | Cause                                                    | Recovery                                                                                                |
|----------------------------------------------------|----------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| `projectscope.md is not filled in.`                | Required fields still placeholders                       | Edit `projectscope.md`. Re-run.                                                                         |
| Counts look wrong (too many kept / dropped)        | Keyword pool too lenient / strict                         | Run with `--verbose` to inspect, then edit `ALWAYS_KEEP_*` / keyword logic in `adapt.mjs`.              |
| Want a file back                                   | Was pruned by earlier `/adapt`                            | `git checkout <commit-with-vendor> -- .claude/agents/<file>.md` (or restore from `NOTICE.md` pin).      |
| Description double-prefixed                        | Should not happen — prefix is idempotent. Bug.            | Inspect the front matter, fix manually, file an issue against `adapt.mjs`.                              |
