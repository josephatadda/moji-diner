import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";
import { env, requireEnv } from "@/lib/env";

/**
 * Better Auth — lazily constructed.
 *
 * The instance is built on first use (getAuth()), never at module import, so
 * that pages which only transitively import this module (via the service layer)
 * don't crash when auth env vars are absent — e.g. the public diner flow in
 * mock-fallback mode. Auth env is only required when auth is actually invoked.
 *
 * Social providers are optional: a provider is enabled only when BOTH of its
 * client id and secret are present. Configure just the provider(s) you use.
 */

function socialProviders() {
  const github =
    env("GITHUB_CLIENT_ID") && env("GITHUB_CLIENT_SECRET")
      ? {
          github: {
            clientId: requireEnv("GITHUB_CLIENT_ID"),
            clientSecret: requireEnv("GITHUB_CLIENT_SECRET"),
          },
        }
      : {};
  const google =
    env("GOOGLE_CLIENT_ID") && env("GOOGLE_CLIENT_SECRET")
      ? {
          google: {
            clientId: requireEnv("GOOGLE_CLIENT_ID"),
            clientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
          },
        }
      : {};
  return { ...github, ...google };
}

function createAuth() {
  return betterAuth({
    database: drizzleAdapter(db, { provider: "pg", schema }),
    secret: requireEnv("BETTER_AUTH_SECRET"),
    baseURL: env("BETTER_AUTH_URL"),
    socialProviders: socialProviders(),
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
  });
}

let cached: ReturnType<typeof createAuth> | null = null;

export function getAuth(): ReturnType<typeof createAuth> {
  cached ??= createAuth();
  return cached;
}

export type Auth = ReturnType<typeof createAuth>;
