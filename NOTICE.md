# NOTICE

## Vendored content

Portions of this repository are vendored from
[`affaan-m/everything-claude-code`](https://github.com/affaan-m/everything-claude-code),
licensed under the MIT License (© 2026 Affaan Mustafa). The full upstream
license text is preserved at [`.claude/UPSTREAM-LICENSE`](.claude/UPSTREAM-LICENSE).

**Pinned commit:** `6d130cfcd5d06b42c7eb30be8e109cfa87fde197`

**Vendored paths (upstream → this repo):**

| Upstream    | Here                       |
|-------------|-----------------------------|
| `agents/`   | `.claude/agents/`           |
| `skills/`   | `.claude/skills/`           |
| `commands/` | `.claude/commands/`         |
| `rules/`    | `.claude/rules/`            |
| `.mcp.json` | `.mcp.json.example`         |
| `LICENSE`   | `.claude/UPSTREAM-LICENSE`  |

The following upstream paths are **not** vendored:
`scripts/`, `hooks/`, `tests/`, `examples/`, `mcp-configs/`, IDE adapter
folders (`.cursor/`, `.codex/`, `.opencode/`, etc.), and top-level docs.

Some vendored skills and agents reference utilities that live in those
non-vendored paths. They are tolerated as documentation. The `/adapt`
slash command prunes most non-applicable content per project on first run.

## First-party content

Everything else in this repository — `frontend/`, `backend/`, root
configuration, the `adapt-project` skill, the `/adapt` command, and the
`.claude/scripts/adapt.mjs` worker — is original to this project and
covered by the repository's own license (see root `LICENSE` once present).

## Re-vendoring

To update the vendored content to a newer upstream:

```bash
SHA=<new sha>
git clone --depth 1 https://github.com/affaan-m/everything-claude-code.git /tmp/ecc-vendor
cd /tmp/ecc-vendor && git fetch --depth 1 origin "$SHA" && git checkout "$SHA"
# back in this repo:
rm -rf .claude/agents .claude/skills .claude/commands .claude/rules
cp -r /tmp/ecc-vendor/{agents,skills,commands,rules} .claude/
cp /tmp/ecc-vendor/.mcp.json .mcp.json.example
cp /tmp/ecc-vendor/LICENSE .claude/UPSTREAM-LICENSE
# update the SHA in this file, commit, then re-run /adapt
```
