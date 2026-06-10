"use client";

import { CaretDown } from "@phosphor-icons/react";
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
>(function DashboardSelect({ className, children, ...props }, ref) {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        className={cn(
          ds.input.select,
          "appearance-none pr-10 pl-3 cursor-pointer",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400">
        <CaretDown size={14} weight="bold" />
      </div>
    </div>
  );
});
