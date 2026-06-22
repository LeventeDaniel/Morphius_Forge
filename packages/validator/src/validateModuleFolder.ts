import * as fs from "fs";
import * as path from "path";
import { validateManifest, type ValidationResult } from "./validateManifest";

export type FolderValidationResult = ValidationResult & {
  modulePath: string;
};

// Patterns that strongly suggest real secrets in any source file
const SOURCE_SECRET_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /sk-[A-Za-z0-9]{20,}/, label: "OpenAI/Anthropic API key (sk-...)" },
  { pattern: /ghp_[A-Za-z0-9]{36}/, label: "GitHub personal access token" },
  { pattern: /xoxb-[0-9]+-[A-Za-z0-9]+/, label: "Slack bot token" },
  { pattern: /ya29\.[A-Za-z0-9_-]+/, label: "Google OAuth token" },
  { pattern: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/, label: "PEM private key" },
  { pattern: /password\s*=\s*["'][^"']{6,}["']/, label: "hardcoded password assignment" },
  { pattern: /api_key\s*=\s*["'][A-Za-z0-9]{16,}["']/, label: "hardcoded api_key assignment" },
];

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".json", ".env", ".yaml", ".yml"];

// Design rule checks for UI source files
const OFF_PALETTE_COLORS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /#[0-9a-fA-F]{3,6}(?![0-9a-fA-F])/, label: "raw hex color" },
];

const ALLOWED_HEX = new Set([
  // greyscale spectrum
  "#000", "#000000",
  "#050505", "#0a0a0a", "#0d0d0d",
  "#111", "#111111",
  "#161616", "#1a1a1a", "#1e1e1e",
  "#2a2a2a", "#333", "#333333",
  "#3a3a3a", "#444", "#444444",
  "#555", "#555555",
  "#666", "#666666",
  "#888", "#888888",
  "#aaa", "#aaaaaa",
  "#ccc", "#cccccc",
  "#e0e0e0", "#e8e8e8",
  "#fff", "#ffffff",
  // permitted accents
  "#4ade80",
  "#f87171",
]);

const FORBIDDEN_COLOR_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /(?:color|background|border)[^:]*:\s*["']?(#(?:3b82f6|60a5fa|93c5fd|2563eb|1d4ed8)[0-9a-fA-F]*)["']?/i, label: "blue accent (#3b82f6 family) — use grey instead" },
  { pattern: /(?:color|background|border)[^:]*:\s*["']?(#(?:a78bfa|8b5cf6|7c3aed|6d28d9)[0-9a-fA-F]*)["']?/i, label: "purple accent — use grey instead" },
  { pattern: /(?:color|background|border)[^:]*:\s*["']?(#(?:facc15|fbbf24|f59e0b|eab308)[0-9a-fA-F]*)["']?/i, label: "yellow accent — use grey (#666) for warnings instead" },
  { pattern: /(?:color|background|border)[^:]*:\s*["']?(#(?:f97316|fb923c|ea580c)[0-9a-fA-F]*)["']?/i, label: "orange accent — use grey instead" },
];

const SMALL_FONT_PATTERN = /fontSize\s*[=:]\s*["']?([0-9]+)(?:px)?["']?/g;
const MIN_FONT_SIZE = 11;

function scanFileForDesignViolations(filePath: string): string[] {
  const findings: string[] = [];
  if (![".tsx", ".ts", ".css"].includes(path.extname(filePath))) return findings;
  let content: string;
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch {
    return findings;
  }
  const base = path.basename(filePath);

  // Check forbidden accent colors
  for (const { pattern, label } of FORBIDDEN_COLOR_PATTERNS) {
    if (pattern.test(content)) {
      findings.push(`DESIGN: off-palette color in ${base} — ${label}`);
    }
  }

  // Check font sizes below minimum
  let match: RegExpExecArray | null;
  const fontRe = new RegExp(SMALL_FONT_PATTERN.source, "g");
  while ((match = fontRe.exec(content)) !== null) {
    const size = parseInt(match[1], 10);
    if (size < MIN_FONT_SIZE) {
      findings.push(`DESIGN: fontSize ${size} in ${base} is below minimum ${MIN_FONT_SIZE}px — increase to at least ${MIN_FONT_SIZE}`);
    }
  }

  return findings;
}

const UI_SOURCE_EXTENSIONS = [".tsx", ".ts", ".css"];

function scanFileForSecrets(filePath: string): string[] {
  const findings: string[] = [];
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    for (const { pattern, label } of SOURCE_SECRET_PATTERNS) {
      if (pattern.test(content)) {
        findings.push(`SECURITY: ${label} found in ${path.basename(filePath)}`);
      }
    }
  } catch {
    // unreadable file — skip
  }
  return findings;
}

function collectSourceFiles(dir: string, depth = 0): string[] {
  if (depth > 5) return [];
  const files: string[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...collectSourceFiles(full, depth + 1));
      } else if (SOURCE_EXTENSIONS.includes(path.extname(entry.name))) {
        files.push(full);
      }
    }
  } catch {
    // unreadable directory — skip
  }
  return files;
}

export function validateModuleFolder(modulePath: string): FolderValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  const absPath = path.resolve(modulePath);

  // Check folder exists
  if (!fs.existsSync(absPath) || !fs.statSync(absPath).isDirectory()) {
    return {
      modulePath: absPath,
      valid: false,
      errors: [`Module folder not found: ${absPath}`],
      warnings: [],
      recommendations: [],
      compatibilityLevel: "loadable",
    };
  }

  // Check manifest.json exists
  const manifestPath = path.join(absPath, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    errors.push("manifest.json is missing from module root");
    return { modulePath: absPath, valid: false, errors, warnings, recommendations, compatibilityLevel: "loadable" };
  }

  // Parse manifest.json
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  } catch (e) {
    errors.push(`manifest.json is not valid JSON: ${(e as Error).message}`);
    return { modulePath: absPath, valid: false, errors, warnings, recommendations, compatibilityLevel: "loadable" };
  }

  // Validate manifest content
  const manifestResult = validateManifest(raw);
  errors.push(...manifestResult.errors);
  warnings.push(...manifestResult.warnings);
  recommendations.push(...manifestResult.recommendations);

  const manifest = manifestResult.manifest;

  // README is recommended but not required — Level 2 usable implies having one
  const readmePath = path.join(absPath, "README.md");
  if (!fs.existsSync(readmePath)) {
    recommendations.push("README.md is missing — add a README for better discoverability (Level 2 — Usable)");
  }

  // Check for .env files not covered by .gitignore
  const envFiles = [".env", ".env.local", ".env.production", ".env.development"];
  const gitignorePath = path.join(absPath, ".gitignore");
  const gitignoreContent = fs.existsSync(gitignorePath)
    ? fs.readFileSync(gitignorePath, "utf-8")
    : "";
  for (const envFile of envFiles) {
    if (fs.existsSync(path.join(absPath, envFile))) {
      const covered =
        gitignoreContent.includes(envFile) ||
        gitignoreContent.includes(".env");
      if (!covered) {
        errors.push(
          `SECURITY: ${envFile} exists but is not covered by .gitignore — secrets may be committed accidentally`
        );
      } else {
        warnings.push(
          `SECURITY: ${envFile} found — ensure it contains no real secrets before committing. Secrets belong in Morphius Connect, not in module folders.`
        );
      }
    }
  }

  // Check entry file exists (if manifest parsed OK)
  if (manifest) {
    const entryPath = path.join(absPath, manifest.entry);
    if (!fs.existsSync(entryPath)) {
      errors.push(`entry file not found: ${manifest.entry}`);
    }

    if (manifest.backendEntry) {
      const backendPath = path.join(absPath, manifest.backendEntry);
      if (!fs.existsSync(backendPath)) {
        errors.push(`backendEntry file not found: ${manifest.backendEntry}`);
      }
    }
  }

  // Scan all source files for embedded secrets and design violations
  const sourceFiles = collectSourceFiles(absPath);
  for (const file of sourceFiles) {
    const secretFindings = scanFileForSecrets(file);
    errors.push(...secretFindings);
    const designFindings = scanFileForDesignViolations(file);
    warnings.push(...designFindings);
  }

  return {
    modulePath: absPath,
    valid: errors.length === 0,
    errors,
    warnings,
    recommendations,
    compatibilityLevel: manifestResult.compatibilityLevel,
    manifest: manifestResult.manifest,
  };
}
