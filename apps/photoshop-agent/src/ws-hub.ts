import type { WebSocket } from "ws";

const sockets = new Set<WebSocket>();

export function addSocket(ws: WebSocket): void {
  sockets.add(ws);
  ws.on("close", () => sockets.delete(ws));
  ws.on("error", () => sockets.delete(ws));
}

export function broadcast(message: string): void {
  for (const ws of sockets) {
    try {
      if (ws.readyState === ws.OPEN) ws.send(message);
    } catch {
      sockets.delete(ws);
    }
  }
}

export function socketCount(): number {
  return sockets.size;
}
