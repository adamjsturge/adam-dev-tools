import { ReactNode } from "react";
import { FaGithub } from "react-icons/fa";
// import { useReactPersist } from "../utils/Storage";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  //   const [theme, setTheme] = useReactPersist("theme", "macchiato");

  //   useEffect(() => {
  //     document.body.className = `ctp-${theme}`;
  //   }, [theme]);

  return (
    <>
      <nav className="bg-ctp-crust text-ctp-text flex items-center justify-between gap-4 p-4">
        <div className="flex-shrink-0">
          <a href="/" className="text-lg font-bold">
            Home
          </a>
        </div>
        {/* <div className="flex justify-center">
          <div className="border-ctp-overlay0 rounded border">
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-ctp-overlay0 text-ctp-text focus:border-ctp-pink focus:ring-pink w-full p-1 focus:rounded-r"
              name="colorscheme"
            >
              <option value="latte">latte</option>
              <option value="frappe">frappe</option>
              <option value="macchiato">macchiato</option>
              <option value="mocha">mocha</option>
            </select>
          </div>
        </div> */}
        <div className="flex flex-shrink-0 items-center gap-3">
          <a
            href="https://ko-fi.com/I2I2TZ4OC"
            target="_blank"
            className="flex-shrink-0"
          >
            <img
              height="36"
              style={{ border: "0px", height: "36px", minWidth: "120px" }}
              src="https://storage.ko-fi.com/cdn/kofi6.png?v=6"
              alt="Buy Me a Coffee at ko-fi.com"
            />
          </a>
          <a
            href="https://github.com/adamjsturge/dev-tools"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0"
          >
            <FaGithub size={24} />
          </a>
        </div>
      </nav>
      {children}
    </>
  );
};

export default Layout;
