# Security Recommendations

This document describes security best practices for Morphius module authors. These are recommendations, not requirements (except where marked **required**).

---

## Required (blocks loading if violated)

### No secrets in manifests

**Required.** The Forge validator scans manifests for patterns that look like real secrets. If found, validation fails and the module cannot load.

What counts as a secret:
- API keys (OpenAI `sk-...`, GitHub `ghp_...`, Slack `xoxb-...`)
- OAuth tokens (`ya29...`)
- Passwords in `"password": "..."` fields
- Long token values in `"token": "..."` fields
- PEM private key blocks

Use `secretRefs` instead:
```json
"secretRefs": [
  { "name": "MY_API_KEY", "description": "What this key is for" }
]
```

The real value lives in Morphius Connect.

---

## Strongly recommended

### Declare permissions

List what your module needs:
```json
"permissions": ["network:outbound", "storage:read"]
```

Undeclared permissions still don't get enforced — but declaring them helps users understand what your module does and prepares for future policy enforcement.

### Use mockMode for development

```json
"mockMode": true
```

When mock mode is active, return fake data without real API calls. This allows safe development, testing, and demonstration without exposing real credentials or consuming API quota.

### Declare connectors by name, not URL

```json
"connectors": [{ "name": "my-llm-api", "description": "LLM endpoint" }]
```

Never hardcode URLs or credentials in your module. Use connector names that map to Morphius Connect configuration.

---

## Optional (for advanced modules)

### Provider modules: declare decisions

If your module is a provider, declare what decisions it can return:
```json
"provider": {
  "kind": "approval",
  "handles": ["approval.request"],
  "decisions": ["allow", "block", "needs_changes"]
}
```

This is metadata — it does not automatically enforce anything.

### Sandbox hints

If your module should run in an isolated context, declare hints:
```json
"sandbox": {
  "hints": ["no-network", "read-only"],
  "isolated": true
}
```

Morphius displays these hints. Actual sandbox enforcement requires a configured execution layer.

---

## What Morphius never does automatically

- Morphius never imports or executes external module code from scan paths
- Morphius never reads `.env` files from module folders
- Morphius never grants permissions from declarations alone
- Morphius never auto-approves anything based on provider metadata
- Morphius never exposes secrets from Connect to the frontend

---

## Source file scanning

`morphius-forge validate .` also scans source files for embedded secrets. The same patterns are checked in `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.yaml`, `.env` files. Finding a secret in source is an error that blocks validation.

If you have test fixtures with fake API key patterns, use clearly fake strings that do not match the detection patterns (e.g., `sk-test000000000000000000` would match — use something like `sk-REPLACE_WITH_REAL_KEY` instead, or pass the value via environment).
