import { cn } from "@/lib/utils";

interface DinerInfoRowProps {
  label: string;
  value: React.ReactNode;
  emphasis?: boolean;
  className?: string;
}

export function DinerInfoRow({
  label,
  value,
  emphasis = false,
  className,
}: DinerInfoRowProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 text-sm",
        emphasis ? "text-gray-900" : "text-gray-500",
        className,
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "max-w-[60%] text-right tabular-nums",
          emphasis ? "font-bold text-gray-900" : "font-medium text-gray-900",
        )}
      >
        {value}
      </span>
    </div>
  );
}
