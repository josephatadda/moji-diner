import { cn } from "@/lib/utils";

interface FixedActionBarProps {
  children: React.ReactNode;
  className?: string;
}

export function FixedActionBar({ children, className }: FixedActionBarProps) {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 space-y-2 border-t border-gray-100 bg-white/95 px-4 pb-[calc(18px+env(safe-area-inset-bottom))] pt-3 backdrop-blur",
        className,
      )}
    >
      {children}
    </div>
  );
}
