// DEMO MODULE — Demo LLM Connector — Server

import * as http from "http";
import { actions } from "./actions";

const PORT = parseInt(process.env.MODULE_PORT ?? "0", 10) || 9300;

const server = http.createServer(async (req, res) => {
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", async () => {
    try {
      const { action, input } = JSON.parse(body);
      const handler = (actions as Record<string, (i: unknown) => Promise<unknown>>)[action];
      if (!handler) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: `Unknown action: ${action}` }));
        return;
      }
      const result = await handler(input);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ result }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: (e as Error).message }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`[demo-llm-connector] listening on port ${PORT}`);
});
