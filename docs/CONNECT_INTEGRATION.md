# Morphius Connect Integration Guide

Version: 0.1.0

---

## What is Morphius Connect?

**Morphius Connect is not part of this repository.**

Morphius Connect is a separate, private configuration and secrets layer that bridges the gap between:
- **Morphius modules** (what you build here) — declare what they need
- **Real credentials and endpoints** — stored securely in Morphius Connect

Morphius Connect is:
- Private (never published)
- Operator-specific (each deployment has its own)
- Outside the scope of Morphius Forge

---

## How modules declare requirements

Modules declare their connection requirements symbolically in `manifest.json`. These are **intentions**, not real values.

### Connector declaration (in manifest.json)

```json
"connectors": [
  { "name": "local_llm", "description": "Local language model endpoint" },
  { "name": "coding_api", "description": "Code execution API" },
  { "name": "reasoning_api", "description": "High-quality reasoning LLM" },
  { "name": "browser_preview_api", "description": "Browser automation endpoint" }
]
```

These are symbolic names. Morphius Connect maps each name to a real URL at runtime.

### Secret reference declaration (in manifest.json)

```json
"secretRefs": [
  { "name": "OPENAI_API_KEY", "description": "OpenAI API key" },
  { "name": "GITHUB_TOKEN", "description": "GitHub access token" },
  { "name": "TELEGRAM_BOT_TOKEN", "description": "Telegram bot token" }
]
```

These are name declarations only. Morphius Connect holds the real values and injects them at runtime.

---

## Standard connector names

Use these conventional names when your module needs common services. Morphius Connect maps them to your actual endpoints.

| Name | Typical service |
|------|----------------|
| `local_llm` | Local Ollama or similar self-hosted LLM |
| `reasoning_api` | Cloud LLM (OpenAI, Anthropic, etc.) |
| `coding_api` | Code execution or Codex-style API |
| `browser_preview_api` | Browser automation (Playwright, Puppeteer) |
| `storage_api` | Key-value or document storage |
| `search_api` | Web or semantic search |
| `oauth_provider` | OAuth 2.0 authorization server |
| `vector_db` | Vector/embedding database |

You may define custom connector names for your specific needs.

---

## How Morphius Connect injects values

> Note: The exact injection API is defined by Morphius Connect, not Morphius Forge.
> The pattern below is illustrative.

At runtime, Morphius Connect wraps module execution with an injected context:

```typescript
// Pseudocode — actual API defined by Morphius Connect
const context = {
  connectors: {
    local_llm: {
      baseUrl: "http://localhost:11434",
      // other connector-specific fields
    },
    reasoning_api: {
      baseUrl: "https://api.openai.com/v1",
    },
  },
  secrets: {
    OPENAI_API_KEY: "sk-...",  // real value, injected at runtime
    GITHUB_TOKEN: "ghp_...",
  },
};
```

Your module reads from `context`, not from hardcoded values:

```typescript
// In your action handler:
const apiKey = context.secrets.OPENAI_API_KEY;
const baseUrl = context.connectors.reasoning_api.baseUrl;

const response = await fetch(`${baseUrl}/chat/completions`, {
  headers: { Authorization: `Bearer ${apiKey}` },
  // ...
});
```

---

## What Morphius Connect is NOT

- Not a module
- Not part of Morphius Forge
- Not part of Morphius itself
- Not a public repository
- Not built here

---

## Building Morphius Connect (out of scope for this repo)

Morphius Connect is built separately as a private deployment configuration layer. It typically includes:
- A secrets vault (HashiCorp Vault, 1Password Secrets Automation, AWS Secrets Manager, etc.)
- Connector mapping configuration (maps symbolic names to real endpoints)
- Module permission enforcement
- Runtime injection mechanism

Do not build any of this inside Morphius Forge or inside module repos.
