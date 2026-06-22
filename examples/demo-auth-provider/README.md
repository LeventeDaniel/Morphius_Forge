# Demo Auth Provider — Example Module

> **DEMO ONLY.** This module shows how to declare auth connector requirements.
> It contains no real credentials and no real OAuth logic.

## Purpose

Demonstrates how a backend module correctly declares:
- `connectors` — symbolic references to external services
- `secretRefs` — required credential names (real values stay in Morphius Connect)
- `permissions` — `storage:read`, `storage:write`
- `eventsEmitted` — `auth:login`

## What it does NOT do

- No real OAuth flow
- No real credentials
- No real token exchange
- No network calls

Real auth logic would be implemented using connector values injected at runtime by Morphius Connect.

## Validation

```bash
morphius-forge validate .
morphius-forge inspect .
```
