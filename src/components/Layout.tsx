import { ReactNode } from "react";
import { FaGithub } from "react-icons/fa";
import { Link } from "wouter";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
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
            className="flex-shrink-0"
          >
            <img
              height="36"
              style={{
                border: "0px",
                height: "36px",
                minWidth: "120px",
              }}
              src="https://storage.ko-fi.com/cdn/kofi6.png?v=6"
              alt="Buy Me a Coffee at ko-fi.com"
            />
          </a>
          <a
            href="https://github.com/adamjsturge/adam-dev-tools"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0"
          >
            <FaGithub size={24} />
          </a>
        </div>
      </nav>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
};

export default Layout;
