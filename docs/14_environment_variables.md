# 14 — Environment Variables

**Reference document** — Configure before running any module.

---

> Copy this into `.env.local` in the project root. Never commit this file to git. Add `.env.local` to `.gitignore` immediately.

---

## Full `.env.local`

```bash
# ─────────────────────────────────────────────────────────
# SUPABASE
# ─────────────────────────────────────────────────────────

# From: Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

# Service role key — NEVER expose to client (server-side only)
# Used for: webhook handlers, internal loyalty/payment processing
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...


# ─────────────────────────────────────────────────────────
# PAYSTACK
# ─────────────────────────────────────────────────────────

# From: Paystack Dashboard → Settings → API Keys & Webhooks
# Use test keys (pk_test_... / sk_test_...) during development
# Switch to live keys (pk_live_... / sk_live_...) for production

NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Paystack webhook secret — same as secret key for HMAC verification
# Note: Paystack uses your secret key as the HMAC secret


# ─────────────────────────────────────────────────────────
# TWILIO (WhatsApp Receipts)
# ─────────────────────────────────────────────────────────

# From: Twilio Console → Account Info
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# WhatsApp sender number
# Development: use Twilio Sandbox number
# Production: use approved Twilio Business number
TWILIO_WHATSAPP_FROM=+14155238886


# ─────────────────────────────────────────────────────────
# APP CONFIG
# ─────────────────────────────────────────────────────────

NEXT_PUBLIC_APP_URL=https://scanserve.ng
# Development: http://localhost:3000

NEXT_PUBLIC_APP_NAME=ScanServe


# ─────────────────────────────────────────────────────────
# ENCRYPTION
# ─────────────────────────────────────────────────────────

# Used to encrypt restaurant Paystack secret keys before storing in DB
# Generate with: openssl rand -hex 32
ENCRYPTION_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


# ─────────────────────────────────────────────────────────
# ADMIN
# ─────────────────────────────────────────────────────────

# Email address(es) that should have admin access
# Grant in Supabase SQL editor — see 12_admin_panel.md
ADMIN_EMAIL=admin@scanserve.ng
```

---

## Variable Reference

| Variable | Used In | Required | Description |
|----------|---------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | ✅ | Public anon key for RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | ✅ | Bypasses RLS for webhooks + internal jobs |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Client only | ✅ | Opens Paystack modal |
| `PAYSTACK_SECRET_KEY` | Server only | ✅ | Webhook verification + API calls |
| `TWILIO_ACCOUNT_SID` | Server only | ✅ | Twilio auth |
| `TWILIO_AUTH_TOKEN` | Server only | ✅ | Twilio auth |
| `TWILIO_WHATSAPP_FROM` | Server only | ✅ | WhatsApp sender number |
| `NEXT_PUBLIC_APP_URL` | Client + Server | ✅ | Used in QR code URLs |
| `NEXT_PUBLIC_APP_NAME` | Client | ⚠️ Optional | Display name |
| `ENCRYPTION_KEY` | Server only | ✅ | AES-256 key for Paystack secret storage |
| `ADMIN_EMAIL` | Reference only | ⚠️ Optional | For documentation / setup reference |

---

## Security Notes

```
NEVER do this:
  ❌ Commit .env.local to git
  ❌ Use NEXT_PUBLIC_ prefix for secret keys
  ❌ Return PAYSTACK_SECRET_KEY in any API response
  ❌ Log environment variables in console
  ❌ Share .env.local in Slack/email

ALWAYS do this:
  ✅ Add .env.local to .gitignore before first commit
  ✅ Use server-only imports for sensitive env vars
  ✅ Use Vercel Environment Variables panel for production secrets
  ✅ Rotate keys if accidentally exposed
  ✅ Use different Paystack keys for dev (test) and production (live)
```

## Vercel Deployment

```
For production deployment on Vercel:
  1. Go to: Vercel Dashboard → Project → Settings → Environment Variables
  2. Add each variable with correct environment scope:
     - NEXT_PUBLIC_* vars: All Environments
     - Secret vars: Production only (or Production + Preview)
  3. Never use "Add from .env" bulk import for secret keys

Recommended Vercel setup:
  Production:  scanserve.ng         → live Paystack keys
  Preview:     *.vercel.app         → test Paystack keys
  Development: localhost:3000        → test Paystack keys (from .env.local)
```

---

*See also: `13_api_reference.md`*
