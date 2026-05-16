---
description: Rewrite .claude/ config and root CLAUDE.md from projectscope.md by invoking the adapt-project skill.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# /adapt

Invoke the `adapt-project` skill. It will read `projectscope.md`, probe the
repo for existing pages and routes, then render every file under
`.claude/templates/` into `.claude/agents/`, `.claude/skills/`, and root
`CLAUDE.md`.

Re-run any time `projectscope.md` changes. Generated files are overwritten;
templates are not.
