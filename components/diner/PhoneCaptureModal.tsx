"use client";

import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { Trophy } from "@phosphor-icons/react";

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
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent>
        <DrawerHeader className="px-5 pt-8 pb-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-orange-600">
            <span className="text-2xl"><Trophy /></span>
          </div>
          <DrawerTitle className="text-2xl font-bold text-gray-900 mb-2">
            Earn Loyalty Points
          </DrawerTitle>
          <DrawerDescription className="text-sm text-gray-500 leading-relaxed">
            Drop your name and phone number to earn points on this order — and every visit.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-5 pb-8 space-y-6">
          {isReturning && existingPoints !== undefined && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-center gap-3">
              <span className="text-2xl text-orange-600"><Trophy /></span>
              <div>
                <p className="font-semibold text-orange-800 text-sm">Welcome back!</p>
                <p className="text-xs text-orange-600 mt-0.5">
                  You have {existingPoints.toLocaleString()} points · Silver tier
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tunde"
                className="w-full px-4 h-12 border border-gray-200 rounded-xl text-base focus:border-gray-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your phone number
              </label>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0801 234 5678"
                className={cn(
                  "w-full px-4 h-12 border rounded-xl text-base focus:outline-none transition-colors",
                  error ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-gray-400"
                )}
              />
              {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleConfirm}
              className="w-full h-12 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-700 active:scale-[0.97] transition-all ease-out"
            >
              Earn Points & Place Order
            </button>

            <button
              onClick={() => { onSkip(); onClose(); }}
              className="w-full py-3 text-gray-500 font-medium text-sm hover:text-gray-700 transition-colors"
            >
              Skip — Place order without points
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
