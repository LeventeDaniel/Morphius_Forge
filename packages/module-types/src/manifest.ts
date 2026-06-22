import { z } from "zod";

// ─── Primitive schemas ────────────────────────────────────────────────────────

// Allow any non-empty string for type — not a closed enum.
// Known values: frontend, backend, fullstack, workflow, provider
// Unknown values are valid but will display as experimental in Morphius.
export const ModuleTypeSchema = z.string().min(1, "type must be a non-empty string");

export const SemverSchema = z
  .string()
  .regex(
    /^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/,
    "version must be valid semver (e.g. 0.1.0)"
  );

export const ModuleIdSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "id must be kebab-case alphanumeric (e.g. my-module)"
  );

export const MorphiusVersionSchema = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, "morphiusVersion must be valid semver")
  .optional();

// ─── Permission ───────────────────────────────────────────────────────────────
// Allow any string permission — not a closed enum. Known values are listed in
// docs/COMPATIBILITY_LEVELS.md but new permissions can be declared freely.

export const PermissionSchema = z.string().min(1);

// ─── Connector (symbolic only — no real URLs or keys) ─────────────────────────

export const ConnectorSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

// ─── Secret reference (name only — never a real value) ───────────────────────

export const SecretRefSchema = z.object({
  name: z
    .string()
    .regex(
      /^[A-Z][A-Z0-9_]*$/,
      "secretRef name must be SCREAMING_SNAKE_CASE (e.g. OPENAI_API_KEY)"
    ),
  description: z.string().optional(),
});

// ─── Action ───────────────────────────────────────────────────────────────────

export const ActionSchema = z.object({
  id: z
    .string()
    .regex(
      /^[a-zA-Z][a-zA-Z0-9]*$/,
      "action id must be camelCase alphanumeric (e.g. cleanPrompt)"
    ),
  name: z.string().min(1),
  description: z.string().optional(),
  inputSchema: z.string().optional(),
  outputSchema: z.string().optional(),
});

// ─── Event ────────────────────────────────────────────────────────────────────

export const EventSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  payloadSchema: z.string().optional(),
});

// ─── Window config ───────────────────────────────────────────────────────────

export const WindowConfigSchema = z.object({
  defaultWidth: z.number().int().min(200).max(3840).optional(),
  defaultHeight: z.number().int().min(100).max(2160).optional(),
  minWidth: z.number().int().min(200).optional(),
  minHeight: z.number().int().min(100).optional(),
  resizable: z.boolean().optional(),
  collapsible: z.boolean().optional(),
  minimizable: z.boolean().optional(),
  initialPosition: z
    .enum(["center", "top-left", "top-right", "bottom-left", "bottom-right"])
    .optional(),
});

// ─── Provider metadata (optional, flexible) ──────────────────────────────────
// Known kinds: permission, approval, sandbox, audit, policy, auth, execution,
// connection, generic. Unknown kinds are allowed — they appear as experimental.

export const ProviderMetaSchema = z.object({
  kind: z.string().min(1, "provider.kind must be a non-empty string"),
  handles: z.array(z.string()).optional(),
  decisions: z.array(z.string()).optional(),
}).passthrough(); // permit extra fields from custom provider designs

// ─── Full manifest ────────────────────────────────────────────────────────────
// Minimum required: id, name, version, type, entry
// Everything else is optional and contributes to higher compatibility levels.

export const ManifestSchema = z.object({
  // ── MINIMUM REQUIRED ────────────────────────────────────────────────────────
  id: ModuleIdSchema,
  name: z.string().min(1, "name is required"),
  version: SemverSchema,
  type: ModuleTypeSchema,
  entry: z.string().min(1, "entry is required"),

  // ── LEVEL 2 — USABLE ────────────────────────────────────────────────────────
  description: z.string().optional(),
  backendEntry: z.string().optional(),
  window: WindowConfigSchema.optional(),
  permissions: z.array(PermissionSchema).default([]),

  // ── LEVEL 3 — INTEGRATED ────────────────────────────────────────────────────
  connectors: z.array(ConnectorSchema).default([]),
  secretRefs: z.array(SecretRefSchema).default([]),
  actions: z.array(ActionSchema).default([]),
  eventsEmitted: z.array(EventSchema).default([]),
  eventsListened: z.array(EventSchema).default([]),
  morphiusVersion: MorphiusVersionSchema,
  workflowCompatible: z.boolean().optional(),
  mockMode: z.boolean().optional(),

  // ── LEVEL 4 — ADVANCED ──────────────────────────────────────────────────────
  provider: ProviderMetaSchema.optional(),
  sandbox: z.object({
    hints: z.array(z.string()).optional(),
    isolated: z.boolean().optional(),
  }).optional(),

  // ── ADDITIONAL METADATA (any level) ─────────────────────────────────────────
  tags: z.array(z.string()).default([]),
  author: z.string().optional(),
  license: z.string().default("MIT"),
});

// ─── Derived types ────────────────────────────────────────────────────────────

export type ModuleType = string;
export type Permission = string;
export type Connector = z.infer<typeof ConnectorSchema>;
export type SecretRef = z.infer<typeof SecretRefSchema>;
export type Action = z.infer<typeof ActionSchema>;
export type Event = z.infer<typeof EventSchema>;
export type WindowConfig = z.infer<typeof WindowConfigSchema>;
export type ProviderMeta = z.infer<typeof ProviderMetaSchema>;
export type Manifest = z.infer<typeof ManifestSchema>;
