import { cn } from "@/lib/utils";
import { DINER } from "./diner-tokens";

interface DinerTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function DinerTextarea({ className, ...props }: DinerTextareaProps) {
  return (
    <div className={cn(DINER.fieldShell, "p-3")}>
      <textarea
        className={cn(
          "w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none resize-none",
          className,
        )}
        {...props}
      />
    </div>
  );
}
