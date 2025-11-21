import TextArea from "../../components/TextArea";
import classNames from "../../utils/classNames";
import { ExportFormat, generateUrl } from "../../utils/deckExporter";
import { processInput } from "../../utils/deckImporter";
import { useReactPersist } from "../../utils/Storage";

interface ProcessedDeck {
  original: string;
  generated: string;
  valid: boolean;
}

const MultiDeckConverter = () => {
  const [content, setContent] = useReactPersist(
    "multi-deck-converter-content",
    "",
  );
  const [format, setFormat] = useReactPersist<ExportFormat>(
    "multi-deck-converter-format",
    "cardkaizoku",
  );

  const processLinks = (
    inputContent: string,
    targetFormat: ExportFormat,
  ): ProcessedDeck[] => {
    const lines = inputContent.split("\n").filter((line) => line.trim());

    return lines.map((line) => {
      const cards = processInput(line);
      const generated = generateUrl(cards, targetFormat);
      return {
        original: line,
        generated,
        valid: cards.length > 0 && generated !== "",
      };
    });
  };

  const results = processLinks(content, format);
  const validResults = results.filter((r) => r.valid);

  const handleOpenAll = () => {
    for (const result of validResults) {
      window.open(result.generated, "_blank");
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      console.error("Failed to copy to clipboard");
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto max-w-7xl px-6 pt-8 pb-6">
        <h1 className="text-ctp-text mb-8 text-3xl font-bold">
          Multi-Deck Link Converter
        </h1>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="bg-ctp-surface0 rounded-xl p-6 shadow-lg">
              <h2 className="text-ctp-text mb-4 text-xl font-semibold">
                Input Links
              </h2>
              <p className="text-ctp-subtext0 mb-4 text-sm">
                Paste your deck links here (one per line). Supports One Piece
                Top Decks, Egman Events, GumGum, and CardKaizoku.
              </p>
              <TextArea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="https://gumgum.gg/deckbuilder?deck=...&#10;https://deckbuilder.egmanevents.com/?deck=..."
                customClass="h-96 font-mono text-sm resize-none"
              />
            </div>

            <div className="bg-ctp-surface0 rounded-xl p-6 shadow-lg">
              <h2 className="text-ctp-text mb-4 text-xl font-semibold">
                Configuration
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="format-select"
                    className="text-ctp-text mb-2 block text-sm font-medium"
                  >
                    Output Format
                  </label>
                  <select
                    id="format-select"
                    value={format}
                    onChange={(e) => setFormat(e.target.value as ExportFormat)}
                    className="border-ctp-surface2 bg-ctp-base text-ctp-text focus:border-ctp-mauve focus:ring-ctp-mauve/20 w-full rounded-lg border p-2.5 shadow-sm transition-all focus:ring-4 focus:outline-none"
                  >
                    <option value="cardkaizoku">CardKaizoku</option>
                    <option value="gumgum">GumGum</option>
                    <option value="egman">Egman Events</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-ctp-surface0 flex flex-col rounded-xl p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-ctp-text text-xl font-semibold">
                Converted Links
              </h2>
              <button
                onClick={handleOpenAll}
                disabled={validResults.length === 0}
                className={classNames(
                  "rounded px-4 py-2 text-sm transition-colors",
                  validResults.length > 0
                    ? "bg-ctp-green hover:bg-ctp-teal text-ctp-base font-bold"
                    : "bg-ctp-surface2 text-ctp-subtext0 cursor-not-allowed",
                )}
              >
                Open All ({validResults.length})
              </button>
            </div>

            {results.length > 0 ? (
              <div className="max-h-[calc(100vh-20rem)] space-y-4 overflow-y-auto pr-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={classNames(
                      "rounded-lg border p-4",
                      result.valid
                        ? "border-ctp-surface2 bg-ctp-surface1"
                        : "border-ctp-red/30 bg-ctp-red/10",
                    )}
                  >
                    <div className="text-ctp-subtext0 mb-2 truncate text-xs">
                      Input: {result.original}
                    </div>
                    {result.valid ? (
                      <div className="flex items-center gap-3">
                        <a
                          href={result.generated}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border-ctp-surface2 hover:bg-ctp-surface2 text-ctp-blue hover:text-ctp-sapphire bg-ctp-surface0 block flex-1 truncate rounded border p-2 text-sm transition-colors"
                        >
                          {result.generated}
                        </a>
                        <button
                          onClick={() => copyToClipboard(result.generated)}
                          className="bg-ctp-surface2 hover:bg-ctp-overlay0 text-ctp-text rounded p-2 text-sm transition-colors"
                          title="Copy Link"
                        >
                          📋
                        </button>
                      </div>
                    ) : (
                      <div className="text-ctp-red text-sm">
                        Invalid link or unable to parse deck
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                <div className="text-ctp-overlay0 mb-4 text-5xl">🔗</div>
                <p className="text-ctp-subtext0">
                  Paste links on the left to see converted results here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default MultiDeckConverter;
