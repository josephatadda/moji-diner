"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  type?: "text" | "password" | "email" | "number" | "tel" | "textarea";
}

export function Input({ label, error, icon, type = "text", className, id, ...props }: InputProps) {
  const isTextArea = type === "textarea";
  const Component = isTextArea ? "textarea" : "input";

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-[var(--font-size-label)] font-bold text-[var(--color-muted)] uppercase tracking-wider px-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] group-focus-within:text-[var(--color-primary)] transition-colors">
            {icon}
          </div>
        )}
        <Component
          id={id}
          className={cn(
            "w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--font-size-body)] placeholder:text-[var(--color-muted-fg)] focus:border-[var(--color-primary)] focus:outline-none transition-all",
            isTextArea ? "p-4 min-h-[100px] resize-none" : "h-12 px-4",
            icon && !isTextArea && "pl-11",
            error && "border-[var(--color-error)] bg-[var(--color-error)]/5",
            className
          )}
          {...(props as any)}
        />
      </div>
      {error && <p className="text-xs font-medium text-[var(--color-error)] px-1">{error}</p>}
    </div>
  );
}
