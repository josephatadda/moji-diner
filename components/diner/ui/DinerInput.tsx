import { useId } from "react";
import { cn } from "@/lib/utils";
import { DINER } from "./diner-tokens";

interface DinerInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function DinerInput({
  label,
  error,
  className,
  ...props
}: DinerInputProps) {
  const generatedId = useId();
  const inputId = props.id ?? generatedId;

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className={cn(DINER.inputLabel, "mb-2 block")}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          DINER.input,
          error
            ? "border-red-300 bg-red-50 focus:border-red-500"
            : "border-gray-200",
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}
