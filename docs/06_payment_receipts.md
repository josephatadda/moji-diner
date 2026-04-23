# 06 — Payment & Receipts

**Module:** 5 | **Depends on:** `05_diner_ordering_flow.md`, `09_loyalty_system.md`  
**Responsive:** See `00b_responsive_design_spec.md` — Bill and payment screens are diner-facing, so they render inside the 480px shell on desktop. Paystack's own modal handles its internal layout. The bill screen must be comfortable to read on a small phone — no tiny text on amounts.

---

## Table of Contents

1. [User Flow](#1-user-flow)
2. [Paystack Integration](#2-paystack-integration)
3. [Webhook Handler](#3-webhook-handler)
4. [WhatsApp Receipt](#4-whatsapp-receipt)
5. [File Structure](#5-file-structure)
6. [API Routes](#6-api-routes)
7. [Acceptance Criteria](#7-acceptance-criteria)

---

## 1. User Flow

### 1.1 Bill Screen

```
[Diner taps "Get Bill" — only available when order status = 'served']
        │
        ▼
[BILL SCREEN]
  ┌─────────────────────────────────────────┐
  │  Your Bill · Table 5                    │
  │  Mama Put Uyo                           │
  │  ─────────────────────────────────────  │
  │  Jollof Rice (Hot)          ₦2,500      │
  │  Spring Rolls               ₦1,800      │
  │  Extra Sauce                  ₦300      │
  │  ─────────────────────────────────────  │
  │  Subtotal                   ₦4,600      │
  │  VAT (7.5%)                   ₦345      │  ← only if vat_enabled
  │  ─────────────────────────────────────  │
  │  Tip                                    │
  │  [0%] [5%] [10%] [Custom]              │
  │  ─────────────────────────────────────  │
  │  Total                      ₦4,945      │  ← updates as tip changes
  │                                         │
  │  [Split Bill]                           │
  │                                         │
  │  [Pay Now — ₦4,945]                    │  ← primary CTA
  └─────────────────────────────────────────┘
```

### 1.2 Payment Flow

```
[Diner taps "Pay Now — ₦4,945"]
        │
        ▼
[POST /api/payments/initialize]
  → Creates payments record with status 'pending'
  → Returns Paystack reference
        │
        ▼
[Paystack inline modal opens over bill screen]
  ┌─────────────────────────────────────────┐
  │  Pay ₦4,945                             │
  │  Mama Put Uyo                           │
  │                                         │
  │  [💳 Card]  [🏦 Bank Transfer]  [📱 USSD]│
  │                                         │
  │  [selected channel form]                │
  │                                         │
  │  [Pay ₦4,945]                          │
  └─────────────────────────────────────────┘
        │
        ├─ PAYMENT SUCCESS (Paystack callback fires)
        │     → Don't trust callback alone — wait for webhook verification
        │     → Show loading: "Confirming payment..."
        │     → GET /api/payments/verify/:reference
        │     → On confirmed: show success screen
        │
        └─ PAYMENT FAILURE
              → Paystack shows inline error
              → Modal stays open — diner retries
              → After 3 failures: show "Pay at Counter" option
```

### 1.3 Payment Success Screen

```
[Payment confirmed via webhook]
        │
        ▼
[SUCCESS SCREEN]
  ┌─────────────────────────────────────────┐
  │       ✅ Payment Successful!            │
  │                                         │
  │  ₦4,945 paid                            │
  │  Mama Put Uyo · Table 5                │
  │  {timestamp}                            │
  │                                         │
  │  🏆 You earned 46 points!              │  ← if loyalty phone on file
  │  Total: 386 points                      │
  │                                         │
  │  Your WhatsApp receipt is on its way 📱 │  ← if phone provided
  │                                         │
  │  [Leave a Google Review ⭐]             │  ← optional, restaurant configurable
  └─────────────────────────────────────────┘
```

### 1.4 Pay at Counter Fallback

```
[After 3 failed payment attempts]
        │
        ▼
[FALLBACK SCREEN]
  "Having trouble paying? No worries."
  "Show this screen to your waiter to pay at the counter."

  ┌─────────────────────────────────────────┐
  │  🧾 Order #4721                         │
  │  Table 5 · Mama Put Uyo               │
  │  Total: ₦4,945                          │
  │                                         │
  │  [Show this to your waiter]            │
  └─────────────────────────────────────────┘

  Note: Order is NOT marked paid. Staff must manually mark as paid
  from the dashboard after collecting cash/POS payment.
```

---

## 2. Paystack Integration

### Setup

```bash
npm install @paystack/inline-js
```

### Initialize Payment (Client-Side)

```typescript
// components/diner/PayNowButton.tsx

const initializePaystackPayment = async (order: Order, tipAmount: number) => {
  const totalWithTip = order.total_amount + tipAmount

  // Step 1: Create payment record on server
  const { data } = await fetch('/api/payments/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: order.id,
      amount: totalWithTip,
      tip_amount: tipAmount
    })
  }).then(r => r.json())

  const reference = data.reference

  // Step 2: Open Paystack inline modal
  const PaystackPop = (await import('@paystack/inline-js')).default
  const handler = PaystackPop.setup({
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    email: order.diner_phone
      ? `${order.diner_phone.replace('+', '')}@scanserve.ng`
      : `table-${order.table_number}@${order.restaurant_slug}.scanserve.ng`,
    amount: Math.round(totalWithTip * 100), // Paystack uses kobo
    currency: 'NGN',
    ref: reference,
    channels: ['card', 'bank_transfer', 'ussd'],
    metadata: {
      order_id: order.id,
      restaurant_id: order.restaurant_id,
      table_number: order.table_number,
      custom_fields: [
        { display_name: 'Table', variable_name: 'table', value: `Table ${order.table_number}` },
        { display_name: 'Restaurant', variable_name: 'restaurant', value: order.restaurant_name }
      ]
    },
    callback: async (response: { reference: string }) => {
      // Callback fires on Paystack's end — verify on our server
      await verifyPayment(response.reference)
    },
    onClose: () => {
      // Modal closed without payment
      setPaymentState('idle')
    }
  })

  handler.openIframe()
}

// Verify after Paystack callback (belt + suspenders with webhook)
const verifyPayment = async (reference: string) => {
  setPaymentState('verifying')
  const { data } = await fetch(`/api/payments/verify/${reference}`).then(r => r.json())
  if (data.status === 'success') {
    setPaymentState('success')
  } else {
    setPaymentState('pending') // Wait for webhook
  }
}
```

---

## 3. Webhook Handler

```typescript
// app/api/webhooks/paystack/route.ts
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role for webhook writes
)

export async function POST(req: Request) {
  // 1. Read raw body (must be text for HMAC verification)
  const body = await req.text()
  const signature = req.headers.get('x-paystack-signature')

  if (!signature) {
    return Response.json({ error: 'Missing signature' }, { status: 401 })
  }

  // 2. Verify HMAC SHA-512 signature
  const expectedSig = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest('hex')

  if (expectedSig !== signature) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(body)

  // 3. Handle charge.success event
  if (event.event === 'charge.success') {
    const { reference, amount, metadata, channel } = event.data

    // 4. Idempotency check — skip if already processed
    const { data: existing } = await supabase
      .from('payments')
      .select('id, status')
      .eq('paystack_reference', reference)
      .single()

    if (existing?.status === 'success') {
      return Response.json({ received: true, skipped: true })
    }

    // 5. Update payment record
    await supabase
      .from('payments')
      .update({
        status: 'success',
        method: channel,
        paid_at: new Date().toISOString(),
        paystack_response: event.data
      })
      .eq('paystack_reference', reference)

    // 6. Update order status + tip amount
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        tip_amount: metadata.tip_amount || 0,
        total_amount: amount / 100 // convert from kobo
      })
      .eq('id', metadata.order_id)

    // 7. Award loyalty points (async, non-blocking)
    awardLoyaltyPoints(metadata.order_id).catch(console.error)

    // 8. Send WhatsApp receipt (async, non-blocking)
    sendWhatsAppReceipt(metadata.order_id).catch(console.error)
  }

  // Acknowledge receipt immediately
  return Response.json({ received: true })
}
```

---

## 4. WhatsApp Receipt

### Setup

```bash
npm install twilio
```

### Receipt Sender

```typescript
// lib/whatsapp-receipt.ts
import twilio from 'twilio'

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export const sendWhatsAppReceipt = async (orderId: string): Promise<void> => {
  // Fetch full order with items, restaurant, loyalty info
  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      restaurant:restaurants(name),
      items:order_items(item_name, quantity, line_total, modifiers),
      payment:payments(method, paid_at)
    `)
    .eq('id', orderId)
    .single()

  // No phone = no receipt
  if (!order?.diner_phone) return

  // Fetch loyalty points earned for this order
  const { data: loyaltyTx } = await supabase
    .from('loyalty_transactions')
    .select('points')
    .eq('order_id', orderId)
    .eq('type', 'earn')
    .single()

  const { data: loyaltyProfile } = order.diner_phone
    ? await supabase
        .from('loyalty_profiles')
        .select('total_points, tier')
        .eq('restaurant_id', order.restaurant_id)
        .eq('phone', order.diner_phone)
        .single()
    : { data: null }

  // Build receipt message
  const itemLines = order.items
    .map((i: any) => `• ${i.item_name} ×${i.quantity}  ₦${Number(i.line_total).toLocaleString('en-NG')}`)
    .join('\n')

  const divider = '─────────────────'

  const vatLine = order.vat_amount > 0
    ? `VAT (7.5%): ₦${Number(order.vat_amount).toLocaleString('en-NG')}\n`
    : ''

  const tipLine = order.tip_amount > 0
    ? `Tip: ₦${Number(order.tip_amount).toLocaleString('en-NG')}\n`
    : ''

  const loyaltyLine = loyaltyTx?.points
    ? `\n🏆 *+${loyaltyTx.points} loyalty points earned!*\nYour balance: ${loyaltyProfile?.total_points ?? 0} pts`
    : ''

  const paymentMethod = {
    card: '💳 Card',
    bank_transfer: '🏦 Bank Transfer',
    ussd: '📱 USSD'
  }[order.payment?.method] ?? 'Payment'

  const message = `✅ *Payment Confirmed*
${order.restaurant.name} · Table ${order.table_number}
${new Date(order.payment?.paid_at).toLocaleString('en-NG', {
  day: '2-digit', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit'
})}

${itemLines}

${divider}
Subtotal: ₦${Number(order.subtotal).toLocaleString('en-NG')}
${vatLine}${tipLine}*Total: ₦${Number(order.total_amount).toLocaleString('en-NG')}*
${paymentMethod}${loyaltyLine}

Thank you for dining with us! 🍽️
_${order.restaurant.name}_`

  await twilioClient.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
    to: `whatsapp:${order.diner_phone}`,
    body: message
  })
}
```

### Sample WhatsApp Receipt Output

```
✅ Payment Confirmed
Mama Put Uyo · Table 5
01 Mar 2026, 7:45 PM

• Jollof Rice (Hot) ×1  ₦2,500
• Spring Rolls ×1  ₦1,800
• Extra Sauce ×1  ₦300

─────────────────
Subtotal: ₦4,600
VAT (7.5%): ₦345
Tip: ₦0
Total: ₦4,945
🏦 Bank Transfer

🏆 +46 loyalty points earned!
Your balance: 386 pts

Thank you for dining with us! 🍽️
Mama Put Uyo
```

---

## 5. File Structure

```
app/
├── [restaurantSlug]/t/[tableNumber]/
│   └── bill/
│       └── page.tsx              ← bill + payment screen
│
├── api/
│   ├── payments/
│   │   ├── initialize/
│   │   │   └── route.ts          ← create payment record + reference
│   │   └── verify/
│   │       └── [reference]/
│   │           └── route.ts      ← check payment status
│   └── webhooks/
│       └── paystack/
│           └── route.ts          ← Paystack event handler
│
├── components/
│   └── diner/
│       ├── BillScreen.tsx        ← itemized bill + tip selector
│       ├── TipSelector.tsx       ← 0/5/10/custom tip buttons
│       ├── PayNowButton.tsx      ← Paystack inline modal trigger
│       ├── PaymentSuccessScreen.tsx
│       └── PayAtCounterFallback.tsx
│
lib/
└── whatsapp-receipt.ts
```

---

## 6. API Routes

### POST `/api/payments/initialize`

```typescript
// Public — validated by order_id + diner_session_id
{
  order_id: string,
  amount: number,       // total including tip (₦)
  tip_amount: number,
  diner_session_id: string
}

// Actions:
// 1. Verify order exists + diner_session_id matches
// 2. Verify order is not already paid
// 3. Generate unique Paystack reference: SS-{order_id_short}-{timestamp}
// 4. Create payments record (status: 'pending')
// Returns: { data: { reference, amount_kobo } }
```

### GET `/api/payments/verify/:reference`

```typescript
// Public — called after Paystack callback
// Checks local DB (don't call Paystack API — trust webhook)
// Response:
{
  data: {
    status: "pending" | "success" | "failed",
    order_id: string,
    paid_at: string | null
  }
}
```

### POST `/api/webhooks/paystack`

```typescript
// No auth — HMAC signature verified internally
// Idempotent — safe to receive duplicate events
// Handles: charge.success, charge.failed, refund.processed
// Returns 200 immediately regardless of processing outcome
// (Paystack retries if we return 4xx/5xx)
```

---

## 7. Acceptance Criteria

- [ ] Paystack modal opens in < 2 seconds on 4G
- [ ] Bill screen shows correct itemized list matching the order
- [ ] VAT line only shown when `restaurant.vat_enabled = true`
- [ ] Tip selector updates total amount in real time
- [ ] "Pay Now" amount in button always matches displayed total
- [ ] Paystack webhook verified with HMAC SHA-512 before processing
- [ ] Duplicate webhook events handled idempotently (check `paystack_reference`)
- [ ] Order status updated to `paid` within 5 seconds of Paystack confirming
- [ ] WhatsApp receipt sent within 60 seconds of payment confirmation
- [ ] Receipt includes: itemized list, subtotal, VAT (if applicable), tip, total, loyalty points
- [ ] "Pay at Counter" option appears after 3 consecutive payment failures
- [ ] Payment failure does NOT lose the order — order persists, retryable
- [ ] Loyalty points shown on success screen (if phone on file)
- [ ] Google Review link shown on success screen (if configured by restaurant)

---

*Next: `07_bill_splitting.md`*
