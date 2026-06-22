import { ManifestSchema, type Manifest } from "@morphius-forge/module-types";
import { ZodError } from "zod";

// ─── Compatibility levels ─────────────────────────────────────────────────────
// loadable   — minimum fields only (id, name, version, type, entry)
// usable     — adds description, window, permissions
// integrated — adds actions, Connect references, workflow compat
// advanced   — adds provider metadata, sandbox hints

export type CompatibilityLevel = "loadable" | "usable" | "integrated" | "advanced";

export type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  compatibilityLevel: CompatibilityLevel;
  manifest?: Manifest;
};

// ─── Known values (for warnings, not hard rejection) ─────────────────────────

const KNOWN_PROVIDER_KINDS = new Set([
  "permission", "approval", "sandbox", "audit",
  "policy", "auth", "execution", "connection", "generic",
]);

const KNOWN_TYPES = new Set([
  "frontend", "backend", "fullstack", "workflow", "provider",
]);

// ─── Patterns that strongly suggest a real secret value is present ────────────

const SECRET_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /sk-[A-Za-z0-9]{20,}/, label: "OpenAI/Anthropic API key (sk-...)" },
  { pattern: /ghp_[A-Za-z0-9]{36}/, label: "GitHub personal access token (ghp_...)" },
  { pattern: /xoxb-[0-9]+-[A-Za-z0-9]+/, label: "Slack bot token (xoxb-...)" },
  { pattern: /ya29\.[A-Za-z0-9_-]+/, label: "Google OAuth token (ya29...)" },
  { pattern: /"api[_-]?key"\s*:\s*"[A-Za-z0-9]{16,}"/, label: "api_key with real-looking value" },
  { pattern: /"password"\s*:\s*"[^"]{4,}"/, label: "password field with value" },
  { pattern: /"token"\s*:\s*"[A-Za-z0-9._-]{20,}"/, label: "token field with long value" },
  { pattern: /"bearer"\s*:\s*"[A-Za-z0-9._-]{20,}"/, label: "bearer field with value" },
  { pattern: /"private[_-]?key"\s*:\s*"[^"]{10,}"/, label: "private_key field with value" },
  { pattern: /"access[_-]?token"\s*:\s*"[A-Za-z0-9._-]{20,}"/, label: "access_token with value" },
  { pattern: /"refresh[_-]?token"\s*:\s*"[A-Za-z0-9._-]{20,}"/, label: "refresh_token with value" },
  { pattern: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/, label: "PEM private key block" },
];

// ─── Compute compatibility level ─────────────────────────────────────────────

function computeLevel(manifest: Manifest, warnings: string[], recommendations: string[]): CompatibilityLevel {
  // Level 2 — Usable: has description + permissions declared
  const hasDescription = typeof manifest.description === "string" && manifest.description.trim().length > 0;
  const hasWindow = manifest.window !== undefined;

  if (!hasDescription) {
    recommendations.push("description: add a description for better display in Morphius (Level 2 — Usable)");
  }
  if (!hasWindow) {
    recommendations.push("window: add window preferences for better UX (Level 2 — Usable)");
  }

  if (!hasDescription) return "loadable";

  // Level 3 — Integrated: has actions
  const hasActions = manifest.actions.length > 0;

  if (!hasActions) {
    recommendations.push("actions: declare module actions for richer Morphius integration (Level 3 — Integrated)");
  }
  if (typeof manifest.workflowCompatible !== "boolean") {
    recommendations.push("workflowCompatible: set to true if this module works in workflows (Level 3 — Integrated)");
  }

  if (!hasActions) return "usable";

  // Level 4 — Advanced: has provider or sandbox metadata
  const hasProvider = manifest.provider !== undefined;
  const hasSandbox = manifest.sandbox !== undefined;

  if (!hasProvider) {
    recommendations.push("provider: add provider metadata if this module fills a system role (Level 4 — Advanced)");
  }

  if (!(hasProvider || hasSandbox)) return "integrated";

  // Validate provider metadata (warnings, not errors)
  if (hasProvider) {
    const prov = manifest.provider!;
    if (!KNOWN_PROVIDER_KINDS.has(prov.kind)) {
      warnings.push(`provider.kind: "${prov.kind}" is not a recognized kind — will display as experimental in Morphius`);
    }
    if (!prov.handles || prov.handles.length === 0) {
      recommendations.push("provider.handles: list the request types this provider handles");
    }
    if (!prov.decisions || prov.decisions.length === 0) {
      recommendations.push("provider.decisions: list possible decisions (e.g. [\"allow\", \"block\"])");
    }
  }

  return "advanced";
}

// ─── Main validator ───────────────────────────────────────────────────────────

export function validateManifest(raw: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Zod parse — fails only on missing minimum fields or type mismatches
  const parsed = ManifestSchema.safeParse(raw);
  if (!parsed.success) {
    const zodErrors = (parsed.error as ZodError).errors.map(
      (e) => `${e.path.join(".")}: ${e.message}`
    );
    errors.push(...zodErrors);
    return { valid: false, errors, warnings, recommendations, compatibilityLevel: "loadable" };
  }

  const manifest = parsed.data;

  // Warn on unknown type (not an error — experimental types are allowed)
  if (!KNOWN_TYPES.has(manifest.type)) {
    warnings.push(`type: "${manifest.type}" is not a standard type — will display as experimental in Morphius`);
  }

  // fullstack: backendEntry recommended
  if (manifest.type === "fullstack" && !manifest.backendEntry) {
    warnings.push("fullstack modules should declare backendEntry — Morphius cannot route backend calls without it");
  }

  // backend: backendEntry recommended
  if (manifest.type === "backend" && !manifest.backendEntry) {
    recommendations.push("backend module has no backendEntry — consider declaring backendEntry");
  }

  // workflow: actions recommended
  if (manifest.type === "workflow" && manifest.actions.length === 0) {
    recommendations.push("workflow module has no actions declared — consider declaring the workflows it exposes");
  }

  // Secret scan on raw JSON string — always an error
  const rawStr = JSON.stringify(raw);
  for (const { pattern, label } of SECRET_PATTERNS) {
    if (pattern.test(rawStr)) {
      errors.push(
        `SECURITY: manifest appears to contain a real secret (${label}). ` +
          "Move secrets to Morphius Connect and reference by name only."
      );
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings, recommendations, compatibilityLevel: "loadable" };
  }

  const compatibilityLevel = computeLevel(manifest, warnings, recommendations);

  return {
    valid: true,
    errors: [],
    warnings,
    recommendations,
    compatibilityLevel,
    manifest,
  };
}
