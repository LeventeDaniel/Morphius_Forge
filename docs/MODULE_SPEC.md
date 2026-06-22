# Morphius Module Specification

Version: 0.3.0

---

## Overview

A Morphius module is a self-contained unit that plugs into the Morphius webtop host. Modules provide UI surfaces, backend actions, composed workflows, or system-level provider roles. Morphius itself is a blank canvas — all real functionality and all visible interface come from modules.

**Morphius does not build dashboards or controls for modules.** A module that wants the user to see something must ship that interface itself, in its own surface files.

**Forge is the recommended way to build modules, but it is not required.** Any folder with a valid minimum manifest can be loaded by Morphius.

Recommended architectural rule:
- Module = one reusable capability
- Umbrella = recipe combining modules
- Morphius = empty canvas that mounts them

For recommended module boundaries, see `MODULE_CATALOG.md`. For multi-module workspace compositions, see `UMBRELLA_RECIPES.md`. For UI surface design, see `MODULE_UI_GUIDE.md`.

---

## Minimum required manifest

```json
{
  "id": "my-module",
  "name": "My Module",
  "version": "1.0.0",
  "type": "frontend",
  "entry": "./src/module.tsx"
}
```

This is a valid Level 1 (loadable) module. Morphius mounts the entry file as a surface.

See [COMPATIBILITY_LEVELS.md](COMPATIBILITY_LEVELS.md) for the full progressive compatibility system.

---

## Module Types

Standard types (known to Morphius):

| Type | Description |
|------|-------------|
| `frontend` | UI surface, runs in browser |
| `backend` | Actions/API with backend server |
| `fullstack` | UI surface + backend actions |
| `workflow` | Orchestrates other modules |
| `provider` | Fills a system role |

**Unknown types are accepted.** They display as "experimental" in Morphius but load normally if minimum fields are present.

---

## Full manifest reference

All fields beyond the minimum five are optional.

```json
{
  // ── MINIMUM REQUIRED ────────────────────────────────────────────────────
  "id": "my-module",
  "name": "My Module",
  "version": "1.0.0",
  "type": "frontend",
  "entry": "./src/module.tsx",

  // ── LEVEL 2 — USABLE ────────────────────────────────────────────────────
  "description": "What this module does.",
  "backendEntry": "./src/server.ts",
  "permissions": [],

  // Module-owned UI surfaces — Morphius mounts these, builds nothing itself.
  // See docs/MODULE_UI_GUIDE.md for the full surface design guide.
  "ui": {
    "surfaces": [
      {
        "id": "main",
        "name": "Main Interface",
        "entry": "./src/module.tsx",
        "kind": "window",
        "purpose": "primary-control",
        "reflects": ["status", "capabilities", "actions", "results"],
        "actions": ["myAction"],
        "defaultSize": { "width": 720, "height": 520 }
      },
      {
        "id": "diagnostics",
        "name": "Diagnostics",
        "entry": "./src/diagnostics.tsx",
        "kind": "panel",
        "purpose": "diagnostics"
      }
    ],
    "primarySurface": "main",
    "statusSurface": "main"
  },

  // window: fallback sizing hint when ui.surfaces is not declared
  "window": {
    "defaultWidth": 480,
    "defaultHeight": 400,
    "resizable": true,
    "collapsible": true,
    "minimizable": true,
    "initialPosition": "center"
  },

  // ── LEVEL 3 — ACTIONABLE ────────────────────────────────────────────────
  "actions": [
    {
      "id": "myAction",
      "name": "My Action",
      "description": "What this action does",
      "kind": "safe",
      "inputSchema": { "text": { "type": "string" } },
      "outputSchema": { "result": { "type": "string" } },
      "ui": {
        "buttonLabel": "▶ RUN",
        "placement": "primary"
      }
    },
    {
      "id": "deleteRecord",
      "name": "Delete Record",
      "kind": "destructive",
      "ui": {
        "buttonLabel": "DELETE",
        "placement": "context",
        "confirmMessage": "This will permanently delete the record. Continue?"
      }
    }
  ],
  "connectors": [
    { "name": "my-api", "description": "The backend API this module uses" }
  ],
  "secretRefs": [
    { "name": "MY_API_KEY", "description": "API key for my-api" }
  ],
  "eventsEmitted": [
    { "name": "module.ready", "description": "Emitted when the module initializes" }
  ],
  "eventsListened": [],
  "workflowCompatible": true,
  "mockMode": true,

  // ── LEVEL 4 — ADVANCED ──────────────────────────────────────────────────
  "provider": {
    "kind": "approval",
    "handles": ["approval.request"],
    "decisions": ["allow", "block"]
  },
  "sandbox": {
    "hints": ["no-network", "read-only"],
    "isolated": true
  },

  // ── ADDITIONAL METADATA ─────────────────────────────────────────────────
  "morphiusVersion": "0.1.0",
  "tags": ["ai", "llm"],
  "author": "Your Name",
  "license": "MIT"
}
```

---

## UI surfaces

A surface is a mountable UI component. Each surface has its own entry file and declares what it reflects.

Morphius mounts surfaces. Morphius does not build UI for modules.

### Surface kinds

| Kind | Description |
|---|---|
| `window` | Full-size window surface (default) |
| `panel` | Sidebar or docked panel |
| `overlay` | Floating overlay |
| `embedded` | Embedded inside another surface |

### Surface purposes

| Purpose | Description |
|---|---|
| `primary-control` | Main interface — the module's full UI |
| `status` | Compact read-only status view |
| `settings` | Module configuration controls |
| `task-runner` | Multi-step task or workflow execution |
| `results` | Output, history, or records |
| `logs` | Log stream or event history |
| `review` | Approval/decision/review surface |
| `diagnostics` | Health checks and debug information |

---

## Action kinds

| Kind | Meaning |
|---|---|
| `safe` | Read-only or reversible — no side effects |
| `external` | Calls an external API or service |
| `destructive` | Irreversible — requires `ui.confirmMessage` |
| `approval-required` | Requires human approval before executing |

---

## Permissions

Permissions are declared strings — any string is accepted. Known values:

- `storage:read`, `storage:write`
- `network:outbound`
- `events:emit`, `events:listen`
- `window:spawn`
- `clipboard:read`, `clipboard:write`

Declaring a permission does not automatically grant it. Morphius displays declared permissions in the module window.

---

## Secrets

**Never store secret values in manifests or source files.** Use `secretRefs` with names only:

```json
"secretRefs": [
  { "name": "OPENAI_API_KEY", "description": "API key for the LLM connector" }
]
```

The actual value lives in Morphius Connect (a separate private config). See [SECURITY_RULES.md](SECURITY_RULES.md).

---

## Provider metadata

See [PROVIDER_HINTS.md](PROVIDER_HINTS.md) for the full provider system guide.

---

## Security rules (always)

1. No secrets in manifests — use `secretRefs` (names only)
2. No secrets in source files — use environment variables via Connect
3. No `.env` files in module folders
4. No auto-execution of entry files — Morphius reads metadata only
5. Do not import secrets or server-only code into UI surface files
6. Keep modules isolated — do not modify Morphius core or other modules

---

## Validation

Run from your module folder:

```bash
morphius-forge validate .
```

Fix errors first. Warnings and recommendations are optional improvements.
