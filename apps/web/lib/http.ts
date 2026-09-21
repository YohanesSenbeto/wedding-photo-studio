import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data as object, { status });
}

export function jsonError(code: string, message: string, status = 400, details?: unknown): NextResponse {
  return NextResponse.json({ error: message, code, details }, { status });
}

/** Human-readable mapping of unexpected errors in API routes. */
export function internalError(err: unknown): NextResponse {
  const message = err instanceof Error ? err.message : "Unexpected server error";
  console.error("[api] internal error:", err);
  return jsonError("INTERNAL_ERROR", message, 500);
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw Object.assign(new Error("Request body must be valid JSON"), {
      statusCode: 400,
      code: "INVALID_JSON",
    });
  }
}

/** Thrown by helpers/routes to produce clean client errors. */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  constructor(code: string, message: string, statusCode = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function toErrorResponse(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return jsonError(err.code, err.message, err.statusCode);
  }
  if (err instanceof Error && "statusCode" in err && "code" in err) {
    const e = err as Error & { statusCode: number; code: string };
    return jsonError(e.code, e.message, e.statusCode);
  }
  return internalError(err);
}
