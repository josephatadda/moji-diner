import { cn } from "@/lib/utils";

interface DinerTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function DinerTextarea({ className, ...props }: DinerTextareaProps) {
  return (
    <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 focus-within:border-gray-300 transition-colors">
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
