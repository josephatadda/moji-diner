"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { SplitLinkCard } from "./ui/SplitLinkCard";
import { Button } from "./ui/Button";
import { ArrowLeft, Users, Receipt, ShareNetwork } from "@phosphor-icons/react";
import Link from "next/link";

interface SplitPartPageProps {
  restaurantName: string;
  tableNumber: number;
  total: number;
  parts: number;
}

export function SplitPartPage({ restaurantName, tableNumber, total, parts }: SplitPartPageProps) {
  const partAmount = Math.ceil(total / parts);
  const [paidIndices, setPaidIndices] = useState<number[]>([]);

  // Simulation: Mark the "first" part as the user's part
  const userPartIndex = 1;

  const getWhatsAppText = (index: number) => {
    return `Hey! Here is your share of the bill at ${restaurantName} (Table ${tableNumber}). My part is ₦${partAmount.toLocaleString()}. Pay here: ${window.location.href}`;
  };

  return (
    <div className="bg-[var(--color-background)] min-h-screen">
      {/* Header */}
      <div className="px-[var(--space-4)] py-[var(--space-6)] bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/bill`}>
            <Button variant="icon" size="icon-sm" className="bg-[var(--color-background)]"><ArrowLeft size={16} weight="bold" /></Button>
          </Link>
          <h1 className="text-[var(--font-size-title)] font-black text-[var(--color-primary)]">Split Bill</h1>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-[var(--font-size-label)] font-bold text-[var(--color-muted)] uppercase tracking-[2px]">Total to pay</p>
            <p className="text-[var(--font-size-heading)] font-black text-[var(--color-primary)] mt-1">₦{total.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[var(--font-size-label)] font-bold text-[var(--color-muted)] uppercase tracking-[2px]">Split</p>
            <p className="text-[var(--font-size-heading)] font-black text-[var(--color-primary)] mt-1">{parts} Ways</p>
          </div>
        </div>
      </div>

      {/* Links List */}
      <div className="px-[var(--space-4)] py-[var(--space-6)] space-y-[var(--space-4)]">
        <p className="text-[var(--font-size-muted)] text-[var(--color-muted)] px-1 mb-2 font-medium">
          Share these links with your friends. They can pay their share directly from their phones.
        </p>
        
        {Array.from({ length: parts }).map((_, i) => {
          const index = i + 1;
          const isUser = index === userPartIndex;
          const isPaid = paidIndices.includes(index);

          return (
            <SplitLinkCard
              key={index}
              partIndex={index}
              amount={partAmount}
              isPaid={isPaid}
              isUser={isUser}
              link={`${window.location.origin}/pay/split/${index}`}
              whatsappText={getWhatsAppText(index)}
              onPayNow={() => setPaidIndices([...paidIndices, index])}
            />
          );
        })}
      </div>

      <div className="px-[var(--space-4)] pb-[var(--space-12)]">
        <Button variant="ghost" fullWidth leftIcon={<ShareNetwork size={20} />}>Share all links</Button>
      </div>
    </div>
  );
}
