# 11 — Offline Support

**Module:** 10 | **Depends on:** `05_diner_ordering_flow.md`, `08_order_queue_dashboard.md`  
**Responsive:** Offline banners and states apply on both mobile and desktop. The offline order queue (IndexedDB) is most relevant on mobile where connectivity drops. The offline banner on the diner menu is full-width on mobile, contained within the 480px shell on desktop. The dashboard offline banner spans the full content area on both.

> Nigeria averages 4–6 hours of power outages daily and intermittent 4G. Offline support is not optional — it's a core feature of the product.

---

## Table of Contents

1. [Strategy](#1-strategy)
2. [Service Worker Setup](#2-service-worker-setup)
3. [Offline Order Queue (IndexedDB)](#3-offline-order-queue-indexeddb)
4. [PWA Manifest](#4-pwa-manifest)
5. [Offline UI States](#5-offline-ui-states)
6. [Acceptance Criteria](#6-acceptance-criteria)

---

## 1. Strategy

```
DINER-FACING (highest priority — revenue-critical):
  ✅ Menu browsing:    Fully offline after first load
  ⚠️  Order submission: Queued offline, synced on reconnect
  ❌ Payment:          Requires connection (Paystack is online-only)

DASHBOARD (lower priority — staff usually have WiFi):
  ⚠️  View orders:     Cached data shown with "offline" banner
  ❌ Status updates:   Requires connection (Supabase Realtime)
  ❌ New order alerts: Requires connection

OFFLINE-FIRST PRINCIPLE:
  Show cached content immediately.
  Attempt network fetch in background.
  Update UI when network response arrives.
  (Stale-While-Revalidate pattern)
```

---

## 2. Service Worker Setup

### Package

```bash
npm install next-pwa
```

### next.config.js

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // disable in dev to avoid cache headaches
  runtimeCaching: [
    // ── Menu API — Stale While Revalidate ──────────────────
    {
      urlPattern: /^https:\/\/.*\/api\/menu\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'menu-api-cache',
        expiration: {
          maxEntries: 50,             // up to 50 different restaurants
          maxAgeSeconds: 5 * 60       // 5 minutes fresh
        },
        cacheableResponse: { statuses: [0, 200] }
      }
    },

    // ── Menu Images — Cache First ──────────────────────────
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*\/menu-images\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'menu-images-cache',
        expiration: {
          maxEntries: 200,            // up to 200 menu item photos
          maxAgeSeconds: 24 * 60 * 60 // 1 day
        },
        cacheableResponse: { statuses: [0, 200] }
      }
    },

    // ── Restaurant Logos — Cache First ────────────────────
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*\/logos\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'logo-cache',
        expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 }
      }
    },

    // ── App Shell (JS/CSS) — Stale While Revalidate ───────
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: { maxAgeSeconds: 30 * 24 * 60 * 60 }
      }
    },

    // ── Next.js pages — Network First ─────────────────────
    {
      urlPattern: /^https?:\/\/.*\/[a-z-]+\/t\/[0-9]+$/i,  // /[slug]/t/[table]
      handler: 'NetworkFirst',
      options: {
        cacheName: 'menu-pages',
        networkTimeoutSeconds: 3,     // fall back to cache after 3s
        expiration: { maxAgeSeconds: 5 * 60 }
      }
    }
  ]
})

module.exports = withPWA({
  // rest of your next.config.js
})
```

---

## 3. Offline Order Queue (IndexedDB)

### Package

```bash
npm install idb
```

### Implementation

```typescript
// lib/offline-queue.ts
import { openDB, IDBPDatabase } from 'idb'

const DB_NAME = 'scanserve-offline-v1'
const ORDERS_STORE = 'pending-orders'

interface OfflineOrder {
  tempId: string
  restaurantId: string
  restaurantSlug: string
  tableNumber: number
  tableId: string
  dinerSessionId: string
  dinerPhone?: string
  items: OrderItem[]
  specialInstructions?: string
  queuedAt: number   // timestamp
}

const getDB = async (): Promise<IDBPDatabase> => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(ORDERS_STORE)) {
        db.createObjectStore(ORDERS_STORE, { keyPath: 'tempId' })
      }
    }
  })
}

export const queueOrderOffline = async (order: Omit<OfflineOrder, 'tempId' | 'queuedAt'>): Promise<string> => {
  const db = await getDB()
  const tempId = crypto.randomUUID()
  await db.add(ORDERS_STORE, {
    ...order,
    tempId,
    queuedAt: Date.now()
  })
  return tempId
}

export const getPendingOrders = async (): Promise<OfflineOrder[]> => {
  const db = await getDB()
  return db.getAll(ORDERS_STORE)
}

export const removePendingOrder = async (tempId: string): Promise<void> => {
  const db = await getDB()
  await db.delete(ORDERS_STORE, tempId)
}

export const clearExpiredOrders = async (): Promise<void> => {
  const db = await getDB()
  const all = await db.getAll(ORDERS_STORE)
  const THREE_HOURS = 3 * 60 * 60 * 1000
  for (const order of all) {
    if (Date.now() - order.queuedAt > THREE_HOURS) {
      await db.delete(ORDERS_STORE, order.tempId)
    }
  }
}

// ── Sync on reconnect ─────────────────────────────────────
export const flushOfflineOrders = async (): Promise<void> => {
  const pending = await getPendingOrders()
  if (pending.length === 0) return

  console.log(`[Offline sync] Flushing ${pending.length} queued orders`)

  for (const order of pending) {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: order.restaurantId,
          table_id: order.tableId,
          table_number: order.tableNumber,
          diner_session_id: order.dinerSessionId,
          diner_phone: order.dinerPhone,
          items: order.items,
          special_instructions: order.specialInstructions
        })
      })

      if (response.ok) {
        await removePendingOrder(order.tempId)
        console.log(`[Offline sync] Order synced: ${order.tempId}`)
      } else {
        console.error(`[Offline sync] Failed to sync order: ${order.tempId}`)
      }
    } catch (error) {
      console.error(`[Offline sync] Network error for: ${order.tempId}`, error)
      // Leave in queue — will retry on next reconnect
    }
  }
}
```

### Reconnect Listener

```typescript
// hooks/useOfflineSync.ts
import { useEffect } from 'react'
import { flushOfflineOrders, clearExpiredOrders } from '@/lib/offline-queue'

export const useOfflineSync = () => {
  useEffect(() => {
    // Flush on mount (in case user was offline and returned)
    if (navigator.onLine) {
      flushOfflineOrders()
      clearExpiredOrders()
    }

    const handleOnline = () => {
      console.log('[Connection] Reconnected — syncing queued orders')
      flushOfflineOrders()
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])
}
```

### Using the Queue in Cart Submission

```typescript
// In CartScreen.tsx — order submission with offline fallback

const submitOrder = async (orderPayload: OrderPayload) => {
  if (!navigator.onLine) {
    // Queue for later
    const tempId = await queueOrderOffline(orderPayload)
    setOrderState({
      status: 'queued',
      message: "You're offline. Your order will be sent when you reconnect.",
      tempId
    })
    return
  }

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload)
    })
    const data = await response.json()
    setOrderState({ status: 'confirmed', orderId: data.data.order_id })
  } catch (error) {
    // Network error even though navigator.onLine = true
    // (can happen with poor connectivity)
    const tempId = await queueOrderOffline(orderPayload)
    setOrderState({
      status: 'queued',
      message: "Connection issue. Order queued — will retry automatically.",
      tempId
    })
  }
}
```

---

## 4. PWA Manifest

```json
// public/manifest.json
{
  "name": "ScanServe",
  "short_name": "ScanServe",
  "description": "Scan to order and pay at restaurants",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#1A1A2E",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/menu.png",
      "sizes": "390x844",
      "type": "image/png",
      "label": "Browse the menu"
    }
  ]
}
```

```typescript
// app/layout.tsx — link manifest
export const metadata = {
  manifest: '/manifest.json',
  themeColor: '#1A1A2E',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ScanServe'
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1'
}
```

---

## 5. Offline UI States

### Diner — Offline Banner

```typescript
// components/diner/OfflineBanner.tsx
import { useEffect, useState } from 'react'

export const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    setIsOffline(!navigator.onLine)
    window.addEventListener('online', () => setIsOffline(false))
    window.addEventListener('offline', () => setIsOffline(true))
  }, [])

  if (!isOffline) return null

  return (
    <div className="offline-banner">
      {/* Sticky banner at top of menu */}
      📶 You're offline. Menu is available but ordering requires connection.
    </div>
  )
}
```

### Diner — Queued Order State

```
[Order submitted while offline]
        │
        ▼
[ORDER QUEUED SCREEN]
  ┌─────────────────────────────────────────┐
  │  📶 You're Offline                      │
  │                                         │
  │  Your order is saved and will be sent   │
  │  automatically when you reconnect.      │
  │                                         │
  │  Jollof Rice ×1                         │
  │  Spring Rolls ×1                        │
  │  Total: ₦4,300                          │
  │                                         │
  │  ⏳ Waiting for connection...           │
  └─────────────────────────────────────────┘
  
  [Once reconnected:]
  ✅ Order sent! You're back online.
```

### Dashboard — Offline Banner

```
[Staff dashboard loses connection]
        │
        ▼
[RED BANNER at top of dashboard:]
  "⚠️ No connection. Showing last known orders. New orders won't appear."

[All action buttons disabled with tooltip:]
  "Reconnect to update order status"

[On reconnect:]
  Banner disappears, full refresh triggered
```

---

## 6. Acceptance Criteria

- [ ] Menu loads fully from cache after first visit, even with no network
- [ ] "You're offline" banner shown immediately when connection drops
- [ ] Banner disappears automatically when connection restores
- [ ] Order submission queued to IndexedDB when offline
- [ ] Queued orders submitted automatically within 10 seconds of reconnect
- [ ] Queued orders expire after 3 hours (not submitted if stale)
- [ ] "Order queued" confirmation screen shown during offline order attempt
- [ ] Menu photos load from cache when offline (after first visit)
- [ ] Dashboard shows "last known data" banner when offline
- [ ] Dashboard action buttons clearly disabled when offline
- [ ] PWA installable via "Add to Home Screen" on Android Chrome (tested)
- [ ] App icon appears correctly on Android home screen
- [ ] No crash or blank screen when navigating while offline

---

*Next: `12_admin_panel.md`*
