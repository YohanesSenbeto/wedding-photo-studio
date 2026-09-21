import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "packages/*/tests/**/*.test.ts",
      "apps/web/tests/**/*.test.ts",
      "apps/photoshop-agent/tests/**/*.test.ts",
    ],
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
  resolve: {
    alias: [
      { find: "@wedding/types", replacement: path.join(root, "packages/types/src/index.ts") },
      { find: "@wedding/validation", replacement: path.join(root, "packages/validation/src/index.ts") },
      { find: "@wedding/config/server", replacement: path.join(root, "packages/config/src/server/index.ts") },
      { find: "@wedding/config/agent", replacement: path.join(root, "packages/config/src/agent-env.ts") },
      { find: "@wedding/config", replacement: path.join(root, "packages/config/src/index.ts") },
      { find: /^@\/(.*)/, replacement: path.join(root, "apps/web/$1") },
    ],
  },
});

