import { Link } from "wouter";
import { preloadRoute } from "../routes";

interface ToolLinkProps {
  href: string;
  title: string;
}

const ToolLink = ({ href, title }: ToolLinkProps) => {
  const handlePreload = () => preloadRoute(href);

  return (
    <Link
      href={href}
      onMouseEnter={handlePreload}
      onFocus={handlePreload}
      onTouchStart={handlePreload}
      className="group/link bg-ctp-surface0 hover:bg-ctp-surface1 flex h-full items-center justify-between gap-3 rounded-md px-4 py-3 transition-colors duration-100"
    >
      <span className="text-ctp-text group-hover/link:text-ctp-blue font-semibold transition-colors duration-100">
        {title}
      </span>
      <svg
        className="text-ctp-subtext0 group-hover/link:text-ctp-blue h-4 w-4 shrink-0 transition-colors duration-100"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  );
};

export default ToolLink;
