import { Link } from "wouter";

interface ToolLinkProps {
  href: string;
  title: string;
  category?: string;
}

const ToolLink = ({ href, title }: ToolLinkProps) => {
  return (
    <Link
      href={href}
      className="group/link bg-ctp-surface0 relative block h-full overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-full p-6">
        <div className="flex h-full flex-col">
          <h3 className="text-ctp-text group-hover/link:text-ctp-mauve flex-grow text-lg font-bold transition-colors">
            {title}
          </h3>

          <div className="text-ctp-subtext0 group-hover/link:text-ctp-mauve mt-4 flex items-center gap-2 text-sm font-medium transition-all group-hover/link:gap-3">
            <span>Open</span>
            <svg
              className="h-4 w-4 transition-transform group-hover/link:translate-x-1"
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
          </div>
        </div>

        <div className="absolute top-0 left-0 h-1 w-0 transition-all duration-300 group-hover/link:w-full" />
      </div>
    </Link>
  );
};

export default ToolLink;
