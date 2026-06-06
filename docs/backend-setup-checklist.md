# Backend Setup Checklist (what you provide)

Everything goes into `.env.local` (copy from `.env.example`). Until `DATABASE_URL`
is set, the app keeps running on mock data — so nothing here blocks the frontend.

## ✅ Required to turn on real data (B0–B1)

- [ ] **Neon Postgres database** → `DATABASE_URL`
  - Sign up at neon.tech → create a project → copy the **pooled** connection string.
  - This is the only thing needed to flip from mock data to real data.
  - After you paste it: I run `npm run db:migrate` then `npm run seed:restaurant`.

- [ ] **Better Auth secret** → `BETTER_AUTH_SECRET`
  - No account needed — generate locally: `openssl rand -base64 32`
- [ ] **App URL** → `BETTER_AUTH_URL`
  - `http://localhost:3000` for local dev (your deployed URL in production).

- [ ] **One OAuth provider for owner login** (GitHub is easiest) → `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
  - GitHub → Settings → Developer settings → OAuth Apps → New OAuth App.
  - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
  - (Google optional: `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, callback `.../callback/google`.)
  - Note: I can make providers optional in code so you only configure the one(s) you want — say the word.

## 🟡 Needed soon, per phase (not blocking yet)

- [ ] **Image hosting for menu photos** (B1 menu, when real uploads are built)
  - Easiest: **Vercel Blob** (same Vercel account, one token) or **Cloudinary** (free tier).
  - Until then menu items render the icon fallback (current behavior).

## ⏳ Later / optional (deferred phases)

- [ ] **WhatsApp receipts** (after payments) — Termii (Nigerian, NGN billing) → `TERMII_API_KEY`, `TERMII_SENDER_ID`. Deferred; payments are self-reported.
- [ ] **Hosting** — Vercel (import the GitHub repo, add the same env vars). Only for deploy, not local dev.
- [ ] **Upstash Redis** — only if/when the app runs on multiple instances (swaps the in-memory rate limiter). Not needed now.

## What I do with each

| You provide | I do |
|---|---|
| `DATABASE_URL` | run migrate + seed; flip services to DB; verify DB-mode == the seeded prototype |
| `BETTER_AUTH_SECRET` + `BETTER_AUTH_URL` + OAuth creds | wire owner login → dashboard auth gating + ownership checks |
| Image token (later) | wire menu photo upload |

## Not needed (decided)
- ❌ Payment gateway / Paystack — payments are self-reported.
- ❌ Staff PIN system — staff are records; access reuses Better Auth later.
- ❌ Separate realtime service — order status via polling/server actions for now.
