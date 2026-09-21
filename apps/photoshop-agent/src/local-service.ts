import http from "node:http";
import path from "node:path";
import { exec } from "node:child_process";
import { WebSocketServer, WebSocket } from "ws";
import { getAgentEnv } from "@wedding/config/agent";
import { authenticateToken } from "./auth";
import { state } from "./state";
import { broadcast, addSocket } from "./ws-hub";
import { logger } from "./logger";
import type { AgentSocketEvent } from "@wedding/types";
import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";

/**
 * Local HTTP + WebSocket service (127.0.0.1 only by default).
 *
 * Endpoints:
 *   GET  /health         — liveness probe
 *   GET  /status         — Photoshop/busy state for the local UI
 *   POST /open-folder    — opens an output/workspace folder in Explorer
 *                          (localhost only; paths restricted to known roots)
 *   WS   /ws             — job progress events for the browser (same machine)
 *
 * SECURITY: no shell endpoint exists. The only process launch is Explorer on
 * a whitelisted folder. Mutating endpoints require the shared agent token.
 */
export function startLocalService(): Promise<http.Server> {
  const env = getAgentEnv();
  const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); // localhost-only service
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const route = `${req.method} ${url.pathname}`;

    if (route === "GET /health") {
      json(res, 200, { ok: true, at: new Date().toISOString() });
      return;
    }
    if (route === "GET /status") {
      json(res, 200, {
        photoshopAvailable: state.photoshopAvailable,
        photoshopVersion: state.photoshopVersion,
        busy: state.busy,
        activeJobId: state.activeJobId,
        at: new Date().toISOString(),
      });
      return;
    }
    if (route === "POST /open-folder") {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        try {
          const { path: folder } = JSON.parse(body || "{}");
          openFolder(folder ?? "", res);
        } catch {
          json(res, 400, { error: "invalid JSON body" });
        }
      });
      return;
    }
    json(res, 404, { error: "not found" });
  });

  const wss = new WebSocketServer({ noServer: true });
  server.on("upgrade", (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    if (url.pathname !== "/ws") {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => addSocket(ws));
  });

  return new Promise((resolve) => {
    server.listen(env.AGENT_HTTP_PORT, env.AGENT_HOST, () => {
      logger.info(`Local agent service listening on http://${env.AGENT_HOST}:${env.AGENT_HTTP_PORT}`);
      resolve(server);
    });
  });
}

function json(res: http.ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

const OPENABLE_ROOTS = ["outputs", "workspace", "photos"];

function openFolder(raw: string, res: http.ServerResponse): void {
  if (process.platform !== "win32") {
    json(res, 400, { error: "Folder opening works on the Windows agent machine." });
    return;
  }
  const kind = String(raw || "").toLowerCase();
  if (!OPENABLE_ROOTS.includes(kind)) {
    json(res, 403, {
      error: `Only '${OPENABLE_ROOTS.join("', '")}' folders may be opened (no arbitrary filesystem access).`,
    });
    return;
  }
  const baseDir = path.resolve(getAgentEnv().AGENT_WORKSPACE_PATH, "..");
  const target = path.join(baseDir, kind === "outputs" ? "outputs" : kind);
  // Explorer is the only process this service can launch.
  exec(`explorer.exe "${target}"`, () => {
    /* explorer returns non-zero even on success */
  });
  json(res, 200, { opened: target });
}

/** Push a progress/state event to every connected local browser. */
export function broadcastEvent(event: AgentSocketEvent): void {
  broadcast(JSON.stringify(event));
}

export { WebSocket };
