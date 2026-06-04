"use client";

import { Trophy } from "@phosphor-icons/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { BottomSheet } from "./ui/BottomSheet";
import { DinerFeedbackCard } from "./ui/DinerFeedbackCard";
import { DinerIconBadge } from "./ui/DinerIconBadge";
import { DINER } from "./ui/diner-tokens";

interface PhoneCaptureModalProps {
  open: boolean;
  onClose: () => void;
  onSkip: () => void;
  onConfirm: (name: string, phone: string) => void;
  isReturning?: boolean;
  existingPoints?: number;
}

export function PhoneCaptureModal({
  open,
  onClose,
  onSkip,
  onConfirm,
  isReturning,
  existingPoints,
}: PhoneCaptureModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const validate = (value: string) => {
    setError("");
    const digits = value.replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("0")) return true;
    if (digits.length === 10) return true;
    return false;
  };

  const handleConfirm = () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!validate(phone)) {
      setError("Enter a valid Nigerian phone number (e.g. 0801 234 5678)");
      return;
    }
    onConfirm(name, phone);
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      accessibilityTitle="Earn Loyalty Points"
      header={
        <div className="flex flex-col items-center text-center">
          <DinerIconBadge
            icon={Trophy}
            tone="warning"
            size="md"
            className="mb-4"
          />
          <h2 className={cn(DINER.sheetTitle, "mb-2")}>Earn Loyalty Points</h2>
          <p className={cn(DINER.body, "leading-relaxed")}>
            Drop your name and phone number to earn points on this order — and
            every visit.
          </p>
        </div>
      }
      footer={
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleConfirm}
            className={cn("w-full", DINER.primaryCta, DINER.ctaPress)}
          >
            Earn Points & Place Order
          </button>

          <button
            type="button"
            onClick={() => {
              onSkip();
              onClose();
            }}
            className="w-full py-3 text-gray-500 font-medium text-sm hover:text-gray-700 transition-colors"
          >
            Skip — Place order without points
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {isReturning && existingPoints !== undefined && (
          <DinerFeedbackCard
            title="Welcome back!"
            description={`You have ${existingPoints.toLocaleString()} points · Silver tier`}
            icon={Trophy}
            tone="warning"
          />
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="loyalty-name"
              className={cn(DINER.inputLabel, "block mb-2")}
            >
              Your name
            </label>
            <input
              id="loyalty-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tunde"
              className={DINER.input}
            />
          </div>

          <div>
            <label
              htmlFor="loyalty-phone"
              className={cn(DINER.inputLabel, "block mb-2")}
            >
              Your phone number
            </label>
            <input
              id="loyalty-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0801 234 5678"
              className={cn(DINER.input, error && "border-red-300 bg-red-50")}
            />
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
