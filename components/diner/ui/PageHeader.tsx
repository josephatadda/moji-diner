"use client";

import { ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DINER } from "./diner-tokens";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backHref?: string;
  rightAction?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  onBack,
  backHref,
  rightAction,
}: PageHeaderProps) {
  const backButton = (
    <button
      type="button"
      onClick={onBack}
      className={cn(
        DINER.iconButton,
        DINER.pressable,
        "hover:bg-gray-50 flex-none shadow-none",
      )}
    >
      <ArrowLeft size={20} weight="bold" />
    </button>
  );

  return (
    <div className="sticky top-0 z-30 mb-4 flex items-center gap-3 border-b border-gray-100/80 bg-white/95 px-4 pt-5 pb-4 backdrop-blur-sm">
      {backHref ? (
        <Link
          href={backHref}
          className={cn(
            DINER.iconButton,
            DINER.pressable,
            "hover:bg-gray-50 flex-none shadow-none",
          )}
        >
          <ArrowLeft size={20} weight="bold" />
        </Link>
      ) : onBack ? (
        backButton
      ) : null}
      <div className="flex-1 min-w-0">
        <h2 className={DINER.operationalTitle}>{title}</h2>
        {subtitle && <p className={cn(DINER.caption, "mt-1")}>{subtitle}</p>}
      </div>
      {rightAction && <div className="flex-none">{rightAction}</div>}
    </div>
  );
}
