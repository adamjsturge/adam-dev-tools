import { ReactNode, useEffect } from "react";
import { Link } from "wouter";
import classNames from "../utils/classNames";

interface PageShellProps {
  title: string;
  subtitle: string;
  wide?: boolean;
  actions?: ReactNode;
  children: ReactNode;
}

const PageShell = ({
  title,
  subtitle,
  wide = false,
  actions,
  children,
}: PageShellProps) => {
  useEffect(() => {
    document.title = `${title} - Dev Tools`;
  }, [title]);

  return (
    <div
      className={classNames(
        "mx-auto flex w-full flex-1 flex-col px-4 py-8",
        wide ? "max-w-7xl" : "max-w-4xl",
      )}
    >
      <Link
        href="/"
        className="text-ctp-subtext0 hover:text-ctp-text mb-4 text-sm transition-colors duration-100"
      >
        ← All tools
      </Link>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-ctp-text text-2xl font-bold">{title}</h1>
          <p className="text-ctp-subtext0 mt-1 text-sm">{subtitle}</p>
        </div>
        {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
      </div>
      {children}
    </div>
  );
};

export default PageShell;
