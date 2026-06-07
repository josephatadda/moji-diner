"use client";

import { CheckCircle, Eye, EyeOff, Info, XCircle } from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { useState } from "react";
import {
  DashboardField,
  DashboardInput,
} from "@/components/dashboard/ui/DashboardField";
import { ds } from "@/components/dashboard/ui/dashboard-tokens";
import { cn } from "@/lib/utils";

type AuthCardProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthCard({
  eyebrow = "Dashboard access",
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-500">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
      </div>
      {children}
      {footer ? (
        <div className="mt-6 border-t border-gray-100 pt-5">{footer}</div>
      ) : null}
    </section>
  );
}

type AuthNoticeProps = {
  tone?: "info" | "success" | "error";
  title?: string;
  children: React.ReactNode;
};

const noticeTone = {
  info: {
    wrap: "border-blue-100 bg-blue-50 text-blue-700",
    icon: "text-blue-600",
    Icon: Info,
  },
  success: {
    wrap: "border-green-100 bg-green-50 text-green-700",
    icon: "text-green-600",
    Icon: CheckCircle,
  },
  error: {
    wrap: "border-red-100 bg-red-50 text-red-600",
    icon: "text-red-500",
    Icon: XCircle,
  },
} as const;

export function AuthNotice({
  tone = "info",
  title,
  children,
}: AuthNoticeProps) {
  const toneClass = noticeTone[tone];
  const Icon = toneClass.Icon;

  return (
    <div className={cn("flex gap-3 rounded-xl border p-3", toneClass.wrap)}>
      <Icon className={cn("mt-0.5 h-4 w-4 flex-none", toneClass.icon)} />
      <div>
        {title ? <p className="text-sm font-semibold">{title}</p> : null}
        <div className="text-xs leading-5">{children}</div>
      </div>
    </div>
  );
}

type PasswordFieldProps = {
  id: string;
  label: string;
  labelAction?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
};

export function PasswordField({
  id,
  label,
  labelAction,
  value,
  onChange,
  placeholder = "Enter password",
  hint,
  error,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className={ds.input.label}>
          {label}
        </label>
        {labelAction}
      </div>
      <div className="relative">
        <DashboardInput
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required
          className="pr-10"
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error ? (
        <p className={ds.input.error}>{error}</p>
      ) : hint ? (
        <p className={ds.input.hint}>{hint}</p>
      ) : null}
    </div>
  );
}

type AuthLinkProps = {
  href: string;
  children: React.ReactNode;
};

export function AuthLink({ href, children }: AuthLinkProps) {
  return (
    <Link
      href={href}
      className="text-sm font-semibold text-orange-500 transition-colors hover:text-orange-600"
    >
      {children}
    </Link>
  );
}

type PinInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function PinInput({ value, onChange, error }: PinInputProps) {
  return (
    <DashboardField id="pin" label="Staff PIN" error={error}>
      <input
        id="pin"
        value={value}
        onChange={(event) =>
          onChange(event.target.value.replace(/\D/g, "").slice(0, 4))
        }
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="0000"
        required
        className={cn(
          ds.input.base,
          "h-12 text-center font-mono text-lg tracking-[0.45em]",
        )}
      />
    </DashboardField>
  );
}
