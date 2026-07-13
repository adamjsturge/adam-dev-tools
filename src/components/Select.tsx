import { SelectHTMLAttributes, useId } from "react";
import classNames from "../utils/classNames";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  customClass?: string;
  error?: string;
}

const Select = ({
  label,
  customClass = "",
  id,
  error,
  ...props
}: SelectProps) => {
  const autoId = useId();
  const selectId = id ?? autoId;
  const errorId = `${selectId}-error`;

  return (
    <div className={customClass}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-ctp-text mb-2 block text-sm font-semibold tracking-wide"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={classNames(
          "w-full rounded-md px-4 py-2.5 transition-colors duration-100",
          "bg-ctp-surface0 text-ctp-text border-2",
          "focus:ring-offset-ctp-base focus:ring-2 focus:ring-offset-2 focus:outline-none",
          error
            ? "border-ctp-red focus:border-ctp-red focus:ring-ctp-red/50"
            : "border-ctp-surface2 hover:border-ctp-overlay0 focus:border-ctp-blue focus:ring-ctp-blue/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-ctp-red mt-1.5 text-xs font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
