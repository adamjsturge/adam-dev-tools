import { forwardRef, TextareaHTMLAttributes } from "react";
import classNames from "../utils/classNames";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  customClass?: string;
  label?: string;
  error?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ customClass = "", label, error, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="text-ctp-text mb-2 block text-sm font-semibold tracking-wide">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={classNames(
            "w-full resize rounded-lg px-4 py-3 font-mono text-sm transition-all duration-200",
            "bg-ctp-surface0 text-ctp-text placeholder:text-ctp-overlay0 border-2",
            "focus:ring-offset-ctp-base focus:ring-2 focus:ring-offset-2 focus:outline-none",
            "scrollbar-thin scrollbar-thumb-ctp-overlay0 scrollbar-track-ctp-surface0",
            error
              ? "border-ctp-red focus:border-ctp-red focus:ring-ctp-red/50"
              : "border-ctp-surface2 hover:border-ctp-overlay0 focus:border-ctp-blue focus:ring-ctp-blue/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            customClass,
          )}
          {...props}
        />
        {error && (
          <p className="text-ctp-red mt-1.5 text-xs font-medium">{error}</p>
        )}
      </div>
    );
  },
);

TextArea.displayName = "TextArea";

export default TextArea;
