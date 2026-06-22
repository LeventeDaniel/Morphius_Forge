# Morphius Security Rules

Version: 0.1.0

---

## The Core Rule

**No secrets live in module code. No secrets live in Morphius Forge. No secrets live in Morphius itself.**

Real credentials, API keys, tokens, and private endpoints belong in **Morphius Connect** — a separate, private configuration layer that is never published.

---

## What is a "secret"?

A secret is any value that:
- Authenticates access to a service (API key, token, password)
- Contains a private endpoint that should not be public
- Provides authorization that could be abused if leaked
- Is specific to your deployment (not a public URL or constant)

Examples:
- `sk-abc123...` (OpenAI key)
- `ghp_xyz...` (GitHub PAT)
- `https://my-internal-server.local/api` (private endpoint)
- Any value in a `.env` file that you would not put in a public GitHub repo

---

## Rules by layer

### Module repos (what you build with Morphius Forge)

| Rule | Explanation |
|------|-------------|
| No real API keys | Declare with `secretRefs` by name only |
| No real private URLs | Declare with `connectors` by name only |
| No `.env` files with real values | `.env` files should be gitignored and empty in the repo |
| No hardcoded tokens or passwords | Use mock values like `MOCK_TOKEN` in examples |
| No private endpoint discovery | Don't embed IP addresses or internal hostnames |

### Morphius Forge (this repo)

Morphius Forge is **always public-safe**. It contains:
- Templates with mock values only
- Example modules with `[MOCK]` responses
- Documentation and schemas
- Validator and CLI

It never contains real deployments, real API keys, or Morphius Connect configuration.

### Morphius (the blank host)

Morphius itself contains zero application logic, zero credentials, and zero real integrations.
It is a blank webtop canvas that loads modules.

---

## Correct pattern: connector reference

```json
"connectors": [
  {
    "name": "local_llm",
    "description": "Local language model endpoint"
  }
]
```

At runtime, Morphius Connect injects the actual base URL for `local_llm`.
Your module code reads it from the injected context, not from a hardcoded string.

---

## Correct pattern: secret reference

```json
"secretRefs": [
  {
    "name": "OPENAI_API_KEY",
    "description": "OpenAI API key"
  }
]
```

At runtime, Morphius Connect injects the real key into the module context.
Your module reads `context.secrets.OPENAI_API_KEY`, not a hardcoded value.

---

## Secret detector

The `morphius-forge validate` command scans module files for common secret patterns:

| Pattern | What it detects |
|---------|----------------|
| `sk-[20+ chars]` | OpenAI / Anthropic API keys |
| `ghp_[36 chars]` | GitHub personal access tokens |
| `xoxb-...` | Slack bot tokens |
| `ya29....` | Google OAuth tokens |
| `"api_key": "[16+ chars]"` | API key fields with real-looking values |
| `"password": "[4+ chars]"` | Password fields with values |
| `"token": "[20+ chars]"` | Token fields with long values |
| `-----BEGIN PRIVATE KEY-----` | PEM private keys |

If any of these are found, validation fails with a SECURITY error.

---

## What to do instead of hardcoding

| Temptation | Correct approach |
|------------|-----------------|
| `const key = "sk-abc123"` | `const key = context.secrets.OPENAI_API_KEY` |
| `const url = "https://api.example.com"` | `const url = context.connectors.my_api.baseUrl` |
| `password: "hunter2"` in config | Remove entirely; inject via Morphius Connect |
| `GITHUB_TOKEN=xxx` in `.env` | Declare `secretRefs: [{name: "GITHUB_TOKEN"}]` |

---

## When in doubt

If you're unsure whether something is a secret: **assume it is**.

Declare it as a `secretRef` or `connector` and let Morphius Connect manage it.
The cost of over-declaring is zero. The cost of leaking a credential is significant.
