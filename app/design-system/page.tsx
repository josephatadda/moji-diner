import type { Metadata } from "next";
import {
  auditFindings,
  borderTokens,
  colorTokens,
  componentCoverage,
  componentSpecs,
  componentVariants,
  elevationLevels,
  elevationTokens,
  foundations,
  layoutTokens,
  motionTokens,
  patternStandards,
  radiusAliases,
  radiusTokens,
  roadmapItems,
  spacingAliases,
  spacingTokens,
  tokenArchitecture,
  typographyStyles,
  zIndexTokens,
} from "@/lib/moji-design-system";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Diner Design System",
  description:
    "Diner-first Moji design system documentation and visual standards.",
};

const navigation = [
  ["Overview", "#overview"],
  ["Foundations", "#foundations"],
  ["Typography", "#typography"],
  ["Colors", "#colors"],
  ["Radius", "#radius"],
  ["Spacing", "#spacing"],
  ["Elevation", "#elevation"],
  ["Borders", "#borders"],
  ["Motion", "#motion"],
  ["Z-Index", "#z-index"],
  ["Layout", "#layout"],
  ["Inputs", "#inputs"],
  ["Bottom sheets", "#bottom-sheets"],
  ["Components", "#components"],
  ["Diner flow", "#diner-flow"],
  ["Audit", "#audit"],
  ["Roadmap", "#roadmap"],
] as const;

const typographyGroups = [
  "Display",
  "Heading",
  "Body",
  "Label",
  "Utility",
] as const;

function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8 space-y-5">
      <div className="max-w-3xl">
        <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold leading-tight text-gray-950 [font-family:var(--font-display)]">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

function SpecCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-gray-100 bg-white p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-600">
      {children}
    </span>
  );
}

function Tag({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
        tone === "neutral" && "border-gray-200 bg-white text-gray-600",
        tone === "success" && "border-green-200 bg-green-100 text-green-700",
        tone === "warning" && "border-orange-200 bg-orange-100 text-orange-700",
        tone === "danger" && "border-red-200 bg-red-100 text-red-700",
        tone === "info" && "border-blue-200 bg-blue-100 text-blue-700",
      )}
    >
      {children}
    </span>
  );
}

function TypographySpecimen() {
  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <div className="rounded-[28px] border border-gray-800 bg-[#2b2b2b] p-4 text-white">
        <p className="text-xs font-semibold text-gray-300">Text styles</p>
        <div className="mt-5 space-y-5">
          {typographyGroups.map((group) => (
            <div key={group}>
              <p className="text-xs font-semibold text-white">{group}</p>
              <div className="mt-2 space-y-2 pl-4">
                {typographyStyles
                  .filter((style) => style.group === group)
                  .map((style) => (
                    <div
                      key={style.name}
                      className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-gray-200"
                    >
                      <span
                        className={cn(
                          "text-sm",
                          style.fontFamily === "Instrument Serif" &&
                            "[font-family:var(--font-display)]",
                        )}
                      >
                        Ag
                      </span>
                      <span className="text-xs">
                        {style.name.replace(`${group}/`, "")}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {style.size.replace("px", "")} / {style.lineHeight}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {typographyStyles.map((style) => (
          <div
            key={style.name}
            className="grid gap-4 rounded-[24px] border border-gray-100 bg-white p-4 md:grid-cols-[1fr_240px]"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {style.name}
              </p>
              <p className={cn("mt-2", style.className)}>
                {style.numeric === "tabular"
                  ? "₦24,800 · 12 items"
                  : "Jollof, checkout, and order status should feel like one system."}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                {style.usage}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-red-500">
                Avoid: {style.avoid}
              </p>
            </div>
            <div className="flex flex-wrap content-start gap-2">
              <Pill>{style.fontFamily}</Pill>
              <Pill>{style.size}</Pill>
              <Pill>{style.lineHeight}</Pill>
              <Pill>{style.weight}</Pill>
              <Pill>{style.colorRole}</Pill>
              <Pill>{style.numeric}</Pill>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ColorSwatches() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {colorTokens.map((token) => (
        <div
          key={token.name}
          className="overflow-hidden rounded-[24px] border border-gray-100 bg-white"
        >
          <div
            className={cn(
              "h-24 border-b",
              token.className,
              token.borderClassName,
            )}
          />
          <div className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-bold text-gray-950">{token.name}</p>
              <Tag tone={token.status === "stable" ? "success" : "warning"}>
                {token.status}
              </Tag>
            </div>
            <p className="text-xs font-semibold text-gray-500">{token.role}</p>
            <p className="text-xs leading-relaxed text-gray-500">
              {token.usage}
            </p>
            <p className="text-xs leading-relaxed text-red-500">
              Avoid: {token.avoid}
            </p>
            <div className="flex flex-wrap gap-2">
              <Pill>{token.value}</Pill>
              <Pill>{token.textClassName}</Pill>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RadiusPreview() {
  return (
    <div className="space-y-4">
      <SpecCard>
        <h3 className="text-base font-bold text-gray-950">Numeric scale</h3>
        <p className="mt-1 text-sm leading-relaxed text-gray-600">
          Use the numeric scale when composing new patterns. Child surfaces
          should usually be 4px to 8px smaller than the parent.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {radiusTokens.map((token) => (
            <div key={token.name} className="space-y-2">
              <div
                className={cn(
                  "flex h-24 items-center justify-center border border-gray-200 bg-gray-50 text-xs font-bold text-gray-500",
                  token.className,
                )}
              >
                {token.value}
              </div>
              <p className="text-sm font-bold text-gray-950">{token.name}</p>
            </div>
          ))}
        </div>
      </SpecCard>

      <div className="grid gap-3 md:grid-cols-2">
        {radiusAliases.map((token) => (
          <SpecCard key={token.name} className="p-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "h-16 w-20 flex-none border border-gray-200 bg-gray-50",
                  token.className,
                )}
              />
              <div>
                <p className="text-sm font-bold text-gray-950">
                  {token.name} · {token.value}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  {token.usage}
                </p>
              </div>
            </div>
          </SpecCard>
        ))}
      </div>
    </div>
  );
}

function SpacingPreview() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SpecCard>
        <h3 className="text-base font-bold text-gray-950">Spacing scale</h3>
        <div className="mt-4 space-y-3">
          {spacingTokens.map((token) => (
            <div key={token.name} className="grid grid-cols-[86px_1fr] gap-4">
              <div>
                <p className="text-sm font-bold text-gray-950">{token.name}</p>
                <p className="text-xs text-gray-400">{token.value}</p>
              </div>
              <div>
                <div
                  className="h-3 max-w-full rounded-full bg-gray-950"
                  style={{ width: token.value }}
                />
                <p className="mt-2 text-xs leading-relaxed text-gray-500">
                  {token.usage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SpecCard>

      <SpecCard>
        <h3 className="text-base font-bold text-gray-950">Diner aliases</h3>
        <div className="mt-4 space-y-3">
          {spacingAliases.map((token) => (
            <div
              key={token.name}
              className="rounded-[20px] border border-gray-100 bg-gray-50 p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-gray-950">{token.name}</p>
                <Pill>{token.value}</Pill>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                {token.usage}
              </p>
            </div>
          ))}
        </div>
      </SpecCard>
    </div>
  );
}

function FoundationCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {foundations.map((item) => (
        <SpecCard key={`${item.category}-${item.name}`}>
          <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
            {item.category}
          </p>
          <h3 className="mt-2 text-base font-bold text-gray-950">
            {item.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {item.description}
          </p>
          <div className="mt-4">
            <Tag tone={item.status === "stable" ? "success" : "warning"}>
              {item.status}
            </Tag>
          </div>
        </SpecCard>
      ))}
    </div>
  );
}

function TokenArchitectureCards() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {tokenArchitecture.map((item) => (
        <SpecCard key={item.layer}>
          <h3 className="text-sm font-bold text-gray-950">{item.layer}</h3>
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            {item.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {item.examples.map((example) => (
              <Pill key={example}>{example}</Pill>
            ))}
          </div>
        </SpecCard>
      ))}
    </div>
  );
}

function TokenList({
  title,
  tokens,
}: {
  title: string;
  tokens: Array<{ name: string; value: string; usage: string }>;
}) {
  return (
    <SpecCard>
      <h3 className="text-base font-bold text-gray-950">{title}</h3>
      <div className="mt-4 divide-y divide-gray-100 overflow-hidden rounded-[12px] border border-gray-100">
        {tokens.map((token) => (
          <div
            key={token.name}
            className="grid gap-2 bg-white p-3 text-sm md:grid-cols-[220px_180px_1fr]"
          >
            <p className="font-semibold text-gray-950">{token.name}</p>
            <p className="text-xs font-medium text-gray-500">{token.value}</p>
            <p className="text-xs leading-relaxed text-gray-500">
              {token.usage}
            </p>
          </div>
        ))}
      </div>
    </SpecCard>
  );
}

function ElevationPreview() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <TokenList title="Shadow tokens" tokens={elevationTokens} />
      <SpecCard>
        <h3 className="text-base font-bold text-gray-950">
          Elevation hierarchy
        </h3>
        <div className="mt-4 space-y-3">
          {elevationLevels.map(([level, method, usage]) => (
            <div
              key={level}
              className="grid grid-cols-[36px_1fr] gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-950 text-xs font-bold text-white">
                {level}
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-950">{method}</p>
                <p className="text-xs text-gray-500">{usage}</p>
              </div>
            </div>
          ))}
        </div>
      </SpecCard>
    </div>
  );
}

function InputExamples() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <SpecCard>
        <h3 className="text-base font-bold text-gray-950">Text input</h3>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-gray-950">
            Phone number
          </span>
          <input
            className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-950 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-500"
            placeholder="0800 000 0000"
          />
          <span className="mt-2 block text-xs text-gray-400">
            Used for order updates and receipts.
          </span>
        </label>
      </SpecCard>

      <SpecCard>
        <h3 className="text-base font-bold text-gray-950">Textarea</h3>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-gray-950">
            Kitchen note <span className="text-gray-400">(optional)</span>
          </span>
          <textarea
            className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-500"
            placeholder="No onions, extra spicy, etc."
          />
        </label>
      </SpecCard>

      <SpecCard>
        <h3 className="text-base font-bold text-gray-950">Selection cards</h3>
        <div className="mt-4 space-y-2">
          {(
            [
              ["Chicken", "Free", true],
              ["Beef", "+₦500", false],
              ["Fish", "+₦800", false],
            ] as [string, string, boolean][]
          ).map(([label, price, selected]) => (
            <div
              key={label}
              className={cn(
                "flex h-12 items-center justify-between rounded-2xl border px-4 text-sm",
                selected
                  ? "border-gray-950 bg-gray-950 text-white"
                  : "border-gray-200 bg-white text-gray-700",
              )}
            >
              <span className="font-semibold">{label}</span>
              <span
                className={cn(
                  "text-xs",
                  selected ? "text-white/70" : "text-gray-400",
                )}
              >
                {price}
              </span>
            </div>
          ))}
        </div>
      </SpecCard>
    </div>
  );
}

function BottomSheetExample() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <SpecCard>
        <h3 className="text-base font-bold text-gray-950">
          Reusable sheet anatomy
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            "Screen gutter remains visible on mobile.",
            "Drag handle sits above content and does not overlap media.",
            "Body scrolls naturally with bottom padding above the CTA.",
            "Fixed footer keeps the action reachable and respects safe area.",
            "Close affordance is drag/dismiss unless a flow needs explicit cancel.",
            "Title and description are semantic for screen readers.",
          ].map((rule) => (
            <div
              key={rule}
              className="rounded-[20px] border border-gray-100 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600"
            >
              {rule}
            </div>
          ))}
        </div>
      </SpecCard>

      <div className="rounded-[36px] border border-gray-200 bg-gray-200 p-3">
        <div className="overflow-hidden rounded-[32px] border border-gray-100 bg-white">
          <div className="flex justify-center pt-3">
            <div className="h-1 w-12 rounded-full bg-gray-200" />
          </div>
          <div className="p-5 pb-4">
            <div className="flex h-44 items-center justify-center rounded-3xl border border-gray-100 bg-gray-50">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-gray-200 bg-white text-2xl">
                ₦
              </div>
            </div>
            <h3 className="mt-5 text-2xl leading-[1.25] text-gray-950 [font-family:var(--font-display)]">
              Jollof Rice + Chicken
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Smoky jollof with grilled chicken and coleslaw.
            </p>
            <p className="mt-3 text-[15px] font-bold text-gray-950 [font-variant-numeric:tabular-nums]">
              ₦5,500
            </p>
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-950">
                  Protein swap
                </p>
                <Tag tone="warning">Required</Tag>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm font-semibold text-gray-700">
                Chicken <span className="float-right text-gray-400">Free</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 bg-white p-4 pb-[18px]">
            <button
              type="button"
              className="h-12 w-full rounded-full bg-gray-950 px-5 text-[15px] font-bold text-white"
            >
              Add to order · ₦5,500
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComponentMatrix({
  category,
}: {
  category?: (typeof componentSpecs)[number]["category"];
}) {
  const specs = category
    ? componentSpecs.filter((spec) => spec.category === category)
    : componentSpecs;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {specs.map((component) => (
        <SpecCard
          key={`${component.category}-${component.name}-${component.variants.join("-")}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                {component.category}
              </p>
              <h3 className="mt-2 text-base font-bold text-gray-950">
                {component.name}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                {component.purpose}
              </p>
            </div>
            <Tag tone={component.status === "stable" ? "success" : "warning"}>
              {component.status}
            </Tag>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Anatomy
              </p>
              <ul className="mt-2 space-y-1 text-xs leading-relaxed text-gray-600">
                {component.anatomy.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Accessibility
              </p>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                {component.accessibility}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {component.variants.map((variant) => (
              <Pill key={variant}>{variant}</Pill>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {component.states.map((state) => (
              <Tag key={state}>{state}</Tag>
            ))}
          </div>
          <div className="mt-4 rounded-[20px] border border-gray-100 bg-gray-50 p-3">
            <p className="text-xs font-semibold text-gray-500">Tokens</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-600">
              {component.tokens.join(" · ")}
            </p>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-red-500">
            Avoid: {component.avoid}
          </p>
        </SpecCard>
      ))}
    </div>
  );
}

function DinerFlowExamples() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <SpecCard>
        <h3 className="text-base font-bold text-gray-950">Menu item card</h3>
        <div className="mt-4 rounded-[24px] border border-gray-100 bg-white p-3">
          <div className="flex gap-3">
            <div className="flex h-24 w-24 flex-none items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 text-gray-400">
              IMG
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold leading-[1.3] text-gray-950">
                Peppered Snail
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">
                Garden snails stir-fried with scotch bonnet and peppers.
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-[15px] font-bold text-gray-950 [font-variant-numeric:tabular-nums]">
                  ₦3,500
                </p>
                <button
                  type="button"
                  className="h-9 rounded-full bg-gray-950 px-4 text-xs font-bold text-white"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </SpecCard>

      <SpecCard>
        <h3 className="text-base font-bold text-gray-950">Compact timeline</h3>
        <div className="mt-4 space-y-3">
          {[
            ["Order placed", "11:44 PM", "success"],
            ["Being prepared", "Kitchen is working on it", "warning"],
            ["Ready", "Pending", "neutral"],
            ["Served", "Pending", "neutral"],
          ].map(([label, helper, state], index) => (
            <div key={label} className="grid grid-cols-[16px_1fr] gap-3">
              <div className="relative flex justify-center">
                {index < 3 && (
                  <span className="absolute top-4 h-[calc(100%+12px)] w-px bg-gray-100" />
                )}
                <span
                  className={cn(
                    "relative mt-1 h-3 w-3 rounded-full border-2 border-white",
                    state === "success" && "bg-green-500",
                    state === "warning" && "bg-orange-500",
                    state === "neutral" && "bg-gray-200",
                  )}
                />
              </div>
              <div>
                <p
                  className={cn(
                    "text-sm font-semibold leading-tight",
                    state === "neutral" ? "text-gray-400" : "text-gray-950",
                  )}
                >
                  {label}
                </p>
                <p className="mt-0.5 text-xs leading-tight text-gray-400">
                  {helper}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SpecCard>

      <SpecCard>
        <h3 className="text-base font-bold text-gray-950">Payment method</h3>
        <div className="mt-4 space-y-2">
          {[
            ["Transfer", "Use account number", "selected"],
            ["Card", "Pay with debit card", "default"],
            ["Cash", "Pay a staff member", "default"],
          ].map(([title, helper, state]) => (
            <div
              key={title}
              className={cn(
                "rounded-[20px] border p-4",
                state === "selected"
                  ? "border-gray-950 bg-gray-950 text-white"
                  : "border-gray-100 bg-white text-gray-950",
              )}
            >
              <p className="text-sm font-bold">{title}</p>
              <p
                className={cn(
                  "mt-1 text-xs",
                  state === "selected" ? "text-white/70" : "text-gray-400",
                )}
              >
                {helper}
              </p>
            </div>
          ))}
        </div>
      </SpecCard>
    </div>
  );
}

function ComponentVariantShowcase() {
  const groups = [
    "Actions",
    "Inputs",
    "Navigation",
    "Cards",
    "Sheets",
    "Feedback",
    "Flow",
  ] as const;

  return (
    <div className="space-y-6">
      {groups.map((group) => {
        const variants = componentVariants.filter(
          (variant) => variant.group === group,
        );

        return (
          <div key={group} className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-950">{group}</h3>
            <div className="grid gap-4 lg:grid-cols-2">
              {variants.map((variant) => (
                <SpecCard key={`${variant.component}-${variant.variant}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                        {variant.component}
                      </p>
                      <h4 className="mt-2 text-base font-bold text-gray-950">
                        {variant.variant}
                      </h4>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">
                        {variant.usage}
                      </p>
                    </div>
                    <Tag
                      tone={variant.status === "stable" ? "success" : "warning"}
                    >
                      {variant.status}
                    </Tag>
                  </div>
                  {variant.exampleClassName ? (
                    <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <div
                        className={cn("inline-flex", variant.exampleClassName)}
                      >
                        {variant.component.includes("Input")
                          ? "Input"
                          : variant.component.includes("Stepper")
                            ? "-  1  +"
                            : variant.variant}
                      </div>
                    </div>
                  ) : null}
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Anatomy
                      </p>
                      <ul className="mt-2 space-y-1 text-xs leading-relaxed text-gray-600">
                        {variant.anatomy.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Accessibility
                      </p>
                      <ul className="mt-2 space-y-1 text-xs leading-relaxed text-gray-600">
                        {variant.accessibility.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {variant.states.map((state) => (
                      <Tag key={state}>{state}</Tag>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {variant.tokensUsed.map((token) => (
                      <Pill key={token}>{token}</Pill>
                    ))}
                  </div>
                  {variant.avoid ? (
                    <p className="mt-4 text-xs leading-relaxed text-red-500">
                      Avoid: {variant.avoid}
                    </p>
                  ) : null}
                </SpecCard>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ComponentCoverageTable() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white">
      {componentCoverage.map((item, index) => (
        <div
          key={item.name}
          className={cn(
            "grid gap-3 p-4 md:grid-cols-[180px_1fr_110px_110px_120px]",
            index > 0 && "border-t border-gray-100",
          )}
        >
          <div>
            <p className="text-sm font-bold text-gray-950">{item.name}</p>
            <p className="text-xs text-gray-400">{item.kind}</p>
          </div>
          <p className="break-all text-xs leading-relaxed text-gray-500">
            {item.path}
          </p>
          <Tag tone={item.documented ? "success" : "warning"}>
            {item.documented ? "documented" : "missing"}
          </Tag>
          <Tag tone={item.showcased ? "success" : "neutral"}>
            {item.showcased ? "showcased" : "not visual"}
          </Tag>
          <Tag
            tone={
              item.migrationStatus === "covered"
                ? "success"
                : item.migrationStatus === "supporting"
                  ? "neutral"
                  : "warning"
            }
          >
            {item.migrationStatus}
          </Tag>
          <p className="text-xs leading-relaxed text-gray-500 md:col-span-5">
            {item.notes}
          </p>
        </div>
      ))}
    </div>
  );
}

function PatternCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {patternStandards.map((pattern) => (
        <SpecCard key={pattern.name}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                {pattern.surface}
              </p>
              <h3 className="mt-2 text-base font-bold text-gray-950">
                {pattern.name}
              </h3>
            </div>
            <Tag tone={pattern.status === "stable" ? "success" : "warning"}>
              {pattern.status}
            </Tag>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            {pattern.standard}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {pattern.uses.map((item) => (
              <Pill key={item}>{item}</Pill>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-red-500">
            Avoid: {pattern.avoid}
          </p>
        </SpecCard>
      ))}
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-950">
      <div className="mx-auto flex w-full max-w-[1360px] gap-8 px-4 py-6 lg:px-8">
        <aside className="sticky top-6 hidden h-[calc(100vh-48px)] w-64 flex-none rounded-[28px] border border-gray-100 bg-white p-4 lg:block">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Moji system
          </p>
          <nav className="mt-4 space-y-1">
            {navigation.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="block rounded-full px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950"
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 space-y-12">
          <header
            id="overview"
            className="scroll-mt-8 rounded-[32px] border border-gray-100 bg-white p-6 md:p-8"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
              Diner ordering flow
            </p>
            <h1 className="mt-3 max-w-3xl text-[36px] leading-[1.12] text-gray-950 [font-family:var(--font-display)] md:text-[48px]">
              A diner-first design system extracted from the product.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600">
              This phase documents foundations, inputs, bottom sheets, cards,
              status patterns, fixed CTAs, and diner ordering patterns. Future
              product surfaces extend this structure after their own audits.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                "Diner first",
                "Border-first elevation",
                "Instrument Serif headings",
                "Geist controls",
                "Reusable sheets",
                "Inputs documented",
              ].map((item) => (
                <Pill key={item}>{item}</Pill>
              ))}
            </div>
          </header>

          <Section
            id="foundations"
            eyebrow="01"
            title="Foundations"
            description="The diner system uses primitive values, semantic roles, component specs, and product patterns. DINER stays the live UI migration bridge."
          >
            <div className="space-y-4">
              <TokenArchitectureCards />
              <FoundationCards />
            </div>
          </Section>

          <Section
            id="typography"
            eyebrow="02"
            title="Typography"
            description="Semantic text styles grouped like a design tool. Display and heading styles use Instrument Serif; body, labels, controls, prices, and operations stay Geist Sans."
          >
            <TypographySpecimen />
          </Section>

          <Section
            id="colors"
            eyebrow="03"
            title="Colors"
            description="A complete diner color set: neutral surfaces, black actions, warm orange, semantic status, and overlay behavior."
          >
            <ColorSwatches />
          </Section>

          <Section
            id="radius"
            eyebrow="04"
            title="Radius"
            description="Numeric radius and diner aliases with a clear parent-child hierarchy for cards, images, sheets, inputs, and pills."
          >
            <RadiusPreview />
          </Section>

          <Section
            id="spacing"
            eyebrow="05"
            title="Spacing"
            description="A 4px grid plus diner aliases for page gutters, sheet insets, fixed footers, forms, cards, and safe-area spacing."
          >
            <SpacingPreview />
          </Section>

          <Section
            id="elevation"
            eyebrow="06"
            title="Elevation and Shadows"
            description="Moji uses border-first elevation. Cards and inline surfaces use borders; shadows are reserved for sheets, modals, floating CTAs, dropdowns, and toasts."
          >
            <ElevationPreview />
          </Section>

          <Section
            id="borders"
            eyebrow="07"
            title="Borders"
            description="Borders separate surfaces without noise. Focus and error borders must be visible and paired with text when needed."
          >
            <TokenList title="Border tokens" tokens={borderTokens} />
          </Section>

          <Section
            id="motion"
            eyebrow="08"
            title="Motion"
            description="Motion is restrained and functional: fast presses, clear state changes, consistent sheet/toast transitions, and reduced-motion support."
          >
            <TokenList title="Motion tokens" tokens={motionTokens} />
          </Section>

          <Section
            id="z-index"
            eyebrow="09"
            title="Z-Index"
            description="Semantic stacking keeps fixed footers, sheets, modals, toasts, and tooltips predictable."
          >
            <TokenList title="Z-index tokens" tokens={zIndexTokens} />
          </Section>

          <Section
            id="layout"
            eyebrow="10"
            title="Layout"
            description="Layout tokens define diner content width, mobile gutters, sheet height, modal widths, fixed footer height, and safe-area behavior."
          >
            <TokenList title="Layout tokens" tokens={layoutTokens} />
          </Section>

          <Section
            id="inputs"
            eyebrow="11"
            title="Inputs"
            description="Text fields, textareas, selection cards, amount inputs, phone capture, modifier choices, and validation states are first-class diner components."
          >
            <div className="space-y-4">
              <InputExamples />
              <ComponentMatrix category="Input" />
            </div>
          </Section>

          <Section
            id="bottom-sheets"
            eyebrow="12"
            title="Bottom Sheets"
            description="Reusable sheet structure covers item details, order status, phone capture, split bill, payment success, and confirmations."
          >
            <div className="space-y-4">
              <BottomSheetExample />
              <ComponentMatrix category="Sheet" />
            </div>
          </Section>

          <Section
            id="components"
            eyebrow="13"
            title="Components"
            description="Diner controls, cards, feedback, and flow components documented with anatomy, variants, states, tokens, accessibility, and use/avoid guidance."
          >
            <div className="space-y-4">
              <DinerFlowExamples />
              <ComponentVariantShowcase />
              <ComponentCoverageTable />
              <ComponentMatrix />
            </div>
          </Section>

          <Section
            id="diner-flow"
            eyebrow="14"
            title="Diner Ordering Flow"
            description="Menu browsing, item customization, cart, live orders, bill, payment, and split bill compose from the same documented primitives."
          >
            <PatternCards />
          </Section>

          <Section
            id="audit"
            eyebrow="15"
            title="Audit"
            description="Current diner-first migration priorities and the decisions that should guide future polish."
          >
            <div className="rounded-[28px] border border-gray-100 bg-white">
              {auditFindings.map((finding, index) => (
                <div
                  key={finding.issue}
                  className={cn(
                    "grid gap-3 p-5 md:grid-cols-[44px_1fr_120px]",
                    index > 0 && "border-t border-gray-100",
                  )}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-950 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-gray-950">
                      {finding.issue}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                      Location: {finding.location}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                      Current: {finding.current}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-700">
                      Recommended: {finding.recommendation}
                    </p>
                  </div>
                  <div className="flex items-start gap-2 md:justify-end">
                    <Tag
                      tone={
                        finding.priority === "High"
                          ? "danger"
                          : finding.priority === "Medium"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {finding.priority}
                    </Tag>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section
            id="roadmap"
            eyebrow="16"
            title="Roadmap"
            description="Future modules are intentionally not fully defined yet. Each one should be audited and extracted from real UI when that module is polished."
          >
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {roadmapItems.map((item) => (
                <SpecCard key={item.module} className="p-4">
                  <Tag
                    tone={item.status === "in-progress" ? "success" : "warning"}
                  >
                    {item.status}
                  </Tag>
                  <p className="mt-3 text-sm font-bold text-gray-950">
                    Phase {item.phase}: {item.module}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.expectedExtractions.map((target) => (
                      <Pill key={target}>{target}</Pill>
                    ))}
                  </div>
                </SpecCard>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </main>
  );
}
