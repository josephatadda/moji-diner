export type TokenStatus = "stable" | "draft" | "needs-review";

export type TokenLayer = "primitive" | "semantic" | "component" | "pattern";

export type Surface =
  | "global"
  | "diner-ordering"
  | "dashboard"
  | "billing"
  | "analytics"
  | "staff"
  | "loyalty"
  | "auth"
  | "roadmap";

export type FoundationEntry = {
  category: "Brand Principle" | "Visual Principle" | "Surface Philosophy";
  name: string;
  description: string;
  status: TokenStatus;
};

export type DesignToken = {
  name: string;
  value: string;
  layer: TokenLayer;
  category: string;
  tailwind?: string;
  cssVariable?: string;
  usage: string;
  avoid?: string;
  status: TokenStatus;
};

export type TypographyToken = {
  name: string;
  fontFamily: "Geist Sans" | "Georgia";
  fontRole: "display" | "body" | "utility";
  sizePx: number;
  lineHeightPx: number;
  weight: number;
  tracking: string;
  colorRole: string;
  numeric?: boolean;
  usage: string;
  avoid?: string;
  className?: string;
  status: TokenStatus;
};

export type ComponentVariant = {
  component: string;
  variant: string;
  group:
    | "Actions"
    | "Inputs"
    | "Cards"
    | "Sheets"
    | "Feedback"
    | "Navigation"
    | "Flow";
  surface: Surface;
  intent?: "neutral" | "brand" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  states: Array<
    | "default"
    | "hover"
    | "active"
    | "focus-visible"
    | "selected"
    | "disabled"
    | "loading"
    | "error"
    | "empty"
    | "unavailable"
  >;
  tokensUsed: string[];
  anatomy: string[];
  accessibility: string[];
  usage: string;
  avoid?: string;
  exampleClassName?: string;
  status: TokenStatus;
};

export type ProductPattern = {
  name: string;
  surface: Surface;
  status: TokenStatus;
  description: string;
  uses: string[];
  anatomy: string[];
  responsiveBehavior: string;
  accessibility: string[];
  usage: string;
  avoid?: string;
};

export type AuditFinding = {
  issue: string;
  location: string;
  current: string;
  recommendation: string;
  priority: "High" | "Medium" | "Low";
  status: "Not started" | "In progress" | "Resolved" | "Needs review";
};

export type ComponentCoverage = {
  name: string;
  path: string;
  kind: "visual" | "screen" | "primitive" | "provider" | "token" | "client";
  documented: boolean;
  showcased: boolean;
  migrationStatus: "covered" | "partial" | "supporting" | "future";
  notes: string;
};

export type RoadmapItem = {
  phase: number;
  module: string;
  status: "in-progress" | "not-yet-extracted";
  expectedExtractions: string[];
};
