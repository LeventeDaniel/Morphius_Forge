# AI Builder Prompt

Use this prompt when asking Claude Code, Codex, Cursor, or any other AI coding tool to build a Morphius-compatible module.

---

## Copy-paste prompt for AI tools

```
You are building a Morphius-compatible module.

Morphius is a blank-canvas webtop host. Modules are independent packages
that plug into Morphius via a manifest.json file. Morphius discovers modules
by scanning a folder path and reading their manifests. Morphius never imports
or executes module code automatically.

MORPHIUS DOES NOT BUILD UI FOR MODULES.
Morphius mounts the surfaces a module declares. Everything the user sees
comes from the module itself. Build a real interface — not a placeholder.

RULES:

1. Minimum manifest (required):
   {
     "id": "my-module",         // kebab-case, unique
     "name": "My Module",       // human-readable
     "version": "1.0.0",        // semver
     "type": "frontend",        // frontend | backend | fullstack | workflow | provider
     "entry": "./src/module.tsx"
   }
   This is Level 1 (loadable). Everything else is optional.

2. UI surfaces — the module owns its interface:
   Add a ui.surfaces block to declare the surfaces Morphius will mount:
   {
     "ui": {
       "surfaces": [
         {
           "id": "main",
           "name": "Main Interface",
           "entry": "./src/module.tsx",
           "kind": "window",
           "purpose": "primary-control",
           "reflects": ["status", "actions", "results"],
           "actions": ["run"],
           "defaultSize": { "width": 720, "height": 520 }
         }
       ],
       "primarySurface": "main"
     }
   }
   This reaches Level 2 (usable). Without ui.surfaces, the module stays at Level 1.

3. Action UI metadata — actions become controls in the module's UI:
   {
     "actions": [
       {
         "id": "run",
         "name": "Run",
         "kind": "safe",
         "ui": { "buttonLabel": "▶ RUN", "placement": "primary" }
       },
       {
         "id": "delete",
         "name": "Delete",
         "kind": "destructive",
         "ui": {
           "buttonLabel": "DELETE",
           "placement": "context",
           "confirmMessage": "This will permanently delete the record. Continue?"
         }
       }
     ]
   }
   Action kinds: safe | external | destructive | approval-required
   Placements: primary | secondary | toolbar | context

4. Do NOT store secrets in the manifest or any source file.
   Use secretRefs (names only):
   "secretRefs": [{ "name": "MY_API_KEY", "description": "..." }]
   The actual value lives in Morphius Connect (a separate private config).
   Never import secrets into a UI surface file.

5. Do NOT modify Morphius core (the webtop host).
   Keep the module completely isolated in its own folder.

6. Use connector references for private endpoints:
   "connectors": [{ "name": "my-api", "description": "..." }]
   The module requests the connection by name.

7. Include a safe mock mode when possible:
   - Add "mockMode": true to the manifest
   - When mock mode is active, return realistic fake data without real API calls

8. Do NOT install Morphius as a dependency in your module.
   Modules are standalone — no dependency on Morphius core.

9. Module types:
   - frontend: React/UI component, runs in browser
   - backend: Node.js actions/API, runs on server + UI surface
   - fullstack: UI surface + backendEntry
   - workflow: orchestrates other modules, JSON-driven
   - provider: fills a system role (approval, audit, auth, etc.)
   - any other string: valid, displays as "experimental"

10. Build one reusable capability per module.
    Good examples: Prompt Cleaner, Output Validator, Model Router, Approval Manager
    Umbrellas are recipes combining modules — not giant modules themselves.

11. Module UI design rules:
    - Dark background: #0a0a0a or #111111
    - Monospace font only (JetBrains Mono, Fira Code, or any monospace)
    - Minimum font size: 11px
    - Labels in UPPERCASE with letter-spacing: 0.1em, color ~#555–#666
    - Status dot: 5–6px circle, green (#4ade80) = ok, red (#ff4444) = error
    - Buttons: transparent background, 1px border, uppercase label
    - On hover: border shifts to accent color (#4ade80), text to accent
    - NO blue, purple, yellow, or orange — ever
    - NO rounded corners (border-radius: 0 everywhere)
    - NO drop shadows, NO gradients
    - NO SaaS dashboard patterns (no hero tiles, no donut charts, no onboarding copy)

12. What the module UI should show:
    - Current state (online/offline/running/error) — as a status dot
    - What the module can do — as visible controls, not hidden menus
    - Config or connection requirements — without revealing values
    - Action results and output — inline in the surface
    - Logs or diagnostics if relevant — in a separate surface

13. What to NEVER show in the UI:
    - Secret values, API keys, tokens, passwords
    - Raw environment variables or config dumps
    - Automatic unsafe side-effects on load

14. After building:
    Run: morphius-forge validate .
    Fix all errors first (they block loading).
    Then fix warnings. Then apply recommendations.

Build the module in its own isolated folder. Do not touch any other repo.
```

---

## Compatibility levels at a glance

| Level | Name | Key additions |
|---|---|---|
| 1 | Loadable | 5 required fields only |
| 2 | Usable | `description` + `ui.surfaces` |
| 3 | Actionable | `actions` with `ui` metadata |
| 4 | Advanced | `provider` or `sandbox`, diagnostics surface |

---

## Tips for specific module types

### Frontend module
- React component as default export
- Declare `ui.surfaces` pointing to the component
- Can call backend APIs via fetch — declare them in `connectors`
- No Morphius runtime dependency needed for basic surfaces

### Backend module
- Node.js action handlers + a UI surface (`module.tsx`)
- `backendEntry` must be declared in the manifest
- The UI surface shows server status, capabilities, call tester
- Return structured JSON from action handlers

### Workflow module
- Describes a multi-step flow in JSON (the `entry` file)
- Add a `task-runner` UI surface showing steps, inputs, results
- `workflowCompatible: true` is required
- Can reference other modules by their IDs in the workflow config

### Provider module
- Any module with a `provider` field
- UI surface shows pending requests, decision buttons, audit trail
- Separate `diagnostics` surface for health and logs
- Use `kind: "approval-required"` on actions that need human sign-off

---

## What Forge validator checks

| Check | Result |
|---|---|
| Missing id/name/version/type/entry | ERROR — cannot load |
| Invalid JSON | ERROR — cannot load |
| Plaintext secret detected | ERROR — cannot load |
| Unknown type string | WARNING |
| Missing description | RECOMMENDATION |
| No `ui.surfaces` | RECOMMENDATION (stays Level 1) |
| No `ui.primarySurface` | RECOMMENDATION |
| Actions without `ui` metadata | RECOMMENDATION |
| Destructive action without `confirmMessage` | WARNING |
| Missing README.md | RECOMMENDATION |
| Unknown provider kind | WARNING |
| Design system violation (color, font) | WARNING |

Run `morphius-forge validate .` after every change.
