import type { DesignToken } from "../types";

const primitive = (
  name: string,
  value: string,
  usage: string,
): DesignToken => ({
  name,
  value,
  layer: "primitive",
  category: "color",
  tailwind: name.includes(".") ? name.replace(".", "-") : undefined,
  usage,
  status: "stable",
});

export const primitiveColorTokens: DesignToken[] = [
  primitive("gray.50", "#f9fafb", "Page background and subtle surface."),
  primitive("gray.100", "#f3f4f6", "Muted surfaces and light borders."),
  primitive("gray.200", "#e5e7eb", "Default borders and dividers."),
  primitive("gray.300", "#d1d5db", "Disabled borders."),
  primitive("gray.400", "#9ca3af", "Placeholder and disabled text."),
  primitive("gray.500", "#6b7280", "Tertiary text."),
  primitive("gray.600", "#4b5563", "Secondary text."),
  primitive("gray.700", "#374151", "Strong body text."),
  primitive("gray.800", "#1f2937", "Primary action hover."),
  primitive("gray.900", "#111827", "Primary text and action."),
  primitive("orange.50", "#fff7ed", "Soft brand tint."),
  primitive("orange.400", "#fb923c", "Diner-specific warm accent."),
  primitive("orange.500", "#f97316", "Brand accent only, not primary CTA."),
  primitive("orange.600", "#ea580c", "Brand-linked text."),
  primitive("blue.50", "#eff6ff", "Info tint."),
  primitive("blue.500", "#3b82f6", "Focus and info indicator."),
  primitive("blue.600", "#2563eb", "Links and info text."),
  primitive("red.50", "#fef2f2", "Danger tint."),
  primitive("red.500", "#ef4444", "Danger indicator."),
  primitive("red.600", "#dc2626", "Danger text."),
  primitive("green.50", "#f0fdf4", "Success tint."),
  primitive("green.500", "#22c55e", "Success indicator."),
  primitive("green.600", "#16a34a", "Success text."),
  primitive("yellow.50", "#fefce8", "Warning tint."),
  primitive("yellow.500", "#eab308", "Warning indicator."),
  primitive("yellow.700", "#a16207", "Warning text."),
  primitive("purple.500", "#a855f7", "Loyalty accent draft."),
  primitive("white", "#ffffff", "Card and elevated surfaces."),
  primitive("black", "#000000", "Overlay and maximum contrast."),
];

export const alphaColorTokens: DesignToken[] = [
  primitive("black-alpha.10", "rgba(0,0,0,0.10)", "Light scrim."),
  primitive("black-alpha.20", "rgba(0,0,0,0.20)", "Subtle backdrop."),
  primitive("black-alpha.40", "rgba(0,0,0,0.40)", "Sheet/modal scrim."),
  primitive("black-alpha.60", "rgba(0,0,0,0.60)", "Heavy overlay."),
  primitive("white-alpha.20", "rgba(255,255,255,0.20)", "Light overlay."),
  primitive(
    "white-alpha.80",
    "rgba(255,255,255,0.80)",
    "Frosted light surface.",
  ),
  primitive("orange-alpha.100", "rgba(249,115,22,0.08)", "Brand hover tint."),
  primitive(
    "blue-alpha.300",
    "rgba(59,130,246,0.16)",
    "Focus ring background.",
  ),
];

const semantic = (
  name: string,
  value: string,
  usage: string,
  tailwind?: string,
): DesignToken => ({
  name,
  value,
  layer: "semantic",
  category: "color",
  tailwind,
  usage,
  status: "stable",
});

export const semanticColorTokens: DesignToken[] = [
  semantic(
    "surface/page",
    "gray.50",
    "Default diner page background.",
    "bg-gray-50",
  ),
  semantic("surface/card", "white", "Card background.", "bg-white"),
  semantic(
    "surface/elevated",
    "white",
    "Sheet and modal background.",
    "bg-white",
  ),
  semantic(
    "surface/muted",
    "gray.50",
    "Subtle grouped background.",
    "bg-gray-50",
  ),
  semantic(
    "surface/inverse",
    "gray.900",
    "Dark contrast sections.",
    "bg-gray-900",
  ),
  semantic(
    "text/primary",
    "gray.900",
    "Headings and primary body.",
    "text-gray-900",
  ),
  semantic("text/secondary", "gray.600", "Supporting text.", "text-gray-600"),
  semantic(
    "text/tertiary",
    "gray.500",
    "De-emphasized metadata.",
    "text-gray-500",
  ),
  semantic("text/muted", "gray.400", "Placeholder and hints.", "text-gray-400"),
  semantic("text/disabled", "gray.300", "Disabled controls.", "text-gray-300"),
  semantic("text/inverse", "white", "Text on dark surfaces.", "text-white"),
  semantic("text/link", "blue.600", "Inline hyperlinks.", "text-blue-600"),
  semantic("text/danger", "red.600", "Error text.", "text-red-600"),
  semantic("text/success", "green.600", "Success text.", "text-green-600"),
  semantic(
    "border/subtle",
    "gray.100",
    "Light dividers and card borders.",
    "border-gray-100",
  ),
  semantic(
    "border/default",
    "gray.200",
    "Standard borders.",
    "border-gray-200",
  ),
  semantic("border/focus", "blue.500", "Focus ring color.", "border-blue-500"),
  semantic(
    "action/primary",
    "gray.900",
    "Primary CTA background, black.",
    "bg-gray-900",
  ),
  semantic(
    "action/primary-hover",
    "gray.800",
    "Primary CTA hover.",
    "bg-gray-800",
  ),
  semantic(
    "action/primary-active",
    "gray.700",
    "Primary CTA pressed.",
    "bg-gray-700",
  ),
  semantic(
    "action/secondary",
    "gray.100",
    "Secondary button fill.",
    "bg-gray-100",
  ),
  semantic("action/danger", "red.500", "Destructive action.", "bg-red-500"),
  semantic("state/success", "green.500", "Success indicators.", "bg-green-500"),
  semantic(
    "state/warning",
    "yellow.500",
    "Warning indicators.",
    "bg-yellow-500",
  ),
  semantic("state/danger", "red.500", "Error indicators.", "bg-red-500"),
  semantic("state/info", "blue.500", "Info indicators.", "bg-blue-500"),
  semantic(
    "accent/brand",
    "orange.500",
    "General brand accent.",
    "bg-orange-500",
  ),
  semantic(
    "accent/diner",
    "orange.400",
    "Diner-specific warm accent.",
    "bg-orange-400",
  ),
];

export const colorTokens = semanticColorTokens.map((token) => ({
  surface: "diner-ordering" as const,
  name: token.name,
  role: token.category,
  className: token.tailwind?.startsWith("bg-") ? token.tailwind : "bg-white",
  textClassName: token.tailwind?.startsWith("text-")
    ? token.tailwind
    : "text-gray-900",
  borderClassName: token.tailwind?.startsWith("border-")
    ? token.tailwind
    : "border-gray-100",
  value: token.value,
  usage: token.usage,
  avoid:
    token.name === "action/primary"
      ? "Never map primary action to orange."
      : "Avoid using semantic color outside its role.",
  status: token.status,
}));
