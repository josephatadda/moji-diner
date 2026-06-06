import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Lazy database client.
 *
 * Importing `db` never throws — the connection is constructed on first use.
 * This lets the mock-fallback data layer import services freely in preview
 * (no DATABASE_URL) and only touch `db` inside `hasDatabase()` branches.
 * Property access without a configured DATABASE_URL throws a clear error.
 */
type Db = ReturnType<typeof drizzle<typeof schema>>;

let instance: Db | null = null;

function getDb(): Db {
  if (instance) return instance;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set — db was accessed without a configured database.",
    );
  }
  instance = drizzle(neon(url), { schema });
  return instance;
}

export const db = new Proxy({} as Db, {
  get(_target, prop) {
    // biome-ignore lint/suspicious/noExplicitAny: proxy forwarding to the lazy client
    return (getDb() as any)[prop];
  },
}) as Db;

export { schema };
export type Database = Db;
