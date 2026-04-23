# 04 — QR Code System

**Module:** 3 | **Depends on:** `01_data_models.md`, `02_auth_onboarding.md`  
**Responsive:** See `00b_responsive_design_spec.md` — Tables list is a full data table on desktop, card stack on mobile. QR download buttons remain accessible on both. PDF generation is client-side and works the same across devices.

---

## Table of Contents

1. [URL Structure](#1-url-structure)
2. [User Flows](#2-user-flows)
3. [QR Generation Logic](#3-qr-generation-logic)
4. [PDF Export for Printing](#4-pdf-export-for-printing)
5. [File Structure](#5-file-structure)
6. [API Routes](#6-api-routes)
7. [Acceptance Criteria](#7-acceptance-criteria)

---

## 1. URL Structure

```
Public menu (no table context):
  https://scanserve.ng/[restaurant-slug]

Table-specific URL (used in all QR codes):
  https://scanserve.ng/[restaurant-slug]/t/[table-number]

Bill split URL:
  https://scanserve.ng/split/[split-token]
  https://scanserve.ng/split/[split-token]/[part-number]

Examples:
  https://scanserve.ng/mama-put-uyo/t/5
  https://scanserve.ng/yellow-chilli-abuja/t/12
  https://scanserve.ng/split/XK9P2R/2
```

**Why table number in URL (not UUID):**
- Human-readable — staff can verify "Table 5" matches the QR
- Short URLs → smaller QR code → easier to scan
- Table number stored on order for analytics

---

## 2. User Flows

### 2.1 Owner Generates and Downloads QR Codes

```
Desktop (lg+):
[Owner on /dashboard/tables]
[FULL DATA TABLE]
  Table 1  |  VIP Room  |  4 seats  |  ● Available  |  [Download QR] [Edit]
  Table 2  |  (no label)|  4 seats  |  ● Occupied   |  [Download QR] [Edit]
  Table 3  |  Patio     |  6 seats  |  ⏳ Awaiting  |  [Download QR] [Edit]

Mobile (<lg):
[CARD STACK — one card per table]
  ┌──────────────────────────────────┐
  │  Table 1 · VIP Room   ● Available│
  │  4 seats                         │
  │  [Download QR]         [Edit ›]  │
  └──────────────────────────────────┘
  ...
        │
        ▼
[Owner clicks "Download All QR Codes"]
  → PDF generated client-side (jsPDF)
  → One page per table, A6 format (105mm × 148mm)
  → Each page contains:
      - Restaurant logo (if uploaded)
      - Restaurant name
      - "Scan to Order" headline
      - QR code (centered, ~80mm × 80mm)
      - Table number label: "Table 5"
      - Optional footer: "Powered by ScanServe"
  → Browser triggers PDF download: "MamaPutUyo_QR_Codes.pdf"
        │
        ▼
[Owner prints PDF and places cards/stands on tables]
```

### 2.2 Download Single Table QR

```
[Owner clicks "Download QR" on specific table row]
  → Downloads PNG of that table's QR code
  → Filename: "Table_5_QR.png"
  → Size: 300×300px minimum
```

### 2.3 Add or Edit Tables

```
[Owner on /dashboard/tables]
[Clicks "+ Add Table"]
        │
        ▼
[ADD TABLE MODAL]
  - Table number (auto-increments, editable)
  - Label (optional): "Window Seat", "VIP Room"
  - Capacity (default 4)
  [Save]
        │
        ▼
[Table added to list]
[QR code auto-generated and stored in Supabase Storage]
```

### 2.4 Table Status Indicators

```
Status shown on table list:

● Available   — No active orders
● Occupied    — Has orders with status: confirmed / in_kitchen / ready / served
⏳ Awaiting   — Has order with status: served (bill requested, not yet paid)
✓ Paid        — Most recent order status: paid (clears after 15 mins)
```

---

## 3. QR Generation Logic

### Package

```bash
npm install qrcode
npm install --save-dev @types/qrcode
```

### Core Generator

```typescript
// lib/qr.ts
import QRCode from 'qrcode'

interface QROptions {
  restaurantSlug: string
  tableNumber: number
  appUrl?: string
}

export const generateTableQRDataURL = async ({
  restaurantSlug,
  tableNumber,
  appUrl = process.env.NEXT_PUBLIC_APP_URL
}: QROptions): Promise<string> => {
  const url = `${appUrl}/${restaurantSlug}/t/${tableNumber}`

  return await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'M',  // 15% recovery — good for printed cards
    width: 400,
    margin: 2,
    color: {
      dark: '#1A1A2E',   // brand dark
      light: '#FFFFFF'
    }
  })
}

// Generate and store QR for a table
export const generateAndStoreTableQR = async (
  restaurantSlug: string,
  tableId: string,
  tableNumber: number
): Promise<string> => {
  const dataUrl = await generateTableQRDataURL({ restaurantSlug, tableNumber })

  // Convert dataURL to Blob
  const res = await fetch(dataUrl)
  const blob = await res.blob()

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('qr-codes')
    .upload(`${restaurantSlug}/table-${tableNumber}.png`, blob, {
      contentType: 'image/png',
      upsert: true
    })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('qr-codes')
    .getPublicUrl(data.path)

  // Update table record with QR URL
  await supabase
    .from('restaurant_tables')
    .update({ qr_code_url: publicUrl })
    .eq('id', tableId)

  return publicUrl
}
```

---

## 4. PDF Export for Printing

### Package

```bash
npm install jspdf
npm install --save-dev @types/jspdf
```

### PDF Generator

```typescript
// lib/qr-pdf.ts
import jsPDF from 'jspdf'
import { generateTableQRDataURL } from './qr'

interface TableInfo {
  table_number: number
  label?: string
}

interface PDFOptions {
  restaurantName: string
  restaurantSlug: string
  logoUrl?: string
  tables: TableInfo[]
}

export const generateQRCodesPDF = async ({
  restaurantName,
  restaurantSlug,
  logoUrl,
  tables
}: PDFOptions): Promise<void> => {
  // A6 format: 105mm × 148mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [105, 148]
  })

  for (let i = 0; i < tables.length; i++) {
    const table = tables[i]

    if (i > 0) doc.addPage()

    const qrDataURL = await generateTableQRDataURL({
      restaurantSlug,
      tableNumber: table.table_number
    })

    // ── Page layout ──────────────────────────────────
    // Logo (if available): top center, 20mm × 20mm
    if (logoUrl) {
      try {
        doc.addImage(logoUrl, 'PNG', 42.5, 8, 20, 20)
      } catch {
        // Skip logo if it fails to load
      }
    }

    // Restaurant name
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(26, 26, 46) // #1A1A2E
    doc.text(restaurantName, 52.5, logoUrl ? 34 : 16, { align: 'center' })

    // "Scan to Order" headline
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text('SCAN TO ORDER & PAY', 52.5, logoUrl ? 40 : 22, { align: 'center' })

    // QR Code: centered, 75mm × 75mm
    const qrY = logoUrl ? 44 : 26
    doc.addImage(qrDataURL, 'PNG', 15, qrY, 75, 75)

    // Table number label
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(26, 26, 46)
    const tableLabel = table.label
      ? `Table ${table.table_number} · ${table.label}`
      : `Table ${table.table_number}`
    doc.text(tableLabel, 52.5, qrY + 80, { align: 'center' })

    // Footer
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(160, 160, 160)
    doc.text('scanserve.ng', 52.5, 142, { align: 'center' })
  }

  // Trigger download
  const safeRestaurantName = restaurantName.replace(/\s+/g, '')
  doc.save(`${safeRestaurantName}_QR_Codes.pdf`)
}
```

---

## 5. File Structure

```
app/
├── dashboard/
│   └── tables/
│       ├── page.tsx                  ← table list + management
│       └── components/
│           ├── TableList.tsx         ← main table management view
│           ├── TableRow.tsx          ← individual table row
│           ├── TableStatusBadge.tsx  ← status indicator (Available/Occupied/etc)
│           ├── TableForm.tsx         ← add/edit table modal
│           ├── QRCodeDisplay.tsx     ← shows QR preview in table row
│           ├── QRDownloadButton.tsx  ← single table PNG download
│           └── QRPDFExport.tsx       ← all tables PDF download button
│
lib/
├── qr.ts             ← QR generation logic
└── qr-pdf.ts         ← PDF export logic
```

---

## 6. API Routes

### GET `/api/tables/:restaurantId`

```typescript
// Auth: restaurant owner JWT
// Returns all tables with current order status
{
  data: [
    {
      id: string,
      table_number: number,
      label: string | null,
      capacity: number,
      qr_code_url: string,
      is_active: boolean,
      current_status: "available" | "occupied" | "awaiting_payment" | "paid",
      active_order_id: string | null
    }
  ]
}

// Current status logic:
// SELECT o.status, o.id as active_order_id
// FROM restaurant_tables t
// LEFT JOIN orders o ON o.table_id = t.id
//   AND o.status NOT IN ('paid', 'cancelled')
//   AND o.created_at > now() - interval '3 hours'
// WHERE t.restaurant_id = $1
// ORDER BY o.created_at DESC
```

### POST `/api/tables`

```typescript
// Auth: restaurant owner JWT
{
  restaurant_id: string,
  table_number?: number,  // auto-assigned if omitted
  label?: string,
  capacity?: number       // default 4
}
// Action:
//   1. Create restaurant_tables record
//   2. Generate QR code PNG
//   3. Upload to Supabase Storage
//   4. Update record with qr_code_url
// Returns: { data: { id, table_number, qr_code_url } }
```

### PUT `/api/tables/:id`

```typescript
// Auth: restaurant owner JWT
{ label?: string, capacity?: number, is_active?: boolean }
```

### DELETE `/api/tables/:id`

```typescript
// Auth: restaurant owner JWT
// Guard: Cannot delete table with active orders (status not paid/cancelled)
// Response on guard: { error: "Table has active orders. Close them first." }
```

### GET `/api/tables/:id/qr`

```typescript
// Auth: restaurant owner JWT
// Returns QR as PNG data URL (regenerated fresh)
{ data: { qr_data_url: string, table_url: string } }
```

---

## 7. Acceptance Criteria

- [ ] QR code encodes correct table-specific URL: `scanserve.ng/[slug]/t/[number]`
- [ ] QR scannable from phone camera without a dedicated QR app (tested on: iPhone Camera, Google Lens, Samsung Camera)
- [ ] QR scannable from printed card at arm's length (test at A6 card size, standard printer)
- [ ] PDF download generates one page per table, A6 format (105mm × 148mm)
- [ ] Each PDF page includes: restaurant name, "Scan to Order" label, QR code, table number
- [ ] Single table PNG download available for each table
- [ ] Table list shows real-time status: Available / Occupied / Awaiting Payment / Paid
- [ ] New table auto-generates and stores QR code on creation
- [ ] Table with active orders cannot be deleted (error shown)
- [ ] QR regenerated correctly if restaurant slug is changed

---

*Next: `05_diner_ordering_flow.md`*
