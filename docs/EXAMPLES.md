# Example Modules

This document describes the example modules currently included in Morphius Forge.
All examples are clearly marked as demos — they use mock logic only.

These examples are intentionally small. They demonstrate manifest patterns, templates, and validation behavior.
They are **not** a complete catalog of recommended module boundaries or umbrella recipes.

For that guidance, see:
- `docs/MODULE_CATALOG.md`
- `docs/UMBRELLA_RECIPES.md`

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

---

## What is missing on purpose

Forge's current examples do not yet cover the full recommended architecture surface, such as:
- Model Router
- Prompt Router
- Context Builder
- Memory Manager
- Source Ranker
- Evidence Extractor
- Citation Builder
- Claim Checker
- Benchmark Runner
- Cost Monitor
- Tool Registry
- Tool Runner
- Secret Guard
- Approval Gate
- Permission Provider
- Sandbox Provider
- Audit Logger
- Notification App
- Health Check
- Replay Debugger
- Connect UI

They also do not yet ship a flagship umbrella workflow example such as:
- Research Workspace
- Benchmark Workspace
- Prompt Cleanup Workspace
- Conversation Summary Workspace
- Tool Debug Workspace
- Approval Review Workspace
- Memory Review Workspace
- Agent Task Workspace

Treat the current examples as starter references, not as the full target module library.
