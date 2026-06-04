import type { DesignToken } from "../types";

const spacing = (
  name: string,
  value: string,
  tailwind: string,
  usage: string,
): DesignToken => ({
  name,
  value,
  tailwind,
  layer: name.startsWith("space/") ? "semantic" : "primitive",
  category: "spacing",
  usage,
  status: "stable",
});

export const spacingScaleTokens: DesignToken[] = [
  spacing("space-0", "0px", "p-0", "No spacing."),
  spacing("space-1", "4px", "p-1", "Tiny gaps."),
  spacing("space-2", "8px", "p-2", "Inline and control gaps."),
  spacing("space-3", "12px", "p-3", "Card gaps and stack rhythm."),
  spacing("space-4", "16px", "p-4", "Page gutter and card padding."),
  spacing("space-5", "20px", "p-5", "Sheet padding."),
  spacing("space-6", "24px", "p-6", "Roomy section spacing."),
  spacing("space-8", "32px", "p-8", "Major section gap."),
  spacing("space-10", "40px", "p-10", "Large separation."),
  spacing("space-12", "48px", "p-12", "Sparse layouts."),
  spacing("space-16", "64px", "p-16", "Large documentation spacing."),
  spacing("space-20", "80px", "p-20", "Footer offset."),
  spacing("space-24", "96px", "p-24", "Extra large separation."),
];

export const spacingAliasTokens: DesignToken[] = [
  spacing("space/page-gutter", "space-4", "px-4", "Left/right page padding."),
  spacing(
    "space/section-gap",
    "space-8",
    "gap-8",
    "Major vertical section gap.",
  ),
  spacing("space/card-padding", "space-4", "p-4", "Internal card padding."),
  spacing("space/card-gap", "space-3", "gap-3", "Gap between cards."),
  spacing("space/stack-gap", "space-3", "gap-3", "Vertical stacks."),
  spacing("space/inline-gap", "space-2", "gap-2", "Inline elements."),
  spacing("space/control-gap", "space-2", "gap-2", "Form controls."),
  spacing("space/form-gap", "space-3", "gap-3", "Inputs and selection cards."),
  spacing(
    "space/sheet-inset",
    "space-4",
    "p-4",
    "Visible screen gutter around mobile bottom sheets.",
  ),
  spacing(
    "space/sheet-padding",
    "space-5",
    "p-5",
    "Internal bottom sheet padding.",
  ),
  spacing(
    "space/modal-inset",
    "space-4",
    "p-4",
    "Screen-edge inset for centered modals.",
  ),
  spacing(
    "space/footer-padding",
    "18px",
    "pb-[18px]",
    "Fixed CTA footer bottom padding before safe area.",
  ),
  spacing(
    "space/safe-area-offset",
    "env(safe-area-inset-bottom)",
    "pb-[env(safe-area-inset-bottom)]",
    "Mobile safe-area offset.",
  ),
  spacing(
    "space/footer-offset",
    "space-20",
    "pb-20",
    "Bottom padding to clear fixed CTA.",
  ),
];

export const spacingTokens = spacingScaleTokens.map((token) => ({
  surface: "diner-ordering" as const,
  name: token.name,
  value: token.value,
  usage: token.usage,
  avoid: "Avoid arbitrary spacing values that are not on the scale.",
  status: token.status,
}));

export const spacingAliases = spacingAliasTokens.map((token) => ({
  surface: "diner-ordering" as const,
  name: token.name,
  value: token.value,
  usage: token.usage,
  avoid: "Avoid mixing semantic aliases with unrelated hardcoded padding.",
  status: token.status,
}));
