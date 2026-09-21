import { z } from "zod";
import { ServerEnv } from "./index"; // already defined in packages/config/src/server/index.ts

// Zod schema that mirrors the Settings page rows
export const SettingsSchema = z.object({
  // Database
  DATABASE_URL: z.string(),
  // Agent token (only the existence matters for the UI)
  AGENT_TOKEN: z.string(),
  // Agent URL (browser)
  NEXT_PUBLIC_AGENT_URL: z.string(),
  // Storage paths
  PHOTO_STORAGE_PATH: z.string(),
  OUTPUT_PATH: z.string(),
  // Photoshop version (optional – defaults to 2022)
  PHOTOSHOP_VERSION: z.string().default("2022"),
});

export type SettingsEnv = z.infer<typeof SettingsSchema>;

export async function getSettingsEnv(): Promise<SettingsEnv> {
  try {
    // Wait for the server‑side env cache to be ready (the first call to getServerEnv() already validates).
    // We’ll just reuse the cached value.
    // A tiny timeout avoids a race where the cache isn’t set yet.
    await Promise.resolve();
    const full = getServerEnv();
    const settings = SettingsSchema.safeParse({
      DATABASE_URL: full.DATABASE_URL,
      AGENT_TOKEN: full.AGENT_TOKEN,
      NEXT_PUBLIC_AGENT_URL: full.NEXT_PUBLIC_AGENT_URL,
      PHOTO_STORAGE_PATH: full.PHOTO_STORAGE_PATH,
      OUTPUT_PATH: full.OUTPUT_PATH,
      PHOTOSHOP_VERSION: full.PHOTOSHOP_VERSION,
    });

    if (!settings.success) {
      const issues = settings.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("\n  ");
      throw new Error(`Invalid settings environment:\n  ${issues}`);
    }
    return settings.data;
  } catch (err) {
    // In dev mode we may hit a timing issue – retry once
    const retry = async () => {
      await new Promise((r) => setTimeout(r, 50));
      const full = getServerEnv();
      return SettingsSchema.safeParse({
        DATABASE_URL: full.DATABASE_URL,
        AGENT_TOKEN: full.AGENT_TOKEN,
        NEXT_PUBLIC_AGENT_URL: full.NEXT_PUBLIC_AGENT_URL,
        PHOTO_STORAGE_PATH: full.PHOTO_STORAGE_PATH,
        OUTPUT_PATH: full.OUTPUT_PATH,
        PHOTOSHOP_VERSION: full.PHOTOSHOP_VERSION,
      }).success;
    };

    if (await retry()) {
      // If the retry succeeded, re‑validate
      const full = getServerEnv();
      const settings = SettingsSchema.safeParse({
        DATABASE_URL: full.DATABASE_URL,
        AGENT_TOKEN: full.AGENT_TOKEN,
        NEXT_PUBLIC_AGENT_URL: full.NEXT_PUBLIC_AGENT_URL,
        PHOTO_STORAGE_PATH: full.PHOTO_STORAGE_PATH,
        OUTPUT_PATH: full.OUTPUT_PATH,
        PHOTOSHOP_VERSION: full.PHOTOSHOP_VERSION,
      });
      if (!settings.success) throw new Error(`Retry validation failed:\n  ${settings.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n  ")}`);
      return settings.data;
    }
    throw new Error(`Failed to read server settings: ${err}`);
  }
}