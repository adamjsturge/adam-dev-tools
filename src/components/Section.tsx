import { ReactNode } from "react";
import classNames from "../utils/classNames";

interface SectionProps {
  title?: string;
  children: ReactNode;
  customClass?: string;
  variant?: "default" | "bordered" | "elevated";
}

const Section = ({
  title,
  children,
  customClass = "",
  variant = "default",
}: SectionProps) => {
  const variantClasses = {
    default: "bg-ctp-surface0 rounded-xl shadow-lg",
    bordered: "bg-ctp-surface0 rounded-xl border-2 border-ctp-surface2",
    elevated:
      "bg-ctp-surface0 rounded-xl shadow-xl ring-1 ring-ctp-surface2/50",
  };

  return (
    <section
      className={classNames(
        "p-6 transition-all duration-200",
        variantClasses[variant],
        customClass,
      )}
    >
      {title && (
        <h2 className="text-ctp-text mb-5 text-xl font-bold tracking-tight">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
};

export default Section;
