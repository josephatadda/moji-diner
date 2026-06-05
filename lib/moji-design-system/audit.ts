import type { AuditFinding } from "./types";

export const auditFindings: AuditFinding[] = [
  {
    issue: "Radius needs to match the updated MD",
    location: "Design-system registry and live showcase",
    current: "Earlier registry used rounder diner card and sheet values.",
    recommendation:
      "Use radius/item-card → radius-16 and radius/sheet → radius-20 in docs and examples.",
    priority: "High",
    status: "In progress",
  },
  {
    issue: "Component coverage must include real diner components",
    location: "components/diner and components/diner/ui",
    current:
      "MD lists core components, but codebase has additional primitives and screens.",
    recommendation:
      "Track each diner component in the coverage table and document whether it is showcased.",
    priority: "High",
    status: "In progress",
  },
  {
    issue: "Item card shadow reference must stay border-first",
    location: "Diner Ordering Flow item card pattern",
    current: "Some older text referenced shadow/card.",
    recommendation:
      "Use shadow/none for item cards and border/subtle for separation.",
    priority: "Medium",
    status: "In progress",
  },
  {
    issue: "Future modules remain draft",
    location: "Dashboard, auth, billing, analytics, staff, loyalty",
    current: "Expected future extractions are known but not audited.",
    recommendation:
      "Keep future modules in roadmap until each module is polished.",
    priority: "Low",
    status: "Not started",
  },
];
