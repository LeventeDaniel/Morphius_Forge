# Demo LLM Connector — Example Module

> **DEMO ONLY.** Shows how an LLM connector module declares requirements.
> All LLM responses are mocked. No real API keys here.

## Purpose

Demonstrates:
- `connectors: [{ name: "reasoning_api" }]` — symbolic LLM endpoint reference
- `secretRefs: [{ name: "LLM_API_KEY" }]` — credential name declared, value stays in Morphius Connect
- `permissions: ["network:outbound"]`
- Two actions: `generate` and `streamGenerate`

## Mock mode

All responses return `[MOCK RESPONSE]`. To implement real logic, replace the body of
`actions.generate()` using connector values injected at runtime.

## Validation

```bash
morphius-forge validate .
morphius-forge inspect .
```
