import { ReactNode } from "react";
import { FaGithub } from "react-icons/fa";
import { Link } from "wouter";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="bg-ctp-blue text-ctp-base sr-only z-50 rounded-md px-4 py-2 font-semibold focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to main content
      </a>
      <nav className="bg-ctp-crust text-ctp-text flex items-center justify-between gap-4 p-4">
        <div className="flex-shrink-0">
          <Link href="/" className="text-lg font-bold">
            Home
          </Link>
        </div>
        <div className="flex flex-shrink-0 items-center gap-3">
          <a
            href="https://ko-fi.com/I2I2TZ4OC"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0"
          >
            <img
              src="https://storage.ko-fi.com/cdn/kofi6.png?v=6"
              alt="Buy Me a Coffee at ko-fi.com"
              width="143"
              height="36"
              className="h-9 w-auto min-w-[120px]"
            />
          </a>
          <a
            href="https://github.com/adamjsturge/adam-dev-tools"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
            className="flex-shrink-0"
          >
            <FaGithub size={24} />
          </a>
        </div>
      </nav>
      <main id="main-content" className="flex flex-1 flex-col">
        {children}
      </main>
    </div>
  );
};

export default Layout;
