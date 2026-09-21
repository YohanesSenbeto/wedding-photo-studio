import { z } from "zod";

/** Output request / metadata validation. */
export const OutputRequestSchema = z
  .object({
    format: z.enum(["JPG", "TIFF", "PSD"]).optional(),
    quality: z.enum(["WEB", "HIGH", "PRINT"]).default("HIGH"),
    dpi: z.coerce.number().int().refine((v) => [72, 150, 300].includes(v), {
      message: "dpi must be 72, 150 or 300",
    }).default(300),
    /** CMYK is applied only on final print exports. */
    colorMode: z.enum(["RGB", "CMYK"]).default("RGB"),
  })
  .strict();

export type OutputRequest = z.infer<typeof OutputRequestSchema>;

export const OutputIdParamSchema = z.object({ id: z.string().min(1).max(64) });
