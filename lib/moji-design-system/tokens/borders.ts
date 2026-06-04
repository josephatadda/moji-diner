import type { DesignToken } from "../types";

export const borderTokens: DesignToken[] = [
  {
    name: "border/subtle",
    value: "1px solid gray.100",
    layer: "semantic",
    category: "border",
    usage: "Light dividers and card borders.",
    status: "stable",
  },
  {
    name: "border/default",
    value: "1px solid gray.200",
    layer: "semantic",
    category: "border",
    usage: "Standard borders.",
    status: "stable",
  },
  {
    name: "border/strong",
    value: "1px solid gray.300",
    layer: "semantic",
    category: "border",
    usage: "Emphasized dividers.",
    status: "stable",
  },
  {
    name: "border/focus",
    value: "2px solid blue.500",
    layer: "semantic",
    category: "border",
    usage: "Visible focus ring.",
    status: "stable",
  },
  {
    name: "border/error",
    value: "1px solid red.500",
    layer: "semantic",
    category: "border",
    usage: "Error state border paired with error text.",
    status: "stable",
  },
  {
    name: "border/success",
    value: "1px solid green.500",
    layer: "semantic",
    category: "border",
    usage: "Success state border paired with success text.",
    status: "stable",
  },
];
