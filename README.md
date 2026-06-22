# Morphius Forge

**A flexible AI-first module creation kit for building Morphius-compatible modules.**

Part of the Morphius ecosystem: [Morphius](https://github.com/LeventeDaniel/Morphius) · [Morphius Forge](https://github.com/LeventeDaniel/Morphius_Forge) · [Morphius Connect](https://github.com/LeventeDaniel/Morphius_Connect)

---

## What is this?

Morphius Forge is a toolkit for developers and AI coding agents (Claude Code, Codex, Cursor, etc.) who want to build **Morphius modules**.

It contains:
- Module specification and manifest schema (`docs/MODULE_SPEC.md`)
- Progressive compatibility system (`docs/COMPATIBILITY_LEVELS.md`)
- Design guide (`docs/DESIGN_GUIDE.md`)
- AI builder prompt — copy-paste for any AI tool (`docs/AI_BUILDER_PROMPT.md`)
- Provider hints guide (`docs/PROVIDER_HINTS.md`)
- Security recommendations (`docs/SECURITY_RECOMMENDATIONS.md`)
- Starter templates: minimal, frontend, backend, fullstack, workflow, provider
- Manifest validator with progressive level output
- CLI (`morphius-forge`)
- Example modules

**This repo is always public-safe.** It contains no secrets, no credentials, no private endpoints.

---

## Important: Forge is optional

**Morphius does not require Forge.** Any module with a valid minimum manifest can be loaded by Morphius. Forge is the *recommended* way to build good modules — it provides specs, tools, and validators — but it is not a gatekeeper.

```
Morphius = blank webtop host (loads any valid module)
Forge    = guide + toolbox (helps you build better modules)
Connect  = optional private secrets layer (separate private repo)
```

You can build a Morphius module with nothing but a `manifest.json` and an entry file. Forge helps you build it well.

---

## Minimum viable module

```json
{
  "id": "my-module",
  "name": "My Module",
  "version": "1.0.0",
  "type": "frontend",
  "entry": "./src/module.tsx"
}
```

This is a valid Level 1 (loadable) module. Morphius will discover and open it immediately.

Everything else — description, permissions, actions, provider metadata, window config — is optional and contributes to higher compatibility levels.

---

## Progressive compatibility levels

| Level | Name | Minimum fields |
|---|---|---|
| 1 | **Loadable** | id, name, version, type, entry |
| 2 | **Usable** | + description, permissions |
| 3 | **Integrated** | + actions |
| 4 | **Advanced** | + provider or sandbox metadata |

Validation never fails for missing optional fields. Missing optional fields produce **recommendations**, not errors.

**Errors** (blocks loading): missing minimum fields, invalid JSON, plaintext secrets detected.

---

## Getting started

```bash
# Install CLI locally
cd packages/cli && npm install && npm run build

# Validate a module folder
npx morphius-forge validate ./my-module

# Inspect a module (detailed summary)
npx morphius-forge inspect ./my-module

# Start the Forge Status server (port 7901)
npx morphius-forge serve

# Example output:
#   ✓ My Module v1.0.0 [frontend]
#   COMPATIBILITY: LEVEL 1 — LOADABLE
#   RECOMMENDATIONS:
#     · description: add a description (Level 2)
#     · actions: declare actions (Level 3)
```

### Forge Status module

Forge ships with a ready-to-load Morphius module (`module/`) that shows live scan results inside Morphius.

**How to use:**
1. Run `morphius-forge serve` in your Forge folder — starts a server on port 7901
2. Open Morphius → press `/` → `load module`
3. Enter the path to `Morphius_Forge/module`
4. The Forge Status window appears — shows module paths, valid/invalid counts, per-module errors

Module paths are stored in `forge.config.json` in the directory where you run `morphius-forge serve`. Update them via:
- `POST http://localhost:7901/paths` with `{ "paths": ["C:/path/to/modules"] }`
- Or edit `forge.config.json` directly and click reload in the module

Forge is **fully standalone** — it does not modify Morphius internals and Morphius has no knowledge of Forge.

---

## Templates

| Template | When to use |
|---|---|
| `templates/minimal-module/` | Starting point — just the minimum five fields |
| `templates/frontend-module/` | React UI module |
| `templates/backend-module/` | Node.js action module |
| `templates/fullstack-module/` | UI + backend |
| `templates/workflow-module/` | Multi-module workflow |
| `templates/provider-module/` | System role module (approval, audit, etc.) |

---

## Building with AI tools

Use the prompt in `docs/AI_BUILDER_PROMPT.md` with Claude Code, Codex, Cursor, or any other AI tool. The prompt explains:

- Minimum manifest requirements
- Optional fields for higher compatibility
- Secret handling rules (use `secretRefs`, not values)
- Visual design guidelines
- How to run the validator
- What Forge checks and what it doesn't

---

## Docs

| Doc | Purpose |
|---|---|
| `docs/MODULE_SPEC.md` | Full manifest reference |
| `docs/COMPATIBILITY_LEVELS.md` | Level system explained |
| `docs/AI_BUILDER_PROMPT.md` | Prompt for AI coding tools |
| `docs/DESIGN_GUIDE.md` | Visual design guidelines |
| `docs/PROVIDER_HINTS.md` | Provider module guide |
| `docs/SECURITY_RECOMMENDATIONS.md` | Security best practices |
| `docs/CONNECT_INTEGRATION.md` | Using Morphius Connect with modules |
| `docs/EXAMPLES.md` | Example module walkthroughs |

---

## Philosophy

Morphius is a blank canvas. Forge is a guide. Modules are anything people build.

- Do not force modules into rigid templates
- Do not reject creative or experimental module types
- Do not make Forge the gatekeeper — Morphius decides what loads
- Do help builders produce high-quality, safe, compatible modules
- Do not execute module code automatically — discovery is metadata only
