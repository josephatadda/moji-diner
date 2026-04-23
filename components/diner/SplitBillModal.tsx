"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ModalContainer } from "./ui/ModalContainer";
import { Button } from "./ui/Button";
import { ItemCard } from "./ui/ItemCard";
import { Users, User, ArrowRight, ShareNetwork, Receipt } from "@phosphor-icons/react";

interface SplitBillModalProps {
  total: number;
  restaurantName: string;
  tableNumber: number;
  onBack: () => void;
}

export function SplitBillModal({ total, restaurantName, tableNumber, onBack }: SplitBillModalProps) {
  const [splitMode, setSplitMode] = useState<"equal" | "parts" | "items" | null>(null);
  const [partCount, setPartCount] = useState(2);

  const renderInitialState = () => (
    <div className="space-y-[var(--space-4)]">
      <button 
        onClick={() => setSplitMode("equal")}
        className="w-full flex items-center gap-[var(--space-4)] p-[var(--space-4)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-left hover:border-[var(--color-primary)] transition-all group"
      >
        <div className="w-12 h-12 bg-[var(--color-background)] rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-primary)] group-hover:scale-110 transition-transform">
          <Users size={24} weight="duotone" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-[var(--color-primary)]">Split Equally</p>
          <p className="text-[var(--font-size-muted)] text-[var(--color-muted)] mt-0.5">Divide total by number of people</p>
        </div>
        <ArrowRight size={20} className="text-[var(--color-muted-fg)]" />
      </button>

      <button 
        onClick={() => setSplitMode("parts")}
        className="w-full flex items-center gap-[var(--space-4)] p-[var(--space-4)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-left hover:border-[var(--color-primary)] transition-all group"
      >
        <div className="w-12 h-12 bg-[var(--color-background)] rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-primary)] group-hover:scale-110 transition-transform">
          <Receipt size={24} weight="duotone" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-[var(--color-primary)]">Split by Parts</p>
          <p className="text-[var(--font-size-muted)] text-[var(--color-muted)] mt-0.5">Create shareable links for custom amounts</p>
        </div>
        <ArrowRight size={20} className="text-[var(--color-muted-fg)]" />
      </button>

      <Button variant="ghost" fullWidth onClick={onBack} className="mt-4">Cancel</Button>
    </div>
  );

  const renderEqualSplit = () => (
    <div className="space-y-[var(--space-8)] py-[var(--space-4)]">
      <div className="text-center space-y-2">
        <p className="text-[var(--font-size-muted)] text-[var(--color-muted)] uppercase tracking-[2px] font-bold">Amount per person</p>
        <p className="text-[var(--font-size-heading)] font-black text-[var(--color-primary)]">₦{(total / partCount).toLocaleString()}</p>
      </div>

      <div className="space-y-[var(--space-4)]">
        <p className="text-[var(--font-size-label)] font-bold text-[var(--color-muted)] uppercase tracking-wider text-center">How many people?</p>
        <div className="flex items-center justify-center gap-[var(--space-6)]">
          <Button variant="outline" size="icon-md" onClick={() => setPartCount(Math.max(2, partCount - 1))}>
            <span className="text-2xl">−</span>
          </Button>
          <span className="text-[32px] font-black text-[var(--color-primary)] w-12 text-center">{partCount}</span>
          <Button variant="outline" size="icon-md" onClick={() => setPartCount(partCount + 1)}>
            <span className="text-2xl">+</span>
          </Button>
        </div>
      </div>

      <div className="space-y-[var(--space-3)]">
        <Button fullWidth size="lg" onClick={() => window.location.href = `/bill/split-equal?parts=${partCount}`}>
          Generate Split Links
        </Button>
        <Button variant="ghost" fullWidth onClick={() => setSplitMode(null)}>Go Back</Button>
      </div>
    </div>
  );

  return (
    <ModalContainer
      isOpen={true}
      onDismiss={onBack}
      title={splitMode === "equal" ? "Split Equally" : splitMode === "parts" ? "Split by Parts" : "How to split?"}
      subtitle={splitMode ? `Total Bill: ₦${total.toLocaleString()}` : "Select a method to divide the bill"}
    >
      {splitMode === null ? renderInitialState() : 
       splitMode === "equal" ? renderEqualSplit() : 
       <div>Coming soon...</div>}
    </ModalContainer>
  );
}
