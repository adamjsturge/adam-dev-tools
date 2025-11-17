import { useCallback, useEffect, useRef, useState } from "react";
import ToolLink from "../../components/ToolLink";
import { fuzzySearch } from "../../utils/fuzzySearch";
import storage from "../../utils/Storage";

interface Tool {
  href: string;
  title: string;
  desc?: string;
  meta: string;
  category: string;
  hidden?: boolean;
}

const tools: Tool[] = [
  {
    href: "/base64/encode",
    title: "Base64 Encode",
    meta: "encode,base64,tool",
    category: "encoding",
  },
  {
    href: "/base64/decode",
    title: "Base64 Decode",
    meta: "decode,base64,tool",
    category: "encoding",
  },
  {
    href: "/qr-code",
    title: "QR Code Generator",
    meta: "qr,code,tool",
    category: "encoding",
  },
  {
    href: "/qr-code/scan",
    title: "QR Code Scanner",
    meta: "qr,code,scan,tool",
    category: "encoding",
  },
  {
    href: "/url/encode",
    title: "URL Encode",
    meta: "encode,url,tool",
    category: "encoding",
  },
  {
    href: "/url/decode",
    title: "URL Decode",
    meta: "decode,url,tool",
    category: "encoding",
  },
  {
    href: "/webp",
    title: "WebP Converter",
    meta: "webp,convert,tool",
    category: "media",
  },
  // {
  //   href: "/background-removal",
  //   title: "Background Removal",
  //   meta: "background,remove,ai,transparent,png,tool",
  //   category: "media",
  // },
  {
    href: "/color-background-removal",
    title: "Color Background Removal",
    meta: "color,background,remove,magic,wand,eraser,dropper,picker,transparent,png,tool",
    category: "media",
  },
  {
    href: "/textbin",
    title: "TextBin",
    meta: "text,bin,tool",
    category: "text",
  },
  {
    href: "/extra-line-removal",
    title: "Extra Line Removal",
    meta: "text,whitespace,lines,tool",
    category: "text",
  },
  {
    href: "/word-counter",
    title: "Word Counter",
    meta: "word,count,tool",
    category: "text",
  },
  {
    href: "/unzip",
    title: "Unzip Files",
    meta: "unzip,extract,zip,tool",
    category: "utilities",
  },
  {
    href: "/deck-draw-odds",
    title: "Deck Draw Odds",
    meta: "deck,cards,probability,odds,tool",
    category: "games",
  },
  {
    href: "/card-assumption",
    title: "Card Assumption",
    meta: "cards,probability,assumption,tool",
    category: "games",
  },
  {
    href: "/sim-code-converter",
    title: "Sim Code Converter",
    meta: "sim,code,convert,tool,one-piece-tcg,otcg",
    category: "utilities",
    hidden: true,
  },
  {
    href: "/deckbuilder-links",
    title: "Deckbuilder Links",
    meta: "deck,deckbuilder,links,egman,cardkaizoku,gumgum,tool,one-piece-tcg,otcg",
    category: "games",
    hidden: true,
  },
  {
    href: "/compare",
    title: "Text Compare",
    meta: "text,compare,diff,tool",
    category: "text",
  },
  {
    href: "/ev-charging",
    title: "EV Charging",
    meta: "ev,charging,tool",
    category: "utilities",
  },
  {
    href: "/opacifier",
    title: "Opacifier",
    // desc: "Get hex codes for disabled buttons and more",
    meta: "color,opacity,alpha,hex,rgba,transparency,tool",
    category: "design",
  },
  {
    href: "/jwt",
    title: "JWT Debugger",
    meta: "jwt,json,web,token,decode,debug,auth,tool",
    category: "encoding",
  },
];

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
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="from-ctp-surface0 via-ctp-base to-ctp-mantle relative overflow-hidden bg-linear-to-br">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(137,180,250,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(245,194,231,0.1),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="from-ctp-blue via-ctp-mauve to-ctp-pink mb-4 bg-linear-to-r bg-clip-text text-5xl font-bold text-transparent sm:text-6xl">
              Developer Tools
            </h1>
            <p className="text-ctp-subtext0 mx-auto mb-8 max-w-2xl text-lg">
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
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={handleSearchClick}
                className="border-ctp-surface2 bg-ctp-surface0 text-ctp-text placeholder:text-ctp-subtext0 focus:border-ctp-mauve focus:ring-ctp-mauve/20 w-full rounded-xl border-2 py-4 pr-4 pl-12 shadow-lg transition-all duration-200 focus:ring-4 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {showUnlockMessage && (
        <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 animate-[slideDown_0.5s_ease-out]">
          <div className="from-ctp-pink to-ctp-mauve border-ctp-pink/50 rounded-xl border-2 bg-linear-to-r px-6 py-4 shadow-2xl backdrop-blur-sm">
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

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {filteredTools.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-ctp-subtext0 text-lg">
              No tools found matching your search
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTools.map((tool) => (
              <div key={tool.href} className="group relative">
                <div className="bg-ctp-mauve absolute -inset-0.5 rounded-2xl opacity-0 blur transition duration-300 group-hover:opacity-20" />
                <ToolLink
                  href={tool.href}
                  title={tool.title}
                  category={tool.category}
                  desc={tool.desc}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
