# Morphius Module Specification

Version: 0.2.0

---

## Overview

A Morphius module is a self-contained unit that plugs into the Morphius webtop host. Modules may provide UI panels, backend actions, composed workflows, or system-level provider roles. Morphius itself is a blank canvas — all real functionality comes from modules.

**Forge is the recommended way to build modules, but it is not required.** Any folder with a valid minimum manifest can be loaded by Morphius.

Recommended architectural rule:
- Module = one reusable capability
- Umbrella = recipe combining modules
- Morphius = empty canvas that mounts them

For recommended module boundaries, see `MODULE_CATALOG.md`. For multi-module workspace compositions, see `UMBRELLA_RECIPES.md`.

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

This is a valid Level 1 (loadable) module. Morphius can discover it and open a generic window immediately.

See [COMPATIBILITY_LEVELS.md](COMPATIBILITY_LEVELS.md) for the full progressive compatibility system.

---

## Module Types

Standard types (known to Morphius):

| Type | Description | Requires UI | Requires Backend |
|------|-------------|-------------|-----------------|
| `frontend` | UI-only, runs in browser | Yes | No |
| `backend` | Actions/API, little or no UI | No | Yes |
| `fullstack` | UI + backend actions | Yes | Yes |
| `workflow` | Orchestrates other modules | No | No |
| `provider` | Fills a system role | No | Optional |

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
  "window": {
    "defaultWidth": 480,
    "defaultHeight": 400,
    "resizable": true,
    "collapsible": true,
    "minimizable": true,
    "initialPosition": "center"
  },

  // ── LEVEL 3 — INTEGRATED ────────────────────────────────────────────────
  "actions": [
    {
      "id": "myAction",
      "name": "My Action",
      "description": "What this action does",
      "inputSchema": "{ ... }",
      "outputSchema": "{ ... }"
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

## Permissions

Permissions are declared strings — any string is accepted. Known values:

- `storage:read`, `storage:write`
- `network:outbound`
- `events:emit`, `events:listen`
- `window:spawn`
- `clipboard:read`, `clipboard:write`

Declaring a permission does not automatically grant it. Morphius displays declared permissions in the module window. Actual enforcement requires a configured permission provider (if one exists in your deployment).

---

## Secrets

**Never store secret values in manifests or source files.** Use `secretRefs` with names only:

```json
"secretRefs": [
  { "name": "OPENAI_API_KEY", "description": "API key for the LLM connector" }
]
```

The actual value lives in Morphius Connect (a separate private config). Morphius passes the connection through to your module at runtime — your module never receives the raw key unless explicitly provided by a configured execution layer.

---

## Provider metadata

See [PROVIDER_HINTS.md](PROVIDER_HINTS.md) for the full provider system guide.

---

## Security rules (always)

1. No secrets in manifests — use `secretRefs` (names only)
2. No secrets in source files — use environment variables via Connect
3. No `.env` files in module folders (Morphius ignores them)
4. No auto-execution of entry files — Morphius reads metadata only
5. Keep modules isolated — do not modify Morphius core or other modules

---

## Validation

Run from your module folder:

```bash
morphius-forge validate .
```

Fix errors first. Warnings and recommendations are optional improvements.
