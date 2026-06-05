import { ds } from "./dashboard-tokens";

/**
 * Shared dashboard toggle switch. Border-first, token-backed (ds.toggle.*).
 * Single source for every on/off control across the dashboard — replaces the
 * inline ToggleSwitch copies (settings, menu item form, etc.).
 */
interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  /** Accessible label describing what the toggle controls */
  ariaLabel?: string;
  disabled?: boolean;
}

export function Toggle({
  checked,
  onChange,
  ariaLabel,
  disabled,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onChange}
      className={ds.toggle.track(checked)}
    >
      <span className={ds.toggle.thumb} />
    </button>
  );
}
