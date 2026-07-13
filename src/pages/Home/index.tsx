import { useCallback, useEffect, useRef, useState } from "react";
import ToolLink from "../../components/ToolLink";
import { fuzzySearch } from "../../utils/fuzzySearch";
import storage from "../../utils/Storage";
import { CATEGORIES, tools } from "./tools";

const EASTER_EGG_KEY = "bounty_unlocked";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [easterEggUnlocked, setEasterEggUnlocked] = useState(() => {
    const stored = storage.load(EASTER_EGG_KEY, false);
    if (stored) return true;

    const params = new URLSearchParams(globalThis.location.search);
    const urlUnlock = params.get("bounty") === "cards";
    if (urlUnlock) {
      storage.save(EASTER_EGG_KEY, true);
    }
    return urlUnlock;
  });
  const [showUnlockMessage, setShowUnlockMessage] = useState(() => {
    const params = new URLSearchParams(globalThis.location.search);
    return (
      params.get("bounty") === "cards" && !storage.load(EASTER_EGG_KEY, false)
    );
  });
  const [clickCount, setClickCount] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showUnlockMessage) {
      const timer = setTimeout(() => setShowUnlockMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showUnlockMessage]);

  const unlockEasterEgg = useCallback(() => {
    storage.save(EASTER_EGG_KEY, true);
    setEasterEggUnlocked(true);
    setShowUnlockMessage(true);
  }, []);

  const handleSearchClick = () => {
    if (easterEggUnlocked) return;

    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 5) {
      unlockEasterEgg();
      setClickCount(0);
    }
  };

  const visibleTools = tools.filter(
    (tool) => !tool.hidden || easterEggUnlocked,
  );

  const filteredTools = visibleTools.filter(
    (tool) =>
      fuzzySearch(tool.title, searchQuery, 0.4) ||
      fuzzySearch(tool.href, searchQuery, 0.4) ||
      fuzzySearch(tool.meta, searchQuery, 0.4),
  );

  return (
    <div className="flex-1">
      <div className="from-ctp-surface0 via-ctp-base to-ctp-mantle relative overflow-hidden bg-linear-to-br">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(137,180,250,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(245,194,231,0.1),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="from-ctp-blue via-ctp-mauve to-ctp-pink mb-2 bg-linear-to-r bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              Developer Tools
            </h1>
            <p className="text-ctp-subtext0 mx-auto mb-5 max-w-2xl">
              A collection of handy utilities to make your development workflow
              easier
            </p>

            <div className="relative mx-auto max-w-2xl">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                <svg
                  className="text-ctp-subtext0 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                ref={searchInputRef}
                type="search"
                aria-label="Search tools"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={handleSearchClick}
                className="border-ctp-surface2 bg-ctp-surface0 text-ctp-text placeholder:text-ctp-subtext0 focus:border-ctp-blue focus:ring-ctp-blue/20 w-full rounded-md border-2 py-3 pr-4 pl-12 transition-colors duration-100 focus:ring-4 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {showUnlockMessage && (
        <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 animate-[slideDown_0.5s_ease-out]">
          <div className="from-ctp-pink to-ctp-mauve border-ctp-pink/50 rounded-md border-2 bg-linear-to-r px-6 py-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎴</span>
              <div>
                <p className="text-ctp-base text-lg font-bold">
                  Bounty Cards Tools Unlocked!
                </p>
                <p className="text-ctp-base/90 text-sm">
                  Card game tools are now visible
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {filteredTools.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-ctp-subtext0 text-lg">
              No tools found matching your search
            </p>
          </div>
        ) : (
          CATEGORIES.map(({ key, label }) => {
            const categoryTools = filteredTools.filter(
              (tool) => tool.category === key,
            );
            if (categoryTools.length === 0) return null;

            return (
              <section key={key} className="mb-8 last:mb-0">
                <h2 className="text-ctp-subtext0 mb-3 text-sm font-semibold tracking-wider uppercase">
                  {label}
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {categoryTools.map((tool) => (
                    <ToolLink
                      key={tool.href}
                      href={tool.href}
                      title={tool.title}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Home;
