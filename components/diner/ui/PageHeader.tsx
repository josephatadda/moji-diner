"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backHref?: string;
  rightAction?: React.ReactNode;
}

export function PageHeader({ title, subtitle, onBack, backHref, rightAction }: PageHeaderProps) {
  const backButton = (
    <button
      onClick={onBack}
      className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors flex-none"
    >
      <ArrowLeft size={20} weight="bold" />
    </button>
  );

  return (
    <div className="flex items-center gap-3 px-4 pt-6 pb-2 mb-4">
      {backHref ? (
        <Link
          href={backHref}
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors flex-none"
        >
          <ArrowLeft size={20} weight="bold" />
        </Link>
      ) : onBack ? (
        backButton
      ) : null}
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {rightAction && <div className="flex-none">{rightAction}</div>}
    </div>
  );
}
