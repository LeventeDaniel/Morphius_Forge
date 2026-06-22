import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import * as http from "node:http";
import { validateModuleFolder } from "../../validator/src/validateModuleFolder.js";

const DEFAULT_PORT = 7901;
const CONFIG_FILE = "forge.config.json";

interface ForgeConfig {
  modulePaths: string[];
}

function loadConfig(configPath: string): ForgeConfig {
  if (!existsSync(configPath)) return { modulePaths: [] };
  try {
    const raw = JSON.parse(readFileSync(configPath, "utf-8"));
    return {
      modulePaths: Array.isArray(raw.modulePaths) ? raw.modulePaths : [],
    };
  } catch {
    return { modulePaths: [] };
  }
}

function saveConfig(configPath: string, config: ForgeConfig) {
  writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
}

interface ScanResult {
  path: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  name?: string;
  version?: string;
  id?: string;
}

function scanPaths(paths: string[]): ScanResult[] {
  return paths.map((p) => {
    const abs = resolve(p);
    const result = validateModuleFolder(abs);
    return {
      path: abs,
      valid: result.valid,
      errors: result.errors,
      warnings: result.warnings,
      name: result.manifest?.name,
      version: result.manifest?.version,
      id: result.manifest?.id,
    };
  });
}

function json(res: http.ServerResponse, status: number, body: unknown) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });
  res.end(data);
}

export function runServe(args: string[]) {
  const portArg = args.find((a) => a.startsWith("--port="));
  const port = portArg ? Number(portArg.split("=")[1]) : DEFAULT_PORT;
  const configDir = process.cwd();
  const configPath = join(configDir, CONFIG_FILE);

  let config = loadConfig(configPath);
  let lastScanAt: string | null = null;
  let scanResults: ScanResult[] = [];

  function rescan() {
    scanResults = scanPaths(config.modulePaths);
    lastScanAt = new Date().toISOString();
  }

  // Initial scan
  rescan();

  const server = http.createServer((req, res) => {
    // CORS preflight
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      });
      res.end();
      return;
    }

    const url = req.url ?? "/";

    if (req.method === "GET" && url === "/status") {
      const validCount = scanResults.filter((r) => r.valid).length;
      const invalidCount = scanResults.filter((r) => !r.valid).length;
      json(res, 200, {
        forgePath: dirname(configPath).split(/[\\/]/).pop(),
        modulePathCount: config.modulePaths.length,
        validModuleCount: validCount,
        invalidModuleCount: invalidCount,
        lastScanAt,
        modules: scanResults,
      });
      return;
    }

    if (req.method === "POST" && url === "/reload") {
      rescan();
      json(res, 200, {
        ok: true,
        validModuleCount: scanResults.filter((r) => r.valid).length,
        invalidModuleCount: scanResults.filter((r) => !r.valid).length,
        lastScanAt,
      });
      return;
    }

    if (req.method === "POST" && url === "/paths") {
      let body = "";
      req.on("data", (chunk) => { body += chunk; });
      req.on("end", () => {
        try {
          const parsed = JSON.parse(body) as { paths?: string[] };
          if (!Array.isArray(parsed.paths)) {
            json(res, 400, { ok: false, error: 'Expected { paths: string[] }' });
            return;
          }
          config.modulePaths = parsed.paths.map((p) => resolve(p));
          saveConfig(configPath, config);
          rescan();
          json(res, 200, { ok: true, modulePathCount: config.modulePaths.length });
        } catch (err) {
          json(res, 400, { ok: false, error: "Invalid JSON body" });
        }
      });
      return;
    }

    json(res, 404, { error: "Not found" });
  });

  server.listen(port, () => {
    console.log(`\n  Forge Status server running on http://localhost:${port}`);
    console.log(`  Config: ${configPath}`);
    console.log(`  Module paths: ${config.modulePaths.length === 0 ? "(none)" : config.modulePaths.join(", ")}`);
    console.log(`\n  Routes:`);
    console.log(`    GET  /status  — current scan results`);
    console.log(`    POST /reload  — re-scan all paths`);
    console.log(`    POST /paths   — update module paths { paths: string[] }`);
    console.log(`\n  Load the Forge Status module in Morphius and point it to http://localhost:${port}`);
    console.log(`  Press Ctrl+C to stop.\n`);
  });
}
