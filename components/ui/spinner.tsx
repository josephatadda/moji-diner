import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

function Spinner({ className, strokeWidth, ...props }: React.ComponentProps<"svg">) {
  return (
    <HugeiconsIcon
      icon={Loading03Icon}
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      strokeWidth={strokeWidth ? Number(strokeWidth) : undefined}
      {...props as any}
    />
  );
}

export { Spinner };
