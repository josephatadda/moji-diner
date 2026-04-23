"use client";

import { useState } from "react";
import { ModalContainer } from "./ui/ModalContainer";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { WhatsappLogo, User, Trophy, ArrowRight } from "@phosphor-icons/react";

interface PhoneCaptureModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string, phone: string) => void;
  onSkip: () => void;
  existingPoints?: number;
  isReturning?: boolean;
}

export function PhoneCaptureModal({
  open,
  onClose,
  onConfirm,
  onSkip,
  existingPoints = 0,
  isReturning = false,
}: PhoneCaptureModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <ModalContainer
      isOpen={open}
      onDismiss={onClose}
      title={isReturning ? "Welcome back!" : "Join Moji Rewards"}
      subtitle={isReturning ? "Confirm your details to earn points on this order." : "Earn loyalty points and get your receipt on WhatsApp."}
    >
      <div className="space-y-[var(--space-6)] py-[var(--space-2)]">
        {/* Loyalty Perk Card */}
        <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-muted-fg)] rounded-[var(--radius-lg)] p-[var(--space-4)] text-[var(--color-background)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[var(--color-background)]/20 rounded-full flex items-center justify-center">
              <Trophy size={20} weight="fill" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Current Balance</p>
              <p className="text-[var(--font-size-heading)] font-black leading-none">{existingPoints.toLocaleString()} Points</p>
            </div>
          </div>
          <p className="text-[var(--font-size-muted)] opacity-80 leading-relaxed">
            You're only 250 points away from a <span className="font-bold underline">Free Drink</span> at this restaurant!
          </p>
        </div>

        <div className="space-y-[var(--space-4)]">
          <Input 
            label="Your Name"
            placeholder="e.g. John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<User size={20} />}
          />
          <Input 
            label="WhatsApp Number"
            placeholder="0801 234 5678"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={<WhatsappLogo size={20} weight="fill" className="text-[#25D366]" />}
          />
        </div>

        <div className="pt-[var(--space-2)] space-y-[var(--space-3)]">
          <Button 
            fullWidth 
            size="lg" 
            disabled={!name || phone.length < 10} 
            onClick={() => onConfirm(name, phone)}
            rightIcon={<ArrowRight size={20} weight="bold" />}
          >
            Continue to Order
          </Button>
          <Button variant="ghost" fullWidth onClick={onSkip}>
            Skip for now
          </Button>
        </div>

        <p className="text-[var(--font-size-muted)] text-[var(--color-muted)] text-center px-4">
          By continuing, you agree to receive order updates and receipts via WhatsApp.
        </p>
      </div>
    </ModalContainer>
  );
}
