import { forwardRef, TextareaHTMLAttributes, useId } from "react";
import classNames from "../utils/classNames";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  customClass?: string;
  label?: string;
  error?: string;
  /** Grow to fill the parent flex/grid container's available height. */
  fill?: boolean;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ customClass = "", label, error, fill = false, id, ...props }, ref) => {
    const autoId = useId();
    const textAreaId = id ?? autoId;
    const errorId = `${textAreaId}-error`;

    return (
      <div
        className={classNames("flex flex-col", fill ? "min-h-0 flex-1" : "")}
      >
        {label && (
          <label
            htmlFor={textAreaId}
            className="text-ctp-text mb-2 block text-sm font-semibold tracking-wide"
          >
            {label}
          </label>
        )}
        <textarea
          id={textAreaId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          ref={ref}
          className={classNames(
            "w-full resize rounded-md px-4 py-3 font-mono text-sm transition-colors duration-100",
            "bg-ctp-surface0 text-ctp-text placeholder:text-ctp-subtext0 border-2",
            "focus:ring-offset-ctp-base focus:ring-2 focus:ring-offset-2 focus:outline-none",
            "scrollbar-thin scrollbar-thumb-ctp-overlay0 scrollbar-track-ctp-surface0",
            error
              ? "border-ctp-red focus:border-ctp-red focus:ring-ctp-red/50"
              : "border-ctp-surface2 hover:border-ctp-overlay0 focus:border-ctp-blue focus:ring-ctp-blue/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            fill ? "min-h-0 flex-1" : "",
            customClass,
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
  },
);

TextArea.displayName = "TextArea";

export default TextArea;
