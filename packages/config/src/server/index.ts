import { z } from "zod";
import { DEFAULT_UPLOAD_LIMITS, type UploadLimits } from "@wedding/validation";

/**
 * Server-side environment (Next.js API routes, prisma/seed).
 * Next.js loads `.env` automatically; this schema validates it.
 */
const ServerEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .url({ message: "DATABASE_URL must be a valid PostgreSQL connection string" })
    .refine((u) => u.startsWith("postgresql://") || u.startsWith("postgres://"), {
      message: "DATABASE_URL must start with postgresql://",
    }),
  /** Shared secret used to authenticate the local Photoshop agent. */
  AGENT_TOKEN: z.string().min(16, "AGENT_TOKEN must be at least 16 characters"),
  /** URL the BROWSER uses to reach the LOCAL agent service. */
  NEXT_PUBLIC_AGENT_URL: z.string().url().default("http://127.0.0.1:47821"),
  PHOTO_STORAGE_PATH: z.string().min(1).default("./storage/photos"),
  OUTPUT_PATH: z.string().min(1).default("./storage/outputs"),
  PHOTOSHOP_VERSION: z.string().default("2022"),
  PHOTOSHOP_PATH: z.string().optional(),
  MAX_JPG_UPLOAD_MB: z.coerce.number().positive().default(40),
  MAX_ARW_UPLOAD_MB: z.coerce.number().positive().default(200),
  /** Environment, "development" | "production" (set by Next.js). */
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

let cached: ServerEnv | null = null;

/** Parse + cache the server environment. Throws a descriptive error on bad input. */
export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = ServerEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("\n  ");
    throw new Error(`Invalid server environment variables:\n  ${issues}\nSee .env.example`);
  }
  cached = parsed.data;
  return cached;
}

export function getUploadLimits(): UploadLimits {
  const env = getServerEnv();
  return {
    maxJpgBytes: Math.round(env.MAX_JPG_UPLOAD_MB * 1024 * 1024),
    maxArwBytes: Math.round(env.MAX_ARW_UPLOAD_MB * 1024 * 1024),
  };
}

export function getSettingsEnv(): ServerEnv {
  // Shallow copy, then remove private fields that aren't needed for the Settings page
  const env = { ...getServerEnv() };
  const { AGENT_TOKEN, AGENT_WORKSPACE_PATH } = env;
  delete env.AGENT_TOKEN;
  delete env.AGENT_WORKSPACE_PATH;
  return env;
}

/** Only used by unit tests. */
export function __resetServerEnvCache(): void {
  cached = null;
}

export const DEFAULT_LIMITS = DEFAULT_UPLOAD_LIMITS;
