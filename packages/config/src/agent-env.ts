import { z } from "zod";

/**
 * Local Photoshop agent environment.
 * The agent loads its own `.env` from apps/photoshop-agent/.env
 * (see apps/photoshop-agent/src/config.ts which adds dotenv-style loading).
 */
const AgentEnvSchema = z.object({
  /** URL of the Next.js server the agent reports to. */
  SERVER_URL: z.string().url(),
  /** Shared agent token — must match the server's AGENT_TOKEN. */
  AGENT_TOKEN: z.string().min(16, "AGENT_TOKEN must be at least 16 characters"),
  AGENT_HTTP_PORT: z.coerce.number().int().min(1024).max(65535).default(47821),
  AGENT_HOST: z.string().default("127.0.0.1"),
  AGENT_WORKSPACE_PATH: z.string().min(1).default("./workspace"),
  /** AUTO = real Photoshop via COM on Windows. DRYRUN = clearly-labelled pipeline test (NO Photoshop). */
  AGENT_PHOTOSHOP_MODE: z.enum(["AUTO", "COM", "DRYRUN"]).default("AUTO"),
  JOB_POLL_INTERVAL_MS: z.coerce.number().int().min(500).max(120000).default(2500),
  PHOTOSHOP_VERSION: z.string().default("2022"),
  PHOTOSHOP_PATH: z.string().optional(),
  /** Max seconds a single Photoshop job may run before it is failed. */
  JOB_TIMEOUT_SECONDS: z.coerce.number().int().min(60).max(7200).default(1200),
  /** Minimal free workspace disk space before accepting jobs. */
  MIN_FREE_DISK_MB: z.coerce.number().int().default(2048),
});

export type AgentEnv = z.infer<typeof AgentEnvSchema>;

let cached: AgentEnv | null = null;

export function getAgentEnv(): AgentEnv {
  if (cached) return cached;
  const parsed = AgentEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("\n  ");
    throw new Error(`Invalid agent environment variables:\n  ${issues}\nSee .env.example`);
  }
  cached = parsed.data;
  return cached;
}

export function __resetAgentEnvCache(): void {
  cached = null;
}
