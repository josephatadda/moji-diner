export * from "./actions";
export * from "./cards";
export * from "./feedback";
export * from "./flow";
export * from "./inputs";
export * from "./navigation";
export * from "./sheets";

import { actionComponentVariants } from "./actions";
import { cardComponentVariants } from "./cards";
import { feedbackComponentVariants } from "./feedback";
import { flowComponentVariants } from "./flow";
import { inputComponentVariants } from "./inputs";
import { navigationComponentVariants } from "./navigation";
import { sheetComponentVariants } from "./sheets";

export const componentVariants = [
  ...actionComponentVariants,
  ...inputComponentVariants,
  ...navigationComponentVariants,
  ...cardComponentVariants,
  ...sheetComponentVariants,
  ...feedbackComponentVariants,
  ...flowComponentVariants,
];

export const componentSpecs = componentVariants.map((component) => ({
  surface: component.surface,
  name: component.component,
  category:
    component.group === "Actions"
      ? "Action"
      : component.group === "Sheets"
        ? "Sheet"
        : component.group === "Cards"
          ? "Card"
          : component.group === "Feedback"
            ? "Feedback"
            : component.group === "Flow"
              ? "Flow"
              : component.group === "Navigation"
                ? "Flow"
                : "Input",
  purpose: component.usage,
  anatomy: component.anatomy,
  variants: [component.variant],
  states: component.states,
  tokens: component.tokensUsed,
  accessibility: component.accessibility.join(" "),
  usage: component.usage,
  avoid: component.avoid ?? "Avoid undocumented one-off styling.",
  status: component.status,
}));
