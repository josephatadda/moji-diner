"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "icon" | "danger";
  size?: "sm" | "md" | "lg" | "icon-xs" | "icon-sm" | "icon-md";
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-[var(--color-primary)] text-[var(--color-background)] hover:opacity-90 active:scale-[0.98]",
    outline: "bg-transparent border border-[var(--color-border)] text-[var(--color-primary)] hover:bg-[var(--color-surface)] active:scale-[0.98]",
    ghost: "bg-transparent text-[var(--color-muted-fg)] hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)]",
    icon: "bg-transparent p-0 flex items-center justify-center rounded-full hover:bg-[var(--color-surface)]",
    danger: "bg-[var(--color-error)] text-white hover:opacity-90 active:scale-[0.98]",
  };

  const sizes = {
    sm: "h-9 px-4 text-[var(--font-size-muted)] font-bold rounded-[var(--radius-md)]",
    md: "h-12 px-6 text-[var(--font-size-body)] font-bold rounded-[var(--radius-lg)]",
    lg: "h-14 px-8 text-[var(--font-size-heading)] font-black rounded-[var(--radius-lg)]",
    "icon-xs": "w-7 h-7",
    "icon-sm": "w-10 h-10",
    "icon-md": "w-12 h-12",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus:outline-none",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Spinner className="w-5 h-5" />
      ) : (
        <>
          {leftIcon && <span className="flex-none">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-none">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
