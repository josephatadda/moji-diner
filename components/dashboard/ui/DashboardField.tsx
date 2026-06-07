"use client";

import * as React from "react";
import { ds } from "@/components/dashboard/ui/dashboard-tokens";
import { cn } from "@/lib/utils";

type FieldProps = {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
};

export function DashboardField({
  id,
  label,
  optional,
  hint,
  error,
  children,
}: FieldProps) {
  return (
    <div className={ds.form.field}>
      <label htmlFor={id} className={ds.input.label}>
        {label}
        {optional && (
          <span className="font-normal text-gray-400"> (optional)</span>
        )}
      </label>
      {children}
      {error ? (
        <p className={ds.input.error}>{error}</p>
      ) : hint ? (
        <p className={ds.input.hint}>{hint}</p>
      ) : null}
    </div>
  );
}

export const DashboardInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function DashboardInput({ className, ...props }, ref) {
  return (
    <input ref={ref} className={cn(ds.input.base, className)} {...props} />
  );
});

export const DashboardTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function DashboardTextarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(ds.input.textarea, className)}
      {...props}
    />
  );
});

export const DashboardSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function DashboardSelect({ className, ...props }, ref) {
  return (
    <select ref={ref} className={cn(ds.input.select, className)} {...props} />
  );
});
