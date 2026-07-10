import Button from "../../components/Button";
import CopyButton from "../../components/CopyButton";
import PageShell from "../../components/PageShell";
import Section from "../../components/Section";
import Select from "../../components/Select";
import TextArea from "../../components/TextArea";
import classNames from "../../utils/classNames";
import { ExportFormat, generateUrl } from "../../utils/deckExporter";
import { parseBatchInput } from "../../utils/multiDeckParser";
import { useReactPersist } from "../../utils/Storage";

interface ProcessedDeck {
  title: string;
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
    const decks = parseBatchInput(inputContent);

    return decks.map((deck) => {
      const generated = generateUrl(deck.cards, targetFormat);
      return {
        title: deck.title,
        original: deck.original,
        generated,
        valid: deck.cards.length > 0 && generated !== "",
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

  return (
    <PageShell
      title="Multi-Deck Link Converter"
      subtitle="Batch-convert deck links and card lists to your favorite deckbuilder"
      wide
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <Section title="Input Links">
            <p className="text-ctp-subtext0 mb-4 text-sm">
              Paste your deck links or custom card lists here.
            </p>
            <TextArea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="https://gumgum.gg/deckbuilder?deck=...&#10;My Deck:&#10;4xOP01-001&#10;..."
              customClass="h-96 font-mono text-sm resize-none"
            />
          </Section>

          <Section title="Configuration">
            <Select
              id="format-select"
              label="Output Format"
              value={format}
              onChange={(e) => setFormat(e.target.value as ExportFormat)}
            >
              <option value="cardkaizoku">CardKaizoku</option>
              <option value="gumgum">GumGum</option>
              <option value="egman">Egman Events</option>
            </Select>
          </Section>
        </div>

        <Section customClass="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-ctp-text text-xl font-semibold">
              Converted Links
            </h2>
            <Button
              size="sm"
              onClick={handleOpenAll}
              disabled={validResults.length === 0}
            >
              Open All ({validResults.length})
            </Button>
          </div>

          {results.length > 0 ? (
            <div className="max-h-[calc(100vh-20rem)] space-y-4 overflow-y-auto pr-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={classNames(
                    "rounded-md border p-4",
                    result.valid
                      ? "border-ctp-surface2 bg-ctp-surface1"
                      : "border-ctp-red/30 bg-ctp-red/10",
                  )}
                >
                  <div className="text-ctp-subtext0 mb-2 truncate text-xs">
                    {result.title &&
                    result.title !== "Untitled Deck" &&
                    result.title !== "Imported Deck (Link)"
                      ? `${result.title} (${result.original.slice(0, 30)}...)`
                      : `Input: ${result.original.slice(0, 50)}...`}
                  </div>
                  {result.valid ? (
                    <div className="flex items-center gap-3">
                      <a
                        href={result.generated}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-ctp-surface2 hover:bg-ctp-surface2 text-ctp-blue hover:text-ctp-sapphire bg-ctp-surface0 block flex-1 truncate rounded-md border p-2 text-sm transition-colors duration-100"
                      >
                        {result.generated}
                      </a>
                      <CopyButton
                        text={result.generated}
                        label="Copy"
                        size="sm"
                      />
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
        </Section>
      </div>
    </PageShell>
  );
};

export default MultiDeckConverter;
