# Morphius Umbrella Recipes

Version: 0.1.0

---

## Core rule

**Umbrellas are not giant modules.**

An umbrella is a workspace recipe composed from smaller modules. The umbrella coordinates them; it does not replace them.

Rule of thumb:
- Module = one capability
- Umbrella = recipe combining modules
- Morphius = empty canvas that mounts them

---

## Recommended umbrella recipes

### Research Workspace

Source Search + Source Ranker + Evidence Extractor + Conversation Summarizer + Citation Builder + Claim Checker

Use this when the main task is finding sources, extracting evidence, and defending claims with citations.

### Benchmark Workspace

Model Connector + Model Router + Benchmark Runner + Cost Monitor + Output Validator + Audit Logger

Use this when comparing providers, prompts, or routing strategies across repeated runs.

### Prompt Cleanup Workspace

Prompt Cleaner + Prompt Classifier + Token Budget App + Output Validator + Audit Logger

Use this when refining prompts before they are sent to a downstream model or workflow.

### Conversation Summary Workspace

Conversation Summarizer + Context Builder + Memory Manager + Citation Builder

Use this when compressing long-running sessions into reusable memory and reference artifacts.

### Tool Debug Workspace

Tool Registry + Tool Runner + Health Check + Replay Debugger + Audit Logger

Use this when diagnosing tool failures, schema mismatches, or orchestration issues.

### Approval Review Workspace

Approval Gate + Permission Provider + Audit Logger + Notification App

Use this when an operator needs to review requests, permissions, and outcomes before actions proceed.

### Memory Review Workspace

Memory Manager + Claim Checker + Output Validator + Audit Logger

Use this when validating whether stored memory is accurate, useful, and safe to reuse.

### Agent Task Workspace

Prompt Router + Tool Registry + Tool Runner + Approval Gate + Audit Logger + Notification App

Use this when the goal is orchestrating an agent task with tools, routing, and operational controls.

---

## How to think about umbrellas

An umbrella recipe should:
- combine modules that are independently useful
- expose a coherent operator workflow
- avoid hiding too many unrelated responsibilities inside one module
- make it obvious which capability belongs to which module

An umbrella recipe should not:
- become a monolith in disguise
- duplicate capability that should live in a reusable module
- treat the recipe itself as the only place where the logic can exist

---

## Mapping to workflow modules

If you build a `workflow` module, think of it as a composition layer:
- references smaller modules by ID
- wires actions together
- defines data flow between steps
- does not absorb all sub-capabilities into one giant implementation

Use `templates/workflow-module/` for the structure, but use the compositions in this document to choose module boundaries.
