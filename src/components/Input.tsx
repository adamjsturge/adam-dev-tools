import { ComponentProps, useId } from "react";
import classNames from "../utils/classNames";

interface InputProps extends ComponentProps<"input"> {
  label?: string;
  customClass?: string;
  error?: string;
  helperText?: string;
}

const Input = ({
  label,
  customClass = "",
  id,
  error,
  helperText,
  ...props
}: InputProps) => {
  const autoId = useId();
  const inputId = id ?? autoId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  return (
    <div className={customClass}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-ctp-text mb-2 block text-sm font-semibold tracking-wide"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={classNames(
          "w-full rounded-md px-4 py-2.5 transition-colors duration-100",
          "bg-ctp-surface0 text-ctp-text placeholder:text-ctp-subtext0 border-2",
          "focus:ring-offset-ctp-base focus:ring-2 focus:ring-offset-2 focus:outline-none",
          error
            ? "border-ctp-red focus:border-ctp-red focus:ring-ctp-red/50"
            : "border-ctp-surface2 hover:border-ctp-overlay0 focus:border-ctp-blue focus:ring-ctp-blue/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        {...props}
      />
      {helperText && !error && (
        <p id={helperId} className="text-ctp-subtext0 mt-1.5 text-xs">
          {helperText}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-ctp-red mt-1.5 text-xs font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
