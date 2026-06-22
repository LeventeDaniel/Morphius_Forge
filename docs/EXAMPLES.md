# Example Modules

This document describes the example modules included in Morphius Forge.
All examples are clearly marked as demos — they use mock logic only.

---

## examples/prompt-cleaner

**Type:** `frontend`

Cleans and compresses prompts by removing excess whitespace, normalizing line endings,
and deduplicating consecutive identical lines.

**Why it's useful as an example:**
- Simplest possible frontend module
- No permissions, no connectors, no secrets
- Pure browser logic
- Shows the basic module.tsx + manifest.json pattern

**Run it:**
```bash
morphius-forge validate examples/prompt-cleaner
morphius-forge inspect examples/prompt-cleaner
```

---

## examples/output-validator

**Type:** `frontend`

Validates that LLM text output is valid JSON and optionally checks for required keys.

**Why it's useful as an example:**
- Shows an action with structured input/output
- No backend needed
- Demonstrates the "tool that helps you build with LLMs" pattern

**Run it:**
```bash
morphius-forge validate examples/output-validator
morphius-forge inspect examples/output-validator
```

---

## examples/demo-auth-provider

**Type:** `backend`

DEMO ONLY — shows how an auth provider module declares OAuth connector requirements.
No real OAuth logic. No real credentials.

**Why it's useful as an example:**
- Shows `connectors` with `oauth_provider`
- Shows `secretRefs` with `OAUTH_CLIENT_ID` and `OAUTH_CLIENT_SECRET`
- Shows `permissions: ["storage:read", "storage:write"]`
- Shows `eventsEmitted: ["auth:login"]`
- Shows backend module with server.ts entry point

**Run it:**
```bash
morphius-forge validate examples/demo-auth-provider
morphius-forge inspect examples/demo-auth-provider
```

---

## examples/demo-llm-connector

**Type:** `backend`

DEMO ONLY — shows how an LLM connector module declares its reasoning API requirements.
All responses are mock.

**Why it's useful as an example:**
- Shows `connectors: [{name: "reasoning_api"}]`
- Shows `secretRefs: [{name: "LLM_API_KEY"}]`
- Shows `permissions: ["network:outbound"]`
- Shows two actions: `generate` and `streamGenerate`
- Shows the pseudocode pattern for real connector usage

**Run it:**
```bash
morphius-forge validate examples/demo-llm-connector
morphius-forge inspect examples/demo-llm-connector
```

---

## Validate all examples at once

```bash
npm run validate:examples
```

All four examples should pass validation with zero errors.
