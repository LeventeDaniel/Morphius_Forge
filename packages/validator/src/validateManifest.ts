import { ManifestSchema, type Manifest } from "@morphius-forge/module-types";
import { ZodError } from "zod";

// ─── Compatibility levels ─────────────────────────────────────────────────────
// loadable   — minimum 5 fields only (id, name, version, type, entry)
// usable     — adds description + at least one UI surface
// actionable — adds declared actions with action UI metadata
// advanced   — adds provider metadata, sandbox hints, diagnostics/log surfaces

export type CompatibilityLevel = "loadable" | "usable" | "actionable" | "advanced";

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

const KNOWN_SURFACE_PURPOSES = new Set([
  "primary-control", "status", "settings", "task-runner",
  "results", "logs", "review", "diagnostics",
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

function computeLevel(
  manifest: Manifest,
  warnings: string[],
  recommendations: string[]
): CompatibilityLevel {
  const hasDescription =
    typeof manifest.description === "string" && manifest.description.trim().length > 0;
  const hasSurfaces = manifest.ui !== undefined && manifest.ui.surfaces.length > 0;
  const hasPrimarySurface =
    hasSurfaces &&
    manifest.ui!.surfaces.some(
      (s) =>
        s.purpose === "primary-control" ||
        s.id === "main" ||
        manifest.ui!.primarySurface === s.id
    );

  // ── Level 1 → Level 2 gate ──────────────────────────────────────────────────
  if (!hasDescription) {
    recommendations.push(
      "description: add a description for better display in Morphius (Level 2 — Usable)"
    );
  }

  if (!hasSurfaces) {
    recommendations.push(
      "ui.surfaces: modules should own their UI — declare at least one surface so Morphius can mount it (Level 2 — Usable). " +
        "See docs/MODULE_UI_GUIDE.md"
    );
  } else if (!hasPrimarySurface) {
    recommendations.push(
      "ui.primarySurface: mark one surface as primary-control or set ui.primarySurface so Morphius knows the main interface"
    );
  }

  if (!manifest.window) {
    recommendations.push(
      "window: add window size preferences for better initial layout (Level 2 — Usable)"
    );
  }

  if (!hasDescription || !hasSurfaces) return "loadable";

  // ── Level 2 → Level 3 gate ──────────────────────────────────────────────────
  const hasActions = manifest.actions.length > 0;
  const actionsWithUi = manifest.actions.filter((a) => a.ui !== undefined);

  if (!hasActions) {
    recommendations.push(
      "actions: declare module actions so they appear as controls in the module UI (Level 3 — Actionable)"
    );
  } else if (actionsWithUi.length === 0) {
    recommendations.push(
      "actions[*].ui: add ui.buttonLabel/placement to actions so they render as controls in the module interface (Level 3 — Actionable)"
    );
  }

  const destructiveWithoutConfirm = manifest.actions.filter(
    (a) => a.kind === "destructive" && !a.ui?.confirmMessage
  );
  for (const a of destructiveWithoutConfirm) {
    warnings.push(
      `actions["${a.id}"]: kind is "destructive" but ui.confirmMessage is not set — add a confirmation prompt`
    );
  }

  const approvalWithoutUi = manifest.actions.filter(
    (a) => a.kind === "approval-required" && !a.ui
  );
  for (const a of approvalWithoutUi) {
    recommendations.push(
      `actions["${a.id}"]: kind is "approval-required" — add ui metadata so the approval flow is clear in the module interface`
    );
  }

  if (typeof manifest.workflowCompatible !== "boolean") {
    recommendations.push(
      "workflowCompatible: set to true if this module works in workflows (Level 3 — Actionable)"
    );
  }

  // Warn on unknown surface purposes
  if (hasSurfaces) {
    for (const s of manifest.ui!.surfaces) {
      if (s.purpose && !KNOWN_SURFACE_PURPOSES.has(s.purpose)) {
        warnings.push(
          `ui.surfaces["${s.id}"].purpose: "${s.purpose}" is not a recognized purpose — will be treated as custom`
        );
      }
    }
  }

  if (!hasActions) return "usable";

  // ── Level 3 → Level 4 gate ──────────────────────────────────────────────────
  const hasProvider = manifest.provider !== undefined;
  const hasSandbox = manifest.sandbox !== undefined;
  const hasDiagnosticSurface =
    hasSurfaces &&
    manifest.ui!.surfaces.some(
      (s) => s.purpose === "diagnostics" || s.purpose === "logs"
    );

  if (!hasProvider) {
    recommendations.push(
      "provider: add provider metadata if this module fills a system role (Level 4 — Advanced)"
    );
  }
  if (!hasDiagnosticSurface) {
    recommendations.push(
      "ui.surfaces: consider adding a diagnostics or logs surface for advanced modules (Level 4 — Advanced)"
    );
  }

  if (!(hasProvider || hasSandbox)) return "actionable";

  // Validate provider metadata (warnings only)
  if (hasProvider) {
    const prov = manifest.provider!;
    if (!KNOWN_PROVIDER_KINDS.has(prov.kind)) {
      warnings.push(
        `provider.kind: "${prov.kind}" is not a recognized kind — will display as experimental in Morphius`
      );
    }
    if (!prov.handles || prov.handles.length === 0) {
      recommendations.push(
        "provider.handles: list the request types this provider handles"
      );
    }
    if (!prov.decisions || prov.decisions.length === 0) {
      recommendations.push(
        'provider.decisions: list possible decisions (e.g. ["accepted", "rejected"])'
      );
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
    warnings.push(
      `type: "${manifest.type}" is not a standard type — will display as experimental in Morphius`
    );
  }

  // fullstack: backendEntry recommended
  if (manifest.type === "fullstack" && !manifest.backendEntry) {
    warnings.push(
      "fullstack modules should declare backendEntry — Morphius cannot route backend calls without it"
    );
  }

  // backend: backendEntry recommended
  if (manifest.type === "backend" && !manifest.backendEntry) {
    recommendations.push(
      "backend module has no backendEntry — consider declaring backendEntry"
    );
  }

  // workflow: actions recommended
  if (manifest.type === "workflow" && manifest.actions.length === 0) {
    recommendations.push(
      "workflow module has no actions declared — consider declaring the workflows it exposes"
    );
  }

  // UI surface entry files consistency check: surfaces override the top-level entry
  // for display purposes; warn if a surface entry equals the top-level entry on a
  // multi-surface module (likely a copy-paste oversight).
  if (manifest.ui && manifest.ui.surfaces.length > 1) {
    const duplicateEntries = manifest.ui.surfaces.filter(
      (s) => s.entry === manifest.entry
    );
    for (const s of duplicateEntries) {
      recommendations.push(
        `ui.surfaces["${s.id}"].entry is the same as the top-level entry — each surface should point to its own component file`
      );
    }
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
