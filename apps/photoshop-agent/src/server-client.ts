import { getAgentEnv } from "@wedding/config/agent";

/**
 * HTTP client for the Next.js server. All requests carry the shared agent
 * token as a Bearer credential. Retries transient failures with backoff.
 */

const env = () => getAgentEnv();

export class ServerApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function serverFetch(
  path: string,
  init: RequestInit & { rawBody?: string } = {},
  retries = 2
): Promise<Response> {
  const url = new URL(path, env().SERVER_URL).toString();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${env().AGENT_TOKEN}`,
    ...((init.headers as Record<string, string>) ?? {}),
  };
  if (init.rawBody) headers["Content-Type"] = "application/json";

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { ...init, headers, body: init.rawBody ?? init.body });
      if (res.status >= 500 && attempt < retries) {
        await sleep(400 * (attempt + 1));
        continue;
      }
      return res;
    } catch (err) {
      lastError = err;
      if (attempt < retries) await sleep(400 * (attempt + 1));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Network failure");
}

export async function registerAgent(body: {
  name: string;
  machineName: string;
  platform: string;
  appVersion: string;
  photoshopVersion: string | null;
  photoshopAvailable: boolean;
  photoshopMode: "COM" | "DRYRUN";
}): Promise<unknown> {
  const res = await serverFetch("/api/agent/register", {
    method: "POST",
    rawBody: JSON.stringify(body),
  });
  if (!res.ok) throw new ServerApiError(res.status, await res.text().catch(() => "register failed"));
  return res.json();
}

export async function sendHeartbeat(body: {
  status: "ONLINE" | "BUSY";
  activeJobId: string | null;
  photoshopAvailable: boolean;
  photoshopVersion: string | null;
  diskFreeBytes?: number;
}): Promise<void> {
  const res = await serverFetch("/api/agent/heartbeat", {
    method: "POST",
    rawBody: JSON.stringify(body),
  });
  if (!res.ok && res.status !== 409) {
    throw new ServerApiError(res.status, await res.text().catch(() => "heartbeat failed"));
  }
}

export async function claimJobs(maxJobs = 1): Promise<unknown[]> {
  const res = await serverFetch("/api/agent/claim", {
    method: "POST",
    rawBody: JSON.stringify({ maxJobs }),
  });
  if (res.status === 401 || res.status === 403) {
    throw new ServerApiError(res.status, "Agent token rejected by server");
  }
  if (!res.ok) throw new ServerApiError(res.status, await res.text().catch(() => "claim failed"));
  const data = (await res.json()) as { jobs: unknown[] };
  return data.jobs ?? [];
}

export function resolveServerUrl(path: string): string {
  return new URL(path, env().SERVER_URL).toString();
}
