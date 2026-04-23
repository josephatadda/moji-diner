"use client";

import { cn } from "@/lib/utils";
import { Check } from "@phosphor-icons/react";

interface TimelineStep {
  label: string;
  timestamp: string;
  state: "completed" | "active" | "pending";
}

interface StatusTimelineProps {
  steps: TimelineStep[];
}

export function StatusTimeline({ steps }: StatusTimelineProps) {
  return (
    <div className="relative pl-[var(--space-8)] space-y-[var(--space-8)] py-[var(--space-2)]">
      <div className="absolute left-[var(--space-3)] top-[var(--space-4)] bottom-[var(--space-4)] w-0.5 bg-[var(--color-border)]" />
      {steps.map((step, i) => (
        <div key={i} className="relative flex items-center gap-[var(--space-4)]">
          <div className={cn(
            "absolute -left-[var(--space-8)] translate-x-px w-6 h-6 rounded-full border-[3px] border-[var(--color-background)] flex items-center justify-center shadow-sm transition-all duration-500",
            step.state === "completed" ? "bg-[var(--color-success)]" : 
            step.state === "active" ? "bg-[var(--color-warning)] animate-pulse" : 
            "bg-[var(--color-border)]"
          )}>
            {step.state === "completed" && <Check size={10} weight="bold" className="text-[var(--color-background)]" />}
            {step.state === "active" && <div className="w-1.5 h-1.5 bg-[var(--color-background)] rounded-full" />}
          </div>
          <div>
            <p className={cn(
              "text-[var(--font-size-body)] font-bold transition-colors",
              step.state === "pending" ? "text-[var(--color-muted-fg)]" : "text-[var(--color-primary)]"
            )}>
              {step.label}
            </p>
            <p className="text-[var(--font-size-muted)] text-[var(--color-muted)] mt-0.5">{step.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
