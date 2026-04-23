"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, Copy, WhatsappLogo } from "@phosphor-icons/react";
import { Button } from "./Button";
import { useState } from "react";

interface SplitLinkCardProps {
  partIndex: number;
  amount: number;
  isPaid: boolean;
  isUser: boolean;
  link: string;
  onPayNow?: () => void;
  whatsappText: string;
}

export function SplitLinkCard({
  partIndex,
  amount,
  isPaid,
  isUser,
  link,
  onPayNow,
  whatsappText,
}: SplitLinkCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "p-[var(--space-4)] rounded-[var(--radius-lg)] border transition-all duration-300",
      isPaid ? "bg-[var(--color-success)]/5 border-[var(--color-success)]/10" : "bg-[var(--color-background)] border-[var(--color-border)] shadow-sm"
    )}>
      <div className="flex items-center justify-between mb-[var(--space-4)]">
        <div>
          <p className="text-[var(--font-size-body)] font-bold text-[var(--color-primary)]">
            {isUser ? "You" : `Part ${partIndex}`}
            {isPaid && (
              <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold text-[var(--color-success)] bg-[var(--color-success)]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Paid <CheckCircle size={10} weight="fill" />
              </span>
            )}
          </p>
          <p className="text-[var(--font-size-heading)] font-black text-[var(--color-primary)] mt-0.5">₦{amount.toLocaleString()}</p>
        </div>
      </div>
      {!isPaid && (
        <div className="flex gap-[var(--space-2)]">
          {isUser ? (
            <Button fullWidth size="sm" onClick={onPayNow}>Pay Now</Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                fullWidth 
                onClick={handleCopy}
                leftIcon={copied ? <CheckCircle size={16} weight="bold" className="text-[var(--color-success)]" /> : <Copy size={16} weight="bold" />}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                fullWidth 
                className="bg-[#25D366]/10 border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/20"
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, "_blank")}
                leftIcon={<WhatsappLogo size={16} weight="fill" />}
              >
                Share
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
