import { ReactNode } from "react";
import classNames from "../utils/classNames";

interface SectionProps {
  title?: string;
  children: ReactNode;
  customClass?: string;
  variant?: "default" | "bordered";
}

const Section = ({
  title,
  children,
  customClass = "",
  variant = "default",
}: SectionProps) => {
  const variantClasses = {
    default: "bg-ctp-surface0 rounded-md",
    bordered: "bg-ctp-surface0 rounded-md border border-ctp-surface2",
  };

  return (
    <section
      className={classNames("p-6", variantClasses[variant], customClass)}
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
