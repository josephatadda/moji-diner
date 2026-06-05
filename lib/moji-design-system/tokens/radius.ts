import type { DesignToken } from "../types";

const radius = (
  name: string,
  value: string,
  tailwind: string,
  usage: string,
): DesignToken => ({
  name,
  value,
  tailwind,
  layer: name.startsWith("radius/") ? "semantic" : "primitive",
  category: "radius",
  usage,
  status: "stable",
});

export const radiusScaleTokens: DesignToken[] = [
  radius("radius-0", "0px", "rounded-none", "Flush edges."),
  radius("radius-2", "2px", "rounded-sm", "Tiny details."),
  radius("radius-4", "4px", "rounded", "Small chips and marks."),
  radius("radius-6", "6px", "rounded-md", "Compact controls."),
  radius("radius-8", "8px", "rounded-lg", "Inputs and small controls."),
  radius("radius-10", "10px", "rounded-[10px]", "Intermediate inner surfaces."),
  radius("radius-12", "12px", "rounded-xl", "Standard cards."),
  radius("radius-16", "16px", "rounded-2xl", "Diner item cards and modals."),
  radius("radius-20", "20px", "rounded-[20px]", "Bottom sheets."),
  radius("radius-24", "24px", "rounded-3xl", "Large preview surfaces."),
  radius("radius-28", "28px", "rounded-[28px]", "Large panels."),
  radius("radius-32", "32px", "rounded-[32px]", "Extra large panels."),
  radius("radius-full", "9999px", "rounded-full", "Pills and circles."),
];

export const radiusAliasTokens: DesignToken[] = [
  radius(
    "radius/input",
    "radius-8",
    "rounded-lg",
    "Text inputs, selects, textareas.",
  ),
  radius(
    "radius/button",
    "radius-full",
    "rounded-full",
    "Fully rounded pill buttons.",
  ),
  radius(
    "radius/chip",
    "radius-full",
    "rounded-full",
    "Chips, pills, and tags.",
  ),
  radius("radius/card", "radius-12", "rounded-xl", "Standard content cards."),
  radius(
    "radius/item-card",
    "radius-16",
    "rounded-2xl",
    "Diner item cards and featured cards.",
  ),
  radius(
    "radius/sheet",
    "radius-20",
    "rounded-[20px]",
    "Bottom sheets, top corners only.",
  ),
  radius("radius/modal", "radius-16", "rounded-2xl", "Modals and dialogs."),
  radius(
    "radius/avatar",
    "radius-full",
    "rounded-full",
    "Avatars and profile images.",
  ),
  radius(
    "radius/floating-action",
    "radius-full",
    "rounded-full",
    "FABs and floating buttons.",
  ),
];

export const radiusTokens = radiusScaleTokens.map((token) => ({
  surface: "diner-ordering" as const,
  name: token.name,
  value: token.value,
  className: token.tailwind ?? "",
  usage: token.usage,
  avoid: "Avoid hardcoded radius values that are not on the scale.",
  status: token.status,
}));

export const radiusAliases = radiusAliasTokens.map((token) => ({
  surface: "diner-ordering" as const,
  name: token.name,
  value: token.value,
  className: token.tailwind ?? "",
  usage: token.usage,
  avoid: "Avoid screen-specific radius aliases before the pattern repeats.",
  status: token.status,
}));
