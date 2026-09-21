import { startLocalService } from "./local-service";
import { runAgentLoop, stopAgentLoop } from "./agent-loop";
import { runSelftest } from "./selftest";
import { loadAgentDotEnv } from "./config";
import { logger } from "./logger";
import { gracefulShutdown } from "./runner";

/**
 * Wedding Photoshop Agent — entrypoint.
 *
 *   npm run agent        start the agent (claims jobs, drives Photoshop 2022)
 *   npm run dev:agent    same, with hot reload
 *   npm run selftest     run the Photoshop pipeline self-test
 */
async function main(): Promise<void> {
  loadAgentDotEnv();

  if (process.argv.includes("--selftest")) {
    const ok = await runSelftest();
    process.exit(ok ? 0 : 1);
  }

  await startLocalService();
  logger.info("Wedding Photoshop Agent ready.");

  const loop = runAgentLoop();

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal} — shutting down`);
    stopAgentLoop();
    await gracefulShutdown();
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  await loop;
}

main().catch((err) => {
  logger.error("Fatal agent error:", err);
  process.exit(1);
});
