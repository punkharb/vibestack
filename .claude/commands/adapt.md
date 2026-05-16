---
description: Prune vendored agents/skills/commands under .claude/ to fit projectscope.md and rebadge survivors. Invokes the adapt-project skill.
allowed-tools: Bash, Read, Edit
---

# /adapt

Invoke the `adapt-project` skill. It runs `.claude/scripts/adapt.mjs`,
which:

1. Reads `projectscope.md` and validates the required fields are filled in.
2. Deletes vendored agents/skills/commands not relevant to the project.
3. Rewrites the `description:` of survivors to include the project name and domain.
4. Rewrites root `CLAUDE.md`.

Run with `--dry-run` first if you want to see the plan before deletes:

```bash
node .claude/scripts/adapt.mjs --dry-run
```
