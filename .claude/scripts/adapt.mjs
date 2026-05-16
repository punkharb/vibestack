#!/usr/bin/env node
// .claude/scripts/adapt.mjs
//
// Prune vendored ECC content under .claude/ to fit projectscope.md and
// rewrite kept agents'/skills' description: frontmatter line to mention the
// project. Rewrites root CLAUDE.md from an inline template.
//
// Usage:
//   node .claude/scripts/adapt.mjs             # apply changes
//   node .claude/scripts/adapt.mjs --dry-run   # print plan only
//   node .claude/scripts/adapt.mjs --verbose   # add per-file kept/dropped lists

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..", "..");

const DRY = process.argv.includes("--dry-run");
const VERBOSE = process.argv.includes("--verbose");

// -------------------------------------------------------------------------
// Always-keep lists. Anything here survives regardless of projectscope.md.
// Edit these to broaden or narrow the universal toolkit.
// -------------------------------------------------------------------------

const ALWAYS_KEEP_AGENTS = new Set([
  "planner",
  "architect",
  "code-architect",
  "code-reviewer",
  "code-explorer",
  "code-simplifier",
  "refactor-cleaner",
  "doc-updater",
  "docs-lookup",
  "performance-optimizer",
  "security-reviewer",
  "silent-failure-hunter",
  "type-design-analyzer",
  "comment-analyzer",
  "conversation-analyzer",
  "tdd-guide",
  "e2e-runner",
  "pr-test-analyzer",
  "harness-optimizer",
  "build-error-resolver",
  "typescript-reviewer",
  "database-reviewer",
  "opensource-forker",
  "opensource-packager",
  "opensource-sanitizer",
  "chief-of-staff",
  "loop-operator",
]);

const ALWAYS_KEEP_SKILLS = new Set([
  "adapt-project",
  "tdd-workflow",
  "e2e-testing",
  "security-review",
  "security-scan",
  "coding-standards",
  "code-tour",
  "codebase-onboarding",
  "deep-research",
  "deployment-patterns",
  "error-handling",
  "frontend-patterns",
  "frontend-design-direction",
  "backend-patterns",
  "git-workflow",
  "github-ops",
  "plan-orchestrate",
  "prompt-optimizer",
  "repo-scan",
  "search-first",
  "verification-loop",
  "research-ops",
  "project-flow-ops",
  "agentic-engineering",
  "agent-eval",
  "agent-architecture-audit",
  "agent-introspection-debugging",
  "api-design",
  "architecture-decision-records",
  "context-budget",
  "continuous-learning",
  "continuous-learning-v2",
  "documentation-lookup",
  "knowledge-ops",
  "mcp-server-patterns",
  "nextjs-turbopack",
  "postgres-patterns",
  "database-migrations",
  "terminal-ops",
  "token-budget-advisor",
  "workspace-surface-audit",
  "safety-guard",
  "hookify-rules",
  "rules-distill",
  "skill-comply",
  "skill-scout",
  "skill-stocktake",
]);

const ALWAYS_KEEP_COMMANDS = new Set([
  "adapt",
  "feature-development",
  "database-migration",
  "add-language-rules",
  "plan",
  "plan-prd",
  "code-review",
  "review-pr",
  "pr",
  "build-fix",
  "learn",
  "learn-eval",
  "refactor-clean",
  "security-scan",
  "project-init",
  "projects",
  "prune",
  "skill-create",
  "skill-health",
  "checkpoint",
  "cost-report",
  "evolve",
  "feature-dev",
  "hookify",
  "hookify-configure",
  "hookify-help",
  "hookify-list",
  "sessions",
  "save-session",
  "resume-session",
  "multi-plan",
  "multi-execute",
  "multi-workflow",
  "multi-backend",
  "multi-frontend",
  "model-route",
  "quality-gate",
  "test-coverage",
  "update-codemaps",
  "update-docs",
  "promote",
  "prp-pr",
  "prp-plan",
  "prp-implement",
  "prp-prd",
  "prp-commit",
  "instinct-export",
  "instinct-import",
  "instinct-status",
  "harness-audit",
  "aside",
  "auto-update",
  "setup-pm",
  "pm2",
]);

// Names guaranteed irrelevant for a generic web blueprint, even if a token
// happens to match. Easy way to suppress noise.
const ALWAYS_DROP = new Set([
  "harmonyos-app-resolver",
  "nodejs-keccak256",
  "evm-token-decimals",
  "agent-payment-x402",
  "defi-amm-security",
  "llm-trading-agent-security",
]);

// -------------------------------------------------------------------------
// projectscope.md parsing
// -------------------------------------------------------------------------

function parseFrontMatter(raw) {
  const m = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/);
  if (!m) return { vars: {}, fmRaw: "" };
  const fmRaw = m[1];
  const vars = {};
  const lines = fmRaw.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) { i++; continue; }
    const km = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/);
    if (km) {
      const key = km[1];
      let val = km[2].trim();
      if (val === "" && i + 1 < lines.length && /^\s+-\s/.test(lines[i + 1])) {
        const items = [];
        i++;
        while (i < lines.length && /^\s+-\s/.test(lines[i])) {
          items.push(lines[i].replace(/^\s+-\s+/, "").trim());
          i++;
        }
        vars[key] = items;
        continue;
      }
      val = val.replace(/^['"](.*)['"]$/, "$1");
      vars[key] = val;
    }
    i++;
  }
  return { vars, fmRaw };
}

function looksUnfilled(val) {
  if (val == null) return true;
  if (Array.isArray(val)) return val.length === 0 || val.every(looksUnfilled);
  const s = String(val).trim();
  if (s === "") return true;
  if (/^<.*>$/.test(s)) return true;
  return false;
}

// -------------------------------------------------------------------------
// Keyword matching
// -------------------------------------------------------------------------

function tokenize(name) {
  return name
    .toLowerCase()
    .replace(/\.md$/, "")
    .split(/[-_./\s]+/)
    .filter(Boolean);
}

function buildKeywords(vars) {
  const kws = new Set([
    // baseline: this blueprint is a Next.js + Tailwind + TS web app
    "typescript",
    "javascript",
    "react",
    "nextjs",
    "tailwind",
    "css",
    "web",
    "api",
    "frontend",
    "backend",
  ]);

  const addTokens = (src) => {
    if (src == null) return;
    const arr = Array.isArray(src) ? src : [src];
    for (const item of arr) {
      String(item)
        .toLowerCase()
        .split(/[-_./\s,;]+/)
        .filter(Boolean)
        .forEach((t) => kws.add(t));
    }
  };

  const authStr = String(vars.auth ?? "").toLowerCase();
  if (authStr.includes("supabase")) {
    ["supabase", "postgres", "rls", "sql"].forEach((k) => kws.add(k));
  }
  if (authStr.includes("custom")) kws.add("auth");

  const backendStr = String(vars.backend ?? "").toLowerCase();
  if (backendStr.includes("express")) kws.add("express");
  if (backendStr.includes("trpc")) kws.add("trpc");
  if (backendStr.includes("fastapi")) {
    ["fastapi", "python"].forEach((k) => kws.add(k));
  }
  if (backendStr.includes("django")) {
    ["django", "python"].forEach((k) => kws.add(k));
  }
  if (backendStr.includes("spring")) {
    ["springboot", "spring", "java"].forEach((k) => kws.add(k));
  }

  const testingStr = String(vars.testing ?? "").toLowerCase();
  if (testingStr.includes("vitest")) kws.add("vitest");
  if (testingStr.includes("jest")) kws.add("jest");
  if (testingStr.includes("playwright")) {
    ["playwright", "e2e"].forEach((k) => kws.add(k));
  }
  if (testingStr.includes("cypress")) {
    ["cypress", "e2e"].forEach((k) => kws.add(k));
  }

  addTokens(vars.domain);
  addTokens(vars.target_users);
  addTokens(vars.conventions);
  addTokens(vars.key_entities);
  addTokens(vars.notes);

  return kws;
}

function shouldKeep(name, kws, alwaysKeep) {
  const slug = name.replace(/\.md$/, "");
  if (ALWAYS_DROP.has(slug)) return false;
  if (alwaysKeep.has(slug)) return true;
  for (const t of tokenize(slug)) if (kws.has(t)) return true;
  return false;
}

// -------------------------------------------------------------------------
// fs helpers
// -------------------------------------------------------------------------

async function listDir(dir) {
  try {
    return await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

async function rmrf(target) {
  if (DRY) return;
  await fs.rm(target, { recursive: true, force: true });
}

// -------------------------------------------------------------------------
// description: rewrite (idempotent)
// -------------------------------------------------------------------------

async function rewriteDescription(filePath, vars) {
  const raw = await fs.readFile(filePath, "utf8");
  const fmMatch = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/);
  if (!fmMatch) return false;

  const fmRaw = fmMatch[1];
  const lines = fmRaw.split(/\r?\n/);

  let idx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^description\s*:/.test(lines[i])) {
      idx = i;
      break;
    }
  }
  if (idx === -1) return false;

  const m = lines[idx].match(/^description\s*:\s*(.*)$/);
  if (!m) return false;

  let val = m[1].trim();
  // Skip YAML block-scalar forms; they span multiple lines.
  if (val === "" || val === "|" || val === ">" || /^[|>][+-]?$/.test(val)) {
    return false;
  }

  if (/^["'](.*)["']$/.test(val)) val = val.slice(1, -1);

  const sentinel = `[${vars.name} · ${vars.domain}]`;
  if (val.startsWith("[")) return false; // already badged or custom

  const newVal = `${sentinel} ${val}`;
  const escaped = newVal.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  lines[idx] = `description: "${escaped}"`;

  const newFmRaw = lines.join("\n");
  const before = raw.slice(0, fmMatch.index);
  const after = raw.slice(fmMatch.index + fmMatch[0].length);
  const newRaw = `${before}---\n${newFmRaw}\n---\n${after}`;

  if (DRY) return true;
  await fs.writeFile(filePath, newRaw, "utf8");
  return true;
}

// -------------------------------------------------------------------------
// CLAUDE.md template (inline)
// -------------------------------------------------------------------------

function renderClaudeMd(vars, kept) {
  const entities = Array.isArray(vars.key_entities)
    ? vars.key_entities.join(", ")
    : vars.key_entities ?? "(unspecified)";

  return `# CLAUDE.md — ${vars.name}

> Generated by \`/adapt\` from \`projectscope.md\`. Do not edit by hand —
> this file is overwritten on every adapt run. To change what gets generated,
> edit \`.claude/scripts/adapt.mjs\`.

## Project

**${vars.name}** — ${vars.pitch}

- **Domain:** ${vars.domain}
- **Target users:** ${vars.target_users ?? "(unspecified)"}
- **Key entities:** ${entities}

## Stack

| Layer    | Choice                                                       |
|----------|--------------------------------------------------------------|
| Frontend | Next.js 16 (App Router) · React 19 · Tailwind 4 · shadcn/ui |
| Backend  | ${vars.backend ?? "keep-express"}                            |
| Auth     | ${vars.auth ?? "keep-supabase"}                              |
| Testing  | ${vars.testing ?? "(none)"}                                  |
| Deploy   | ${vars.deploy ?? "(tbd)"}                                    |

## Conventions

${vars.conventions || "(no project-specific conventions noted)"}

Baseline (always apply):

- TypeScript strict everywhere. No new \`any\`.
- Conventional Commits.
- Frontend ↔ backend calls go through \`frontend/src/lib/api.ts\`.
- Use \`lib/supabase/server.ts\` in RSC/route handlers, \`lib/supabase/client.ts\` in browser code.

## Notes

${vars.notes || "(none)"}

## Kept agents (${kept.agents.length})

${kept.agents.map((n) => `- \`${n}\``).join("\n")}

## Kept skills (${kept.skills.length})

${kept.skills.map((n) => `- \`${n}\``).join("\n")}

## When in doubt

1. Re-read this file.
2. Check the relevant agent under \`.claude/agents/\`.
3. Match patterns in \`frontend/src/\` and \`backend/src/\` before inventing new ones.
`;
}

// -------------------------------------------------------------------------
// main
// -------------------------------------------------------------------------

async function main() {
  const scopePath = path.join(REPO_ROOT, "projectscope.md");
  let scopeRaw;
  try {
    scopeRaw = await fs.readFile(scopePath, "utf8");
  } catch {
    console.error("error: projectscope.md not found at repo root.");
    process.exit(1);
  }

  const { vars: fm } = parseFrontMatter(scopeRaw);
  const required = ["name", "pitch", "domain"];
  const missing = required.filter((k) => looksUnfilled(fm[k]));
  if (missing.length) {
    console.error(
      `projectscope.md is not filled in. Placeholder/missing: ${missing.join(", ")}.`,
    );
    console.error(
      "Required fields: name, pitch, domain. Recommended: target_users, key_entities, auth, backend, testing, deploy, conventions.",
    );
    process.exit(1);
  }

  const vars = {
    name: fm.name,
    pitch: fm.pitch,
    domain: fm.domain,
    target_users: fm.target_users,
    key_entities: fm.key_entities,
    auth: fm.auth ?? "keep-supabase",
    backend: fm.backend ?? "keep-express",
    testing: fm.testing ?? "none",
    deploy: fm.deploy ?? "tbd",
    conventions: fm.conventions,
    notes: fm.notes,
  };

  const kws = buildKeywords(vars);

  const claudeDir = path.join(REPO_ROOT, ".claude");
  const agentsDir = path.join(claudeDir, "agents");
  const skillsDir = path.join(claudeDir, "skills");
  const commandsDir = path.join(claudeDir, "commands");

  const agents = (await listDir(agentsDir)).filter(
    (d) => d.isFile() && d.name.endsWith(".md"),
  );
  const skills = (await listDir(skillsDir)).filter((d) => d.isDirectory());
  const commands = (await listDir(commandsDir)).filter(
    (d) => d.isFile() && d.name.endsWith(".md"),
  );

  const keptAgents = [];
  const dropAgents = [];
  for (const f of agents) {
    if (shouldKeep(f.name, kws, ALWAYS_KEEP_AGENTS)) keptAgents.push(f.name);
    else dropAgents.push(f.name);
  }

  const keptSkills = [];
  const dropSkills = [];
  for (const d of skills) {
    if (shouldKeep(d.name, kws, ALWAYS_KEEP_SKILLS)) keptSkills.push(d.name);
    else dropSkills.push(d.name);
  }

  const keptCommands = [];
  const dropCommands = [];
  for (const f of commands) {
    if (shouldKeep(f.name, kws, ALWAYS_KEEP_COMMANDS)) keptCommands.push(f.name);
    else dropCommands.push(f.name);
  }

  console.log(`\nadapt-project ${DRY ? "(dry run)" : "(applying)"}`);
  console.log(`project:  ${vars.name} · ${vars.domain}`);
  console.log(`keywords: ${[...kws].sort().join(" ")}`);
  console.log(
    `agents:   kept ${keptAgents.length}/${agents.length}, drop ${dropAgents.length}`,
  );
  console.log(
    `skills:   kept ${keptSkills.length}/${skills.length}, drop ${dropSkills.length}`,
  );
  console.log(
    `commands: kept ${keptCommands.length}/${commands.length}, drop ${dropCommands.length}`,
  );

  if (VERBOSE) {
    const fmt = (label, list) => {
      console.log(`\n${label} (${list.length}):`);
      list.sort().forEach((n) => console.log("  - " + n));
    };
    fmt("kept agents", keptAgents);
    fmt("drop agents", dropAgents);
    fmt("kept skills", keptSkills);
    fmt("drop skills", dropSkills);
    fmt("kept commands", keptCommands);
    fmt("drop commands", dropCommands);
  }

  if (DRY) {
    console.log("\nno changes written (dry run).");
    return;
  }

  for (const f of dropAgents) await rmrf(path.join(agentsDir, f));
  for (const d of dropSkills) await rmrf(path.join(skillsDir, d));
  for (const f of dropCommands) await rmrf(path.join(commandsDir, f));

  let rewrites = 0;
  for (const f of keptAgents) {
    if (await rewriteDescription(path.join(agentsDir, f), vars)) rewrites++;
  }
  for (const d of keptSkills) {
    const skillFile = path.join(skillsDir, d, "SKILL.md");
    try {
      await fs.access(skillFile);
    } catch {
      continue;
    }
    if (await rewriteDescription(skillFile, vars)) rewrites++;
  }

  const kept = {
    agents: keptAgents.map((n) => n.replace(/\.md$/, "")).sort(),
    skills: keptSkills.slice().sort(),
  };

  const claudeMdPath = path.join(REPO_ROOT, "CLAUDE.md");
  await fs.writeFile(claudeMdPath, renderClaudeMd(vars, kept), "utf8");

  console.log(`\nrewrites: ${rewrites} description line(s)`);
  console.log("CLAUDE.md rewritten.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
