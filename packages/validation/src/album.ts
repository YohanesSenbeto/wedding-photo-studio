import { z } from "zod";
import { COLOR_MODES, OUTPUT_FORMATS, OUTPUT_QUALITIES } from "@wedding/types";

/** POST /api/album/create */
export const CreateAlbumSchema = z
  .object({
    groomName: z.string().trim().min(1, "Groom name is required").max(80),
    brideName: z.string().trim().min(1, "Bride name is required").max(80),
    /** ISO date or a display string such as "03 MAY 2026". */
    weddingDate: z.string().trim().min(1, "Wedding date is required").max(40),
    location: z.string().trim().min(1, "Wedding location is required").max(120),
    caption: z.string().trim().max(200).optional(),
    /**
     * Template keys to include, e.g. ["01_Cover","05_Ceremony"].
     * Defaults to the standard 12-page wedding set.
     */
    templateKeys: z.array(z.string().min(1).max(80)).max(24).optional(),
  })
  .strict();

export type CreateAlbumInput = z.infer<typeof CreateAlbumSchema>;

export const GenerateAlbumSchema = z
  .object({
    /**
     * Optional explicit assignment: templateKey → photo ids in slot order.
     * When omitted, the server auto-assigns photos based on orientation.
     */
    assignments: z
      .record(z.string().max(80), z.array(z.string().min(1).max(64)).max(6))
      .optional(),
    outputFormats: z.array(z.enum(OUTPUT_FORMATS)).min(1).default(["JPG"]),
    quality: z.enum(OUTPUT_QUALITIES).default("PRINT"),
    dpi: z.coerce.number().int().refine((v) => [150, 300].includes(v), {
      message: "Album dpi must be 150 or 300",
    }).default(300),
    colorMode: z.enum(COLOR_MODES).default("RGB"),
  })
  .strict();

export type GenerateAlbumInput = z.infer<typeof GenerateAlbumSchema>;
