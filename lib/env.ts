import "server-only";

/**
 * Server-only environment access. Never import this from a client component.
 * Centralizes env reads so secrets never leak to the client bundle and so the
 * data layer can feature-flag on database availability.
 */

/** True when a database is configured. Enables the DB data path; otherwise
 *  services fall back to mock data so the preview keeps working. */
export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Read an optional env var. */
export function env(name: string): string | undefined {
  return process.env[name];
}

/** Read a required env var or throw (server startup / action time only). */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}
