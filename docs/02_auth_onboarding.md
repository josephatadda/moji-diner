# 02 — Authentication & Restaurant Onboarding

**Module:** 1 | **Depends on:** `01_data_models.md`  
**Responsive:** See `00b_responsive_design_spec.md` — Auth pages use the centered card pattern. Onboarding wizard is single-column on mobile, 440px centered card on desktop.

---

## Table of Contents

1. [User Flows](#1-user-flows)
2. [File Structure](#2-file-structure)
3. [API Routes](#3-api-routes)
4. [Component Specs](#4-component-specs)
5. [Acceptance Criteria](#5-acceptance-criteria)

---

## 1. User Flows

### 1.1 Owner Signup

```
[Owner visits scanserve.ng/signup]
        │
        ▼
[Enter email + password]
  Validation: valid email, password min 8 chars
        │
        ▼
[Supabase createUser called]
        │
        ├─ Success → [Supabase sends verification email]
        │              [Show: "Check your email to verify your account"]
        │
        └─ Error (email exists) → ["An account with this email already exists"]
        │
        ▼
[Owner clicks link in email]
        │
        ▼
[Redirected to /onboarding/step-1]
```

### 1.2 Owner Login

```
[Owner visits scanserve.ng/login]
        │
        ▼
[Enter email + password]
        │
        ├─ Success → [Check: has restaurant record?]
        │               ├─ YES → [Redirect to /dashboard]
        │               └─ NO  → [Redirect to /onboarding/step-1]
        │
        └─ Error → ["Incorrect email or password"]
```

### 1.3 Onboarding Wizard

```
[/onboarding/step-1 — Restaurant Details]
  Fields:
    - Restaurant name (required)
      → Auto-generates slug preview: "mama-put-uyo"
      → Checks slug uniqueness on blur
    - City (required, default: Uyo)
    - Phone number (required, Nigerian format: +234XXXXXXXXXX)
    - Instagram handle (optional, strip @ on input)
    - Logo upload (optional, < 2MB, JPEG/PNG)
  [Next →]
        │
        ▼
[/onboarding/step-2 — Payment Setup]
  Fields:
    - Paystack Public Key (pk_live_... or pk_test_...)
    - Paystack Secret Key (sk_live_... or sk_test_...)
  Actions:
    - [Test Connection] button
      → Calls POST /api/onboarding/test-paystack
      → Success: green checkmark + "Keys verified ✓"
      → Failure: red warning + "Could not verify keys. Check and try again."
  Note shown: "Your secret key is encrypted and never shown again."
  [Next →]  (disabled until connection verified)
        │
        ▼
[/onboarding/step-3 — Set Up Tables]
  Fields:
    - "How many tables does your restaurant have?" [1–50 stepper]
  Preview:
    - Shows QR code preview for Table 1
    - "You can rename tables and add more later"
  [Complete Setup →]
        │
        ▼
[POST /api/onboarding/complete]
  Creates:
    - restaurants record
    - restaurant_settings record (with Paystack keys)
    - restaurant_tables records (table_number 1..N)
        │
        ▼
[Redirect to /dashboard]
[Success toast: "You're live! Download your QR codes to get started."]
```

### 1.4 Staff PIN Login

```
[Staff visits /staff-login]
        │
        ▼
[Enter restaurant slug]
  → On blur: validate slug exists
  → Show restaurant name as confirmation
        │
        ▼
[Enter 4-digit PIN]
  → Numeric keyboard auto-shown on mobile
        │
        ▼
[POST /api/auth/staff-login]
        │
        ├─ Valid → [Set staff session cookie]
        │          [Redirect to /dashboard/orders]
        │
        └─ Invalid → ["Incorrect PIN. Try again."]
                     [After 5 attempts: "Too many attempts. Ask your manager to reset your PIN."]
```

### 1.5 Password Reset

```
[Owner clicks "Forgot password" on login page]
        │
        ▼
[Enter email]
        │
        ▼
[Supabase resetPasswordForEmail called]
[Show: "Reset link sent. Check your email."]
        │
        ▼
[Owner clicks link → /reset-password?token=...]
        │
        ▼
[Enter new password + confirm]
[Supabase updateUser called]
[Redirect to /dashboard]
```

---

## 2. File Structure

```
app/
├── (auth)/
│   ├── layout.tsx
│   │   // Mobile:   Full-width card, px-4, no outer padding
│   │   // Desktop:  max-w-[440px] mx-auto, centered vertically, 
│   │   //           subtle background behind card
│   ├── signup/
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── verify-email/
│   │   └── page.tsx            ← "Check your email" holding page
│   ├── reset-password/
│   │   └── page.tsx
│   └── staff-login/
│       └── page.tsx
│
├── onboarding/
│   ├── layout.tsx              ← progress bar + step indicator
│   ├── page.tsx                ← redirect to step-1 if not complete
│   ├── step-1/
│   │   └── page.tsx
│   ├── step-2/
│   │   └── page.tsx
│   └── step-3/
│       └── page.tsx
│
├── api/
│   ├── auth/
│   │   └── staff-login/
│   │       └── route.ts
│   └── onboarding/
│       ├── test-paystack/
│       │   └── route.ts
│       └── complete/
│           └── route.ts
│
└── middleware.ts               ← protects /dashboard and /admin routes
```

---

## 3. API Routes

### POST `/api/auth/staff-login`

```typescript
// Request
{
  slug: string,   // restaurant slug
  pin: string     // 4-digit PIN
}

// Response (success)
{
  data: {
    staff_id: string,
    name: string,
    role: "manager" | "staff" | "kitchen",
    restaurant_id: string,
    restaurant_name: string
  }
}

// Response (error)
{ error: "Invalid PIN", code: "INVALID_PIN" }
{ error: "Restaurant not found", code: "NOT_FOUND" }
{ error: "Too many attempts", code: "RATE_LIMITED" }

// Logic
// 1. Look up restaurant by slug
// 2. Find staff_accounts record matching restaurant_id + pin
// 3. If found: create signed JWT with staff context, set httpOnly cookie
// 4. Track failed attempts in Redis or in-memory (5 attempts = 15min lockout)
```

### POST `/api/onboarding/test-paystack`

```typescript
// Request
{
  public_key: string,
  secret_key: string
}

// Response (success)
{
  data: { verified: true, business_name: string }
}

// Response (error)
{ error: "Invalid Paystack keys", code: "INVALID_KEYS" }

// Logic
// Call Paystack GET /bank (lightweight endpoint) with secret key
// Verify 200 response + business matches
```

### POST `/api/onboarding/complete`

```typescript
// Request (authenticated — owner JWT required)
{
  name: string,
  slug: string,
  city: string,
  phone: string,
  instagram_handle?: string,
  logo_url?: string,
  table_count: number,        // 1–50
  paystack_public_key: string,
  paystack_secret_key: string // will be encrypted before storage
}

// Response
{
  data: {
    restaurant_id: string,
    slug: string,
    redirect_to: "/dashboard"
  }
}

// Logic
// 1. Verify slug uniqueness
// 2. Encrypt paystack_secret_key with AES-256 (use env ENCRYPTION_KEY)
// 3. INSERT into restaurants
// 4. INSERT into restaurant_settings (with encrypted key)
// 5. INSERT into restaurant_tables (table_number 1..table_count)
// 6. Return restaurant_id + slug
```

---

## 4. Component Specs

### `<SlugInput />`

```typescript
// Props: value, onChange, onValidate
// Behavior:
//   - Convert input to lowercase, replace spaces with hyphens
//   - Debounce uniqueness check 500ms after typing stops
//   - Show: checking... / ✓ Available / ✗ Taken
// Example: "Mama Put Uyo" → "mama-put-uyo"

const toSlug = (name: string): string =>
  name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
```

### `<PhoneInput />`

```typescript
// Nigerian phone number input
// Formats: +234XXXXXXXXXX or 0XXXXXXXXXX (converted to +234 on submit)
// Validation: must be 11 digits (local) or 13 chars with +234

const normalizeNigerianPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('234')) return `+${digits}`
  if (digits.startsWith('0')) return `+234${digits.slice(1)}`
  return `+234${digits}`
}
```

### `<OnboardingProgressBar />`

```typescript
// Shows: Step 1 of 3 with filled circles
// Persists progress in sessionStorage
// If owner navigates away mid-onboarding, returns to last step
```

### `<PINInput />`

```typescript
// 4 separate single-digit inputs
// Auto-advance focus on digit entry
// Auto-submit on 4th digit entered
// Show/hide toggle for accessibility
// Numeric input type for mobile keyboard
```

### Route Protection (`middleware.ts`)

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Protected routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Check admin role in DB
    if (!session || !isAdmin(session.user.id)) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/onboarding/:path*']
}
```

---

## 5. Acceptance Criteria

- [ ] Signup → email verification → onboarding completes in under 10 minutes
- [ ] Slug auto-generated from restaurant name (lowercase, hyphens, unique)
- [ ] Slug uniqueness checked live with debounce on input
- [ ] Paystack test connection verifies both keys before allowing progression to step 3
- [ ] Secret key never returned to client after initial save
- [ ] Tables auto-created with sequential numbers 1..N on setup completion
- [ ] Staff PIN login works without email/password (4-digit numeric only)
- [ ] Staff login rate-limited: 5 failed attempts = 15 minute lockout
- [ ] Owner redirected to dashboard with empty-state onboarding prompts on first login
- [ ] If owner navigates away mid-onboarding, progress is preserved on return
- [ ] `/dashboard` inaccessible without valid session (middleware redirect)
- [ ] Phone number normalized to `+234XXXXXXXXXX` format on submission

---

*Next: `03_menu_management.md`*
