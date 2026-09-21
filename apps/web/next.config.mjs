import path from "node:path";
import { fileURLToPath } from "node:url";
// `@next/env` is CommonJS — import the default and destructure it.
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

// This app lives in a monorepo whose single `.env` sits at the repository root
// (the same file Prisma reads). Next.js only auto-loads env files from the app
// directory, so load the root file here before the config is evaluated.
const appDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(appDir, "../..");
loadEnvConfig(repoRoot, process.env.NODE_ENV !== "production");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Monorepo root — pin it explicitly so Next.js traces files from here instead
  // of guessing (and warning) based on whichever lockfile it finds first.
  outputFileTracingRoot: repoRoot,
  // Workspace packages are TypeScript source — let Next compile them.
  transpilePackages: ["@wedding/types", "@wedding/validation", "@wedding/config"],
  // Prisma client is a native/Node-only dependency.
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
