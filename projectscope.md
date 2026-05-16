---
name: <your project name>
pitch: <one-line description>
domain: <e.g. fintech, education, dev tools, social, healthcare>
target_users: <who uses it>
key_entities:
  - Entity1
  - Entity2
auth: keep-supabase        # keep-supabase | custom | none
backend: keep-express      # keep-express | trpc | none | custom
testing: none              # vitest+playwright | jest | none
deploy: tbd                # vercel | render | fly | self-host | tbd
conventions: <free-form notes on naming, file organization, etc>
---

## Notes

<Any extra context the Claude config should know about — special constraints,
third-party integrations, design language, accessibility requirements,
non-obvious domain rules, etc.>

---

# How to use this file

1. Fill in every field above. Replace the `<placeholder>` text.
2. In Claude Code, run `/adapt`.
3. The `adapt-project` skill will:
   - rewrite the root `CLAUDE.md` with your project's specifics,
   - generate tailored agents under `.claude/agents/`,
   - generate tailored skills under `.claude/skills/`.
4. Re-run `/adapt` any time you change this file. Generated files are
   overwritten; templates under `.claude/templates/` are not.
