import { cn } from "@/lib/utils";

interface DinerInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function DinerInput({ label, error, className, ...props }: DinerInputProps) {
  return (
    <div>
      {label && (
        <label className="text-sm font-semibold text-gray-700 block mb-2">{label}</label>
      )}
      <input
        className={cn(
          "w-full px-4 h-12 border rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none transition-colors bg-white",
          error
            ? "border-red-300 bg-red-50 focus:border-red-400"
            : "border-gray-200 focus:border-gray-400",
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}
