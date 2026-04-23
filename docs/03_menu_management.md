# 03 — Menu Management

**Module:** 2 | **Depends on:** `01_data_models.md`, `02_auth_onboarding.md`  
**Responsive:** See `00b_responsive_design_spec.md` — Mobile: single-column list, full-screen forms, availability toggle is the primary action. Desktop: two-panel layout (editor left, live preview right). Tables become card stacks on mobile. Add/edit forms are bottom sheets on mobile, slide-over panels on desktop.

---

## Table of Contents

1. [User Flows](#1-user-flows)
2. [File Structure](#2-file-structure)
3. [API Routes](#3-api-routes)
4. [Component Specs](#4-component-specs)
5. [Image Upload Spec](#5-image-upload-spec)
6. [Acceptance Criteria](#6-acceptance-criteria)

---

## 1. User Flows

### 1.1 Owner Builds Menu From Scratch

```
[Owner on /dashboard/menu]
        │
        ▼
[Empty state shown]
  "Your menu is empty."
  [+ Add your first category]
        │
        ▼
[ADD CATEGORY MODAL]
  - Category name (required): e.g. "Starters"
  - Description (optional)
  - Sort order (auto-assigned, draggable later)
  [Save Category]
        │
        ▼
[Category card appears with "No items yet" state]
  [+ Add Item]
        │
        ▼
[ADD ITEM FORM (slide-over panel or modal)]
  - Photo: drag-drop zone or tap-to-upload
    → Shows upload progress
    → Preview thumbnail on upload complete
  - Name (required)
  - Description (optional, max 200 chars)
  - Price ₦ (required, numeric)
  - Category (pre-selected, changeable dropdown)
  - Tags (multi-select chips):
    [Spicy] [Vegetarian] [Vegan] [Gluten-Free]
    [Bestseller] [New] [Chef's Special]
  - Featured item? toggle (shows on top of menu)
  - Estimated prep time (minutes, default 15)
  - Allergens (multi-select): Nuts, Dairy, Gluten, Eggs, Fish
  - Modifier groups (collapsible section — see 1.3)
  [Save Item]
        │
        ▼
[Item appears under category]
[Menu preview panel updates in real time (desktop)]
```

### 1.2 Editing and Reordering

```
[Owner on /dashboard/menu — existing menu]
        │
        ├─ Click item card → [Edit item form opens pre-filled]
        │
        ├─ Drag item → [Reorder within category or move to different category]
        │
        ├─ Drag category header → [Reorder category position]
        │
        ├─ Click ··· menu on item →
        │     [Edit]
        │     [Duplicate]     ← creates copy with "(Copy)" appended to name
        │     [Move to category ▶]
        │     [Delete]        ← confirm modal before deleting
        │
        └─ Click ··· menu on category →
              [Edit name]
              [Delete category] ← warn if has items: "Move items first"
```

### 1.3 Modifier Groups

```
[Owner in Add/Edit Item form]
[Scrolls to "Modifier Groups" section]
        │
        ▼
[+ Add Modifier Group]
  - Group name: "Spice Level"
  - Required? [Yes / No]
  - Min selections: 1
  - Max selections: 1
        │
        ▼
[+ Add Option]
  - Option name: "Mild"
  - Extra charge: ₦0
  [+ Add Option]
  - Option name: "Medium"
  - Extra charge: ₦0
  [+ Add Option]
  - Option name: "Extra Hot"
  - Extra charge: ₦200
        │
        ▼
[Multiple modifier groups allowed per item]
[Groups orderable by drag]
[Saved to menu_items.modifier_groups as JSONB]
```

### 1.4 Real-Time Availability Toggle (During Service)

```
[Floor manager opens /dashboard/menu on mobile]
[Sorted by category — compact list view on mobile]
        │
        ▼
[Each item shows toggle: ● Available / ○ Sold Out]
        │
        ▼
[Manager taps toggle on "Peppered Snail"]
  → Optimistic UI update: shows "Sold Out" immediately
  → PATCH /api/menu/items/:id/availability { is_available: false }
  → Supabase Realtime broadcasts change
        │
        ▼
[Within 30 seconds:]
  All active diner sessions on scanserve.ng/[slug]/...
  see "Peppered Snail" greyed out with "Sold Out" badge
  Item is unclickable/unorderable
        │
        ▼
[End of service:]
[Manager taps "Reset All Availability" button]
  → Confirm modal: "Mark all items as available again?"
  → [Confirm] → PATCH /api/menu/availability/reset
  → All items return to is_available = true
```

### 1.5 Live Menu Preview

```
Desktop (lg+):
  ┌────────────────────┬─────────────────────┐
  │   MENU EDITOR      │   DINER PREVIEW     │
  │   (lg:w-3/5)       │   (lg:w-2/5)        │
  │                    │   Sticky, scrolls    │
  │  [Categories...]   │   independently     │
  │  [Items...]        │                     │
  │                    │  📱 Phone frame     │
  │                    │  showing exact      │
  │                    │  diner view         │
  └────────────────────┴─────────────────────┘

Mobile (<lg):
  Single column — editor only
  [Preview Menu] tab at top switches to preview mode
  Preview fills full screen when active
  Back arrow returns to editor
```

---

## 2. File Structure

```
app/
├── dashboard/
│   └── menu/
│       ├── page.tsx
│       │   // Desktop (lg+): two-panel layout — editor + preview side by side
│       │   // Mobile: single-column, tab switcher between editor and preview
│       └── components/
│           ├── MenuPage.tsx            ← layout switcher (desktop two-panel / mobile tabs)
│           ├── CategoryList.tsx        ← draggable list of categories
│           ├── CategoryCard.tsx        ← individual category with items
│           ├── CategoryForm.tsx
│           │   // Mobile: full-screen bottom sheet
│           │   // Desktop: modal dialog, max-w-[480px]
│           ├── MenuItemCard.tsx
│           │   // Mobile: compact list row (72px min height)
│           │   // Desktop: same list row with more visible actions on hover
│           ├── MenuItemForm.tsx
│           │   // Mobile: full-screen bottom sheet, scroll within
│           │   // Desktop: right slide-over panel (w-[480px])
│           ├── ModifierGroupBuilder.tsx
│           ├── TagSelector.tsx
│           ├── AllergenSelector.tsx
│           ├── AvailabilityToggle.tsx  ← min 48px touch target on mobile
│           ├── ResetAvailabilityBtn.tsx
│           ├── ImageUploader.tsx
│           └── MenuPreview.tsx         ← always renders at 375px width (phone frame)
```

---

## 3. API Routes

### GET `/api/menu/:restaurantSlug`

```typescript
// Public endpoint — no auth required
// Returns full menu for diner-facing view
// Response:
{
  data: {
    restaurant: {
      id, name, slug, description, logo_url, cover_image_url,
      is_accepting_orders, currency, vat_enabled, vat_rate
    },
    categories: [
      {
        id, name, sort_order,
        items: [
          {
            id, name, description, price, photo_url,
            is_available, is_featured, tags, allergens,
            preparation_time_mins, modifier_groups
          }
        ]
      }
    ]
  }
}
// Cache: Cache-Control: s-maxage=30, stale-while-revalidate=60
// Invalidated immediately when availability changes via Realtime
```

### POST `/api/menu/categories`

```typescript
// Auth: restaurant owner JWT
{
  restaurant_id: string,
  name: string,
  description?: string,
  sort_order?: number
}
// Returns: { data: { id, name, sort_order } }
```

### PUT `/api/menu/categories/:id`

```typescript
// Auth: restaurant owner JWT
{ name?: string, description?: string }
```

### PATCH `/api/menu/categories/reorder`

```typescript
// Auth: restaurant owner JWT
{
  restaurant_id: string,
  order: [{ id: string, sort_order: number }]
}
// Batch update sort_order for all categories
```

### DELETE `/api/menu/categories/:id`

```typescript
// Auth: restaurant owner JWT
// Guard: return 400 if category has items
// Response: { error: "Move or delete items in this category first" }
```

### POST `/api/menu/items`

```typescript
// Auth: restaurant owner JWT
{
  restaurant_id: string,
  category_id: string,
  name: string,
  description?: string,
  price: number,
  photo_url?: string,
  is_available?: boolean,     // default true
  is_featured?: boolean,      // default false
  preparation_time_mins?: number,
  allergens?: string[],
  tags?: string[],
  modifier_groups?: ModifierGroup[],
  sort_order?: number
}
```

### PUT `/api/menu/items/:id`

```typescript
// Auth: restaurant owner JWT
// Partial update — all fields optional
// Updates updated_at timestamp
```

### PATCH `/api/menu/items/:id/availability`

```typescript
// Auth: restaurant owner JWT (or staff JWT)
{ is_available: boolean }
// Action:
//   1. Update menu_items.is_available
//   2. Supabase Realtime broadcasts to channel `menu:${restaurant_id}`
// Returns: { data: { id, is_available } }
```

### PATCH `/api/menu/availability/reset`

```typescript
// Auth: restaurant owner JWT
{ restaurant_id: string }
// Sets all items to is_available = true
// Supabase Realtime broadcasts bulk update
```

### PATCH `/api/menu/items/reorder`

```typescript
// Auth: restaurant owner JWT
{
  restaurant_id: string,
  order: [{ id: string, category_id: string, sort_order: number }]
}
```

### DELETE `/api/menu/items/:id`

```typescript
// Auth: restaurant owner JWT
// Soft consideration: if item has past orders, set is_available = false
// instead of deleting (preserves order history integrity)
// Hard delete only if item has never been ordered
```

### POST `/api/menu/upload-image`

```typescript
// Auth: restaurant owner JWT
// Body: FormData with field 'image' (File)
// Process:
//   1. Validate: JPEG or PNG, < 5MB
//   2. Compress with sharp to max 800px wide, quality 80, < 200KB output
//   3. Upload to Supabase Storage: bucket 'menu-images'
//   4. Path: {restaurant_id}/{uuid}.jpg
// Returns: { data: { url: string } }
```

---

## 4. Component Specs

### `<ImageUploader />`

```typescript
// Props: onUpload(url: string), existingUrl?: string
// States: idle | uploading | success | error
// Features:
//   - Drag and drop or click to select
//   - Shows upload progress bar
//   - Previews image after upload
//   - "Remove" button to clear
//   - Accepts: image/jpeg, image/png
//   - Max size: 5MB (show error if exceeded)
```

### `<ModifierGroupBuilder />`

```typescript
// Props: groups: ModifierGroup[], onChange: (groups: ModifierGroup[]) => void
// Features:
//   - Add/remove groups
//   - Add/remove options within groups
//   - Set required/optional per group
//   - Set min/max selections
//   - Set price delta per option (₦ input)
//   - Drag to reorder options within group
```

### `<AvailabilityToggle />`

```typescript
// Props: itemId: string, isAvailable: boolean, onToggle: () => void
// Optimistic update: toggle state immediately, revert on API error
// Visual: green dot (available) / grey dot with "Sold Out" text
// Size: large enough for thumb tap on mobile (min 44px touch target)
```

### `<MenuPreview />`

```typescript
// Props: restaurantId: string
// Subscribes to Supabase Realtime channel for this restaurant
// Re-renders on:
//   - Item availability change
//   - New item added
//   - Price update
//   - Category reorder
// Renders exact same components as diner-facing MenuPage
// Wrapped in phone frame (CSS border-radius mockup)
```

---

## 5. Image Upload Spec

```
Accepted input:     JPEG, PNG
Max input size:     5MB
Output format:      JPEG (always — for consistency)
Output max width:   800px (maintain aspect ratio)
Output quality:     80%
Output target size: < 200KB
Compression lib:    sharp (server-side) or browser-image-compression (client-side)

Storage path:       supabase://menu-images/{restaurant_id}/{uuid}.jpg
Public URL:         https://{project}.supabase.co/storage/v1/object/public/menu-images/{path}

Client-side approach (preferred for solo dev):
  npm install browser-image-compression

  const compressImage = async (file: File): Promise<File> => {
    return await imageCompression(file, {
      maxSizeMB: 0.2,        // 200KB
      maxWidthOrHeight: 800,
      useWebWorker: true
    })
  }
```

---

## 6. Acceptance Criteria

- [ ] Menu item photo compressed automatically to < 200KB before upload
- [ ] Photo upload shows progress indicator
- [ ] Category and item reordering via drag works on both desktop and mobile
- [ ] Availability toggle updates diner-facing menu within 30 seconds
- [ ] "Reset all availability" requires confirmation modal before executing
- [ ] Menu preview in editor shows exactly what diners see, updates in real time
- [ ] Modifier groups support: required/optional, min/max selections, price deltas
- [ ] Deleting a category with items shows blocking error (move items first)
- [ ] Empty state shows "Add your first category" with clear call to action
- [ ] All monetary values displayed as ₦X,XXX format
- [ ] Tags and allergens selectable via chip UI (no free text entry)
- [ ] Mobile menu management view shows compact item list with large toggle targets

---

*Next: `04_qr_code_system.md`*
