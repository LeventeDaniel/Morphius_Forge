# Morphius Module Catalog

Version: 0.1.0

---

## Core rule

**A module should be one reusable capability, not a tiny function and not a giant app.**

Good module boundaries are:
- large enough to be meaningful on their own
- small enough to be recombined in multiple workspaces
- narrow enough to have one clear responsibility

Morphius is strongest when modules act like capability blocks, not monoliths.

---

## Recommended module sizes

### Good modules

- Model Router
- LLM Connector
- Local Model Connector
- API Model Connector
- Prompt Cleaner
- Prompt Classifier
- Prompt Router
- Token Budget App
- Conversation Summarizer
- Context Builder
- Memory Manager
- Source Search
- Source Ranker
- Evidence Extractor
- Citation Builder
- Claim Checker
- Output Validator
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

---

## What these boundaries mean

### Connectors and model access

- `LLM Connector`: one stable interface for generating or streaming model output
- `Local Model Connector`: a connector for local runtimes such as Ollama
- `API Model Connector`: a connector for hosted providers
- `Model Router`: chooses between connectors or model classes based on cost, latency, quality, or policy

### Prompt and conversation shaping

- `Prompt Cleaner`: normalizes and trims prompt structure
- `Prompt Classifier`: labels prompt type, intent, or risk
- `Prompt Router`: sends prompts to the right downstream module or model path
- `Conversation Summarizer`: compresses long threads into reusable summaries
- `Context Builder`: assembles the context window from memory, tools, sources, and summaries
- `Token Budget App`: estimates and monitors prompt/token size

### Memory and evidence

- `Memory Manager`: stores, retrieves, merges, and prunes memory records
- `Source Search`: retrieves candidate sources
- `Source Ranker`: scores and sorts sources for relevance
- `Evidence Extractor`: pulls structured evidence from source material
- `Citation Builder`: turns evidence into reusable references and citations
- `Claim Checker`: verifies whether an output is supported by evidence

### Quality, cost, and benchmarking

- `Output Validator`: checks output structure, JSON shape, required fields, or other invariants
- `Benchmark Runner`: executes repeated evaluations across prompts, models, or tool paths
- `Cost Monitor`: tracks estimated or actual spend, usage, and token consumption

### Tooling and execution

- `Tool Registry`: lists available tools, their schemas, and health metadata
- `Tool Runner`: executes tools with structured inputs and outputs
- `Health Check`: reports module, connector, or tool availability
- `Replay Debugger`: replays a request, tool call, or workflow step for diagnosis

### Governance and safety

- `Secret Guard`: blocks secret leakage and flags unsafe outputs
- `Approval Gate`: requests or records human approval decisions
- `Permission Provider`: answers permission checks for modules or actions
- `Sandbox Provider`: describes or enforces runtime isolation policies
- `Audit Logger`: records actions, approvals, failures, and outcomes
- `Notification App`: surfaces alerts, review requests, or status changes

### Operator-facing support

- `Connect UI`: configuration or visibility surface for Morphius Connect mappings and requirements

---

## What is too small

These are usually too small to be standalone modules:
- one string utility
- one regex cleanup step
- one single API method with no reusable interface
- one tiny transformation that only exists inside a larger module

These should usually live inside a module, not become modules themselves.

---

## What is too large

These are usually too large to be single modules:
- a whole research suite with search, ranking, extraction, citations, and validation combined
- a complete agent runtime with routing, tools, approvals, audit, and notifications in one package
- a giant "AI app" that hides multiple reusable capabilities behind one manifest

These should usually be split into smaller modules and recombined through umbrella recipes.

---

## Rule of thumb

- Module = one capability
- Umbrella = recipe combining modules
- Morphius = empty canvas that mounts them
