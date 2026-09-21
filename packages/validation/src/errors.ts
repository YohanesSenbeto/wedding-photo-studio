import { z } from "zod";

/** Standard envelope for API errors. */
export const ApiErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
  details: z.unknown().optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

export class ValidationError extends Error {
  readonly issues: z.ZodIssue[];
  readonly code = "VALIDATION_ERROR";

  constructor(issues: z.ZodIssue[]) {
    super(issues.map((i) => `${i.path.join(".") || "input"}: ${i.message}`).join("; "));
    this.name = "ValidationError";
    this.issues = issues;
  }
}

/** Parse or throw a ValidationError (for API routes). */
export function parseOrThrow<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(result.error.issues);
  }
  return result.data;
}

/** Convenience: safeParse that returns { data } | { error } without throwing. */
export function tryParse<T extends z.ZodTypeAny>(
  schema: T,
  input: unknown
): { data: z.infer<T>; ok: true; error?: never } | { ok: false; data?: never; error: z.ZodIssue[] } {
  const result = schema.safeParse(input);
  return result.success
    ? { data: result.data, ok: true }
    : { ok: false, error: result.error.issues };
}
