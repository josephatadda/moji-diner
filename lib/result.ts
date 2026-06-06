/**
 * Shared Result type for services and server actions.
 *
 * Errors returned to the client are always SAFE: a stable `code`, a
 * human-readable `message`, and optional per-field validation errors. Full
 * error detail (stack traces, DB errors) stays server-side and is never
 * included here.
 */

export type FieldErrors = Record<string, string[]>;

export type Ok<T> = { ok: true; data: T };
export type Err = {
  ok: false;
  code: ErrorCode;
  message: string;
  fieldErrors?: FieldErrors;
};
export type Result<T> = Ok<T> | Err;

export type ErrorCode =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation"
  | "conflict"
  | "rate_limited"
  | "unavailable"
  | "internal";

const SAFE_MESSAGES: Record<ErrorCode, string> = {
  unauthorized: "You need to sign in to do that.",
  forbidden: "You don't have access to this resource.",
  not_found: "Not found.",
  validation: "Please fix the highlighted fields.",
  conflict: "That conflicts with something that already exists.",
  rate_limited: "Too many requests. Please slow down and try again.",
  unavailable: "This isn't available right now.",
  internal: "Something went wrong. Please try again.",
};

export function ok<T>(data: T): Ok<T> {
  return { ok: true, data };
}

export function err(
  code: ErrorCode,
  message?: string,
  fieldErrors?: FieldErrors,
): Err {
  return {
    ok: false,
    code,
    message: message ?? SAFE_MESSAGES[code],
    ...(fieldErrors ? { fieldErrors } : {}),
  };
}

/**
 * Wrap an unknown thrown error into a safe Err. Logs the real error
 * server-side (without leaking it to the client). Maps the sentinel
 * "UNAUTHORIZED" thrown by requireUser() to the unauthorized code.
 */
export function fail(error: unknown, context: string): Err {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return err("unauthorized");
  }
  // Server-side log only — never returned to the client.
  console.error(`[${context}]`, error);
  return err("internal");
}
