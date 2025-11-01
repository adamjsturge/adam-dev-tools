import { InputHTMLAttributes } from "react";
import classNames from "../utils/classNames";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
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
  return (
    <div className={customClass}>
      {label && (
        <label
          htmlFor={id}
          className="text-ctp-text mb-2 block text-sm font-semibold tracking-wide"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={classNames(
          "w-full rounded-lg px-4 py-2.5 transition-all duration-200",
          "bg-ctp-surface1 text-ctp-text placeholder:text-ctp-overlay0 border-2",
          "focus:ring-offset-ctp-base focus:ring-2 focus:ring-offset-2 focus:outline-none",
          error
            ? "border-ctp-red focus:border-ctp-red focus:ring-ctp-red/50"
            : "border-ctp-surface2 hover:border-ctp-overlay0 focus:border-ctp-blue focus:ring-ctp-blue/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        {...props}
      />
      {helperText && !error && (
        <p className="text-ctp-overlay1 mt-1.5 text-xs">{helperText}</p>
      )}
      {error && (
        <p className="text-ctp-red mt-1.5 text-xs font-medium">{error}</p>
      )}
    </div>
  );
};

export default Input;
