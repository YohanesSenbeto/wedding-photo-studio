/**
 * Seeds the 8 built-in editing presets.
 * Run with: npm run db:seed   (or automatically via `prisma migrate reset`)
 */
import { PrismaClient } from "@prisma/client";
import { PRESETS } from "@wedding/config";

const prisma = new PrismaClient();

async function main() {
  for (const preset of PRESETS) {
    await prisma.editingPreset.upsert({
      where: { key: preset.key },
      create: {
        key: preset.key,
        name: preset.name,
        description: preset.description,
        params: preset.params,
        isBuiltIn: true,
      },
      update: {
        name: preset.name,
        description: preset.description,
        params: preset.params,
        isBuiltIn: true,
      },
    });
    console.log(`seeded preset ${preset.key}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
