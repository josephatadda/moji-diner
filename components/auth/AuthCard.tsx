"use client";

import {
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  Info,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { useState } from "react";
import {
  DashboardField,
  DashboardInput,
} from "@/components/dashboard/ui/DashboardField";
import { ds } from "@/components/dashboard/ui/dashboard-tokens";
import { cn } from "@/lib/utils";

export function MojiLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/login"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-gray-900/20",
        className,
      )}
    >
      <span className="relative flex h-7 w-7 flex-none items-center justify-center">
        <span className="absolute left-[11px] top-0 h-1.5 w-1.5 rounded-full bg-orange-500" />
        <span className="absolute right-[5px] top-[5px] h-1.5 w-1.5 rounded-full bg-red-500" />
        <span className="absolute bottom-[5px] right-[5px] h-1.5 w-1.5 rounded-full bg-purple-500" />
        <span className="absolute bottom-0 left-[11px] h-1.5 w-1.5 rounded-full bg-indigo-500" />
        <span className="absolute bottom-[5px] left-[5px] h-1.5 w-1.5 rounded-full bg-blue-500" />
        <span className="absolute left-[5px] top-[5px] h-1.5 w-1.5 rounded-full bg-yellow-500" />
      </span>
      <span className="text-[15px] font-black tracking-tight text-gray-900">
        moji
      </span>
    </Link>
  );
}

type AuthCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  compact?: boolean;
};

export function AuthCard({
  title,
  description,
  children,
  footer,
  compact,
}: AuthCardProps) {
  return (
    <div className="w-full">
      <div className={cn(compact ? "mb-6" : "mb-7")}>
        <h1
          className={cn(
            "font-normal leading-[1.05] tracking-[-0.01em] text-gray-900 [font-family:var(--font-display)]",
            compact
              ? "text-[31px] sm:text-[36px]"
              : "text-[34px] sm:text-[40px]",
          )}
        >
          {title}
        </h1>
        <p className="mt-3 max-w-[36ch] text-sm leading-6 text-gray-500">
          {description}
        </p>
      </div>
      <div className={cn(compact ? "space-y-5" : "space-y-6")}>{children}</div>
      {footer ? <div className="mt-7">{footer}</div> : null}
    </div>
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
    <div
      className={cn(
        "flex gap-3 rounded-2xl border px-3.5 py-3",
        toneClass.wrap,
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 flex-none", toneClass.icon)} />
      <div>
        {title ? <p className="text-sm font-medium">{title}</p> : null}
        <div className="text-xs leading-5 opacity-90">{children}</div>
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
          className="h-11 rounded-xl pr-10"
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
  href?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
};

const authLinkClass =
  "inline-flex items-center justify-center rounded-full text-sm font-semibold text-orange-500 underline-offset-4 transition-colors hover:text-orange-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20 disabled:pointer-events-none disabled:opacity-50";

export function AuthLink({
  href,
  children,
  className,
  onClick,
  disabled,
}: AuthLinkProps) {
  const classes = cn(authLinkClass, className);

  return href ? (
    <Link href={href} className={classes} aria-disabled={disabled}>
      {children}
    </Link>
  ) : (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}

export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center py-1">
      <div className="h-px flex-1 bg-gray-100" />
      <span className="mx-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </span>
      <div className="h-px flex-1 bg-gray-100" />
    </div>
  );
}

export function SetupStepHeader({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
        {step}
      </p>
      <h1 className="mt-3 text-[34px] font-normal leading-[1.05] text-gray-900 [font-family:var(--font-display)] sm:text-[42px]">
        {title}
      </h1>
      <p className="mt-3 max-w-[48ch] text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
}

export function SetupActionFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 -mx-5 border-t border-gray-100 bg-white/95 px-5 py-4 backdrop-blur sm:-mx-6 sm:px-6",
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {children}
      </div>
    </div>
  );
}

export function AuthSelectionCard({
  selected,
  children,
  onClick,
}: {
  selected: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full cursor-pointer items-start gap-4 rounded-2xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/15",
        selected
          ? "border-gray-900 bg-gray-50"
          : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50",
      )}
    >
      <div className="mt-0.5 flex-none">
        {selected ? (
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gray-900 text-white">
            <CheckCircle className="h-3 w-3" />
          </div>
        ) : (
          <div className="h-5 w-5 rounded-md border border-gray-200 bg-white group-hover:border-gray-300" />
        )}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </button>
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
          "h-12 text-center font-mono text-lg tracking-[0.45em] rounded-xl",
        )}
      />
    </DashboardField>
  );
}

type AuthPromoCardProps = {
  href: string;
  title: string;
  subtitle: string;
};

export function AuthPromoCard({ href, title, subtitle }: AuthPromoCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition-all hover:border-gray-200 hover:bg-gray-50"
    >
      <div className="space-y-0.5">
        <p className="text-xs font-medium text-gray-400">{title}</p>
        <p className="text-sm font-semibold text-gray-900 transition-colors group-hover:text-orange-500">
          {subtitle}
        </p>
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-400 transition-all group-hover:translate-x-1 group-hover:border-gray-200 group-hover:text-gray-900">
        <ArrowRight size={16} />
      </div>
    </Link>
  );
}

type AuthSwitchActionsProps = {
  cardHref: string;
  cardTitle: string;
  cardSubtitle: string;
  linkHref: string;
  linkLabel: string;
  linkPrefix?: string;
};

export function AuthSwitchActions({
  cardHref,
  cardTitle,
  cardSubtitle,
  linkHref,
  linkLabel,
  linkPrefix,
}: AuthSwitchActionsProps) {
  return (
    <div className="space-y-4">
      <AuthPromoCard
        href={cardHref}
        title={cardTitle}
        subtitle={cardSubtitle}
      />
      <p className="text-center text-xs text-gray-400">
        {linkPrefix ? `${linkPrefix} ` : null}
        <AuthLink
          href={linkHref}
          className="text-xs text-gray-500 hover:text-gray-900"
        >
          {linkLabel}
        </AuthLink>
      </p>
    </div>
  );
}
