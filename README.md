# Morphius Forge

**A flexible AI-first module creation kit for building Morphius-compatible modules.**

Part of the Morphius ecosystem: [Morphius](https://github.com/LeventeDaniel/Morphius) · [Morphius Forge](https://github.com/LeventeDaniel/Morphius_Forge) · [Morphius Connect](https://github.com/LeventeDaniel/Morphius_Connect)

---

## What is this?

Morphius Forge is a toolkit for developers and AI coding agents (Claude Code, Codex, Cursor, etc.) who want to build **Morphius modules**.

It contains:
- Module specification and manifest schema (`docs/MODULE_SPEC.md`)
- **Module UI guide** — every module owns its interface (`docs/MODULE_UI_GUIDE.md`)
- Progressive compatibility system (`docs/COMPATIBILITY_LEVELS.md`)
- Design guide (`docs/DESIGN_GUIDE.md`)
- AI builder prompt — copy-paste for any AI tool (`docs/AI_BUILDER_PROMPT.md`)
- Module catalog and capability boundaries (`docs/MODULE_CATALOG.md`)
- Provider hints guide (`docs/PROVIDER_HINTS.md`)
- Security rules (`docs/SECURITY_RULES.md`, `docs/SECURITY_RECOMMENDATIONS.md`)
- Starter templates: minimal, frontend, backend, fullstack, workflow, provider
- Manifest validator with progressive level output
- CLI (`morphius-forge`)

**This repo is always public-safe.** It contains no secrets, no credentials, no private endpoints.

---

## Core architecture rule

```
Morphius = blank canvas webtop host
Forge    = guide + toolbox for building modules
Connect  = private secrets layer (separate private repo)
```

**Morphius does not build dashboards for modules. Morphius does not generate buttons from action arrays. Morphius mounts what modules declare.**

Every interface the user sees inside Morphius comes from a module's own surface files. Connect, Module Host, Approvals, Memory, Source Search — all of these are modules, and all of them own their interfaces.

---

## Important: Forge is optional

Any module with a valid minimum manifest can be loaded by Morphius. Forge is the *recommended* way to build good modules — it provides specs, tools, and validators — but it is not a gatekeeper.

---

## Minimum viable module (Level 1)

```json
{
  "id": "my-module",
  "name": "My Module",
  "version": "1.0.0",
  "type": "frontend",
  "entry": "./src/module.tsx"
}
```

This is a valid Level 1 (loadable) module. Morphius will discover and mount the entry file.

---

## Progressive compatibility levels

| Level | Name | Key additions |
|---|---|---|
| 1 | **Loadable** | id, name, version, type, entry |
| 2 | **Usable** | + description + `ui.surfaces` |
| 3 | **Actionable** | + `actions` with `ui` metadata |
| 4 | **Advanced** | + provider or sandbox + diagnostics surface |

**Validation never fails for missing optional fields.** Missing fields produce recommendations. Only truly broken manifests produce errors.

### What gets you to Level 2

Level 2 requires that the module declares its own UI surface:

```json
"ui": {
  "surfaces": [
    {
      "id": "main",
      "name": "Main Interface",
      "entry": "./src/module.tsx",
      "kind": "window",
      "purpose": "primary-control",
      "defaultSize": { "width": 720, "height": 520 }
    }
  ],
  "primarySurface": "main"
}
```

See [docs/MODULE_UI_GUIDE.md](docs/MODULE_UI_GUIDE.md) for the full UI surface design guide.

### What gets you to Level 3

Level 3 requires that actions declare UI metadata:

```json
"actions": [
  {
    "id": "run",
    "name": "Run",
    "kind": "safe",
    "ui": {
      "buttonLabel": "▶ RUN",
      "placement": "primary"
    }
  }
]
```

Action kinds: `safe` | `external` | `destructive` | `approval-required`

---

## Getting started

```bash
# Build and use the CLI
cd packages/cli && npm install && npm run build

# Validate a module folder
node dist/index.js validate ./my-module

# Inspect a module (detailed summary)
node dist/index.js inspect ./my-module

# Start the Forge Status server (port 7901)
node dist/index.js serve

# Create a new module from template
node dist/index.js create my-new-module
```

### Forge Status module

Forge ships with a ready-to-load Morphius module (`module/`) that shows live scan results inside Morphius.

1. Run `morphius-forge serve` — starts a server on port 7901
2. Open Morphius → press `/` → `load module`
3. Enter the path to `Morphius_Forge/module`
4. The Forge Status window appears — shows module paths, valid/invalid counts, per-module errors

---

## Templates

All templates include real UI surfaces by default.

| Template | Level | Description |
|---|---|---|
| `templates/minimal-module/` | 1 | Five required fields only — starting point |
| `templates/frontend-module/` | 3 | Input/run/output UI with action metadata |
| `templates/backend-module/` | 3 | Backend server + status/action UI surface |
| `templates/fullstack-module/` | 3 | UI + backend + settings surface |
| `templates/workflow-module/` | 3 | Step runner UI with live step state |
| `templates/provider-module/` | 4 | Approval UI + diagnostics surface |

---

## Docs

| Doc | Purpose |
|---|---|
| `docs/MODULE_SPEC.md` | Full manifest reference |
| `docs/MODULE_UI_GUIDE.md` | **How modules own their interface — surfaces, actions, design** |
| `docs/COMPATIBILITY_LEVELS.md` | Level system with UI-completeness criteria |
| `docs/AI_BUILDER_PROMPT.md` | Prompt for AI coding tools |
| `docs/DESIGN_GUIDE.md` | Visual design language — colors, fonts, layout |
| `docs/MODULE_CATALOG.md` | Recommended capability boundaries |
| `docs/UMBRELLA_RECIPES.md` | Workspace compositions from smaller modules |
| `docs/PROVIDER_HINTS.md` | Provider module guide |
| `docs/SECURITY_RULES.md` | Security architecture |
| `docs/SECURITY_RECOMMENDATIONS.md` | Security best practices |
| `docs/CONNECT_INTEGRATION.md` | Using Morphius Connect with modules |
| `docs/EXAMPLES.md` | Example module walkthroughs |

---

## Philosophy

Morphius is a blank canvas. Forge is a guide. Modules are anything people build.

- Module = one reusable capability
- Umbrella = recipe combining modules
- Morphius = empty canvas that mounts them
- Every visible interface comes from a module — including Connect, Host, Approvals, Memory

**Forge is not a gatekeeper.** Do not force modules into rigid templates. Do not reject experimental types. Do help builders produce high-quality, safe, compatible modules with real interfaces.
