/**
 * The one place unexpected errors go. It writes a structured log line with
 * personal data and secrets removed. A project that uses an error tracker
 * registers it with `setErrorReporter`; see docs/architecture.md.
 */

export interface ErrorContext {
  /** Where the error was caught, for example "request" or "contact-form". */
  source: string;
  [key: string]: unknown;
}

export type ErrorReporter = (
  error: unknown,
  context: ErrorContext,
) => void | Promise<void>;

let reporter: ErrorReporter | undefined;

/** Registers an error tracker. Call it once, from `register()` in instrumentation.ts. */
export function setErrorReporter(next: ErrorReporter | undefined): void {
  reporter = next;
}

const SECRET_KEY = /pass(word)?|secret|token|authorization|cookie|api[-_]?key|session/i;
const EMAIL = /[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+/g;
const REDACTED = "[redacted]";
const MAX_DEPTH = 4;
const MAX_STRING_LENGTH = 2000;

/** Removes e-mail addresses from text and cuts very long values. */
export function scrubText(text: string): string {
  const clean = text.replaceAll(EMAIL, REDACTED);
  return clean.length > MAX_STRING_LENGTH
    ? `${clean.slice(0, MAX_STRING_LENGTH)}…`
    : clean;
}

/** Copies a value for logging: secrets by key name and e-mail addresses are replaced. */
export function scrub(value: unknown, depth = 0): unknown {
  if (typeof value === "string") return scrubText(value);
  if (typeof value !== "object" || value === null) return value;
  if (depth >= MAX_DEPTH) return "[truncated]";
  if (Array.isArray(value)) return value.map((item) => scrub(item, depth + 1));

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SECRET_KEY.test(key) ? REDACTED : scrub(item, depth + 1),
    ]),
  );
}

function describe(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    const digest: unknown = "digest" in error ? error.digest : undefined;
    return {
      name: error.name,
      message: scrubText(error.message),
      stack: error.stack ? scrubText(error.stack) : undefined,
      digest: typeof digest === "string" ? digest : undefined,
    };
  }
  return { message: scrubText(String(error)) };
}

/** The log entry for an error: what `captureError` writes. Exported for tests. */
export function toLogEntry(
  error: unknown,
  context: ErrorContext,
): Record<string, unknown> {
  return {
    level: "error",
    time: new Date().toISOString(),
    error: describe(error),
    context: scrub(context),
  };
}

/**
 * Records an unexpected error. Use it for failures the code cannot handle;
 * expected failures are `Result` values and are handled where they occur.
 * It never throws: a broken reporter must not break the request.
 */
export async function captureError(
  error: unknown,
  context: ErrorContext,
): Promise<void> {
  console.error(JSON.stringify(toLogEntry(error, context)));

  if (!reporter) return;
  try {
    await reporter(error, context);
  } catch (reporterError) {
    console.error(
      JSON.stringify(toLogEntry(reporterError, { source: "error-reporter" })),
    );
  }
}
