# Design System — Moji

## Direction

**Personality:** Warmth & Approachability
**Foundation:** Warm (stone/orange)
**Depth:** Borders-only (clean, no shadows)

## Tokens

### Spacing
Base: 4px
Scale: 4, 8, 12, 16, 24, 32, 48

### Colors
```
--foreground: stone-900 / zinc-900
--secondary: stone-600
--muted: stone-400
--faint: stone-100
--accent: orange-500
--shadow: none
--bg: gray-50 / stone-50
```

### Radius
Scale: 8px, 12px, 16px (soft, friendly)
- Inner elements: 8px (rounded-lg)
- Cards: 12px (rounded-xl)
- Page containers: 16px (rounded-2xl)

### Typography
Font: Geist (not Inter — banned)
Numbers: tabular-nums (font-variant-numeric)
Scale: 12, 13, 14 (base), 16, 18, 24, 32
Weights: 400, 500, 600
Tracking: tight on headers, wider on small labels

## Patterns

### Button Primary
- Height: 40px
- Padding: 12px 20px
- Radius: 10px (rounded-[10px])
- Font: 14px, 600 weight
- Background: zinc-900 (not pure black)
- Hover: zinc-700
- Active: scale-[0.97] + -translate-y-[0.5px]

### Card
- Border: 1px solid (gray-100)
- Padding: 20px
- Radius: 16px (rounded-2xl)
- Shadow: none — borders only
- Background: white

### Input
- Height: 44px
- Padding: 12px 16px
- Radius: 10px (rounded-[10px])
- Border: 1.5px solid gray-200

## Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Geist font | Inter is banned (AI slop default). Geist is technical but warm. | 2026-04-21 |
| Borders-only depth | User's preference — shadows add visual noise, borders keep it clean. | 2026-04-21 |
| tabular-nums on all data | Numbers in dashboards must align cleanly. | 2026-04-21 |
| zinc-900 not pure black | Off-black has depth. Pure black is flat and harsh. | 2026-04-21 |
| sentence case labels | UPPERCASE labels feel bureaucratic and dense. | 2026-04-21 |
