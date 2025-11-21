import { useEffect } from "react";
import TextArea from "../../components/TextArea";
import {
  generateCardkaizokuUrl,
  generateEgmanUrl,
  generateGumgumUrl,
} from "../../utils/deckExporter";
import { processInput } from "../../utils/deckImporter";
import { normalizeSimCodes } from "../../utils/simCodes";
import { useReactPersist } from "../../utils/Storage";

interface GeneratedLinks {
  gumgum: string;
  egman: string;
  cardkaizoku: string;
}

const DeckbuilderLinks = () => {
  const [content, setContent] = useReactPersist(
    "deckbuilder-links-content",
    "",
  );
  const [generatedLinks, setGeneratedLinks] = useReactPersist<GeneratedLinks>(
    "deckbuilder-generated-links",
    {
      gumgum: "",
      egman: "",
      cardkaizoku: "",
    },
  );

  useEffect(() => {
    if (content) {
      generateLinks(content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateLinks = (normalizedContent: string) => {
    const cards = processInput(normalizedContent);

    setGeneratedLinks({
      gumgum: generateGumgumUrl(cards),
      egman: generateEgmanUrl(cards),
      cardkaizoku: generateCardkaizokuUrl(cards),
    });
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    const normalized = normalizeSimCodes(newContent);
    setContent(normalized);

    if (normalized === "") {
      setGeneratedLinks({ gumgum: "", egman: "", cardkaizoku: "" });
    } else {
      generateLinks(normalized);
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
          Deckbuilder Links Generator
        </h1>

        <div className="grid gap-8 lg:grid-cols-3 xl:grid-cols-5">
          <div className="lg:col-span-1 xl:col-span-2">
            <div className="bg-ctp-surface0 rounded-xl p-6 shadow-lg">
              <h2 className="text-ctp-text mb-4 text-xl font-semibold">
                Deck List Input
              </h2>
              <p className="text-ctp-subtext0 mb-4 text-sm">
                Paste your sim deck list here (format: 1xOP12-001, 4xOP01-016,
                etc.)
              </p>
              <TextArea
                value={content}
                onChange={handleInput}
                placeholder="1xOP12-001&#10;4xOP01-016&#10;4xOP03-008&#10;4xOP12-006&#10;4xOP12-014&#10;4xST01-011&#10;2xOP01-025&#10;4xOP10-005&#10;2xEB01-003&#10;4xOP12-015&#10;3xOP12-016&#10;4xOP12-017&#10;4xOP12-018&#10;3xOP12-019&#10;2xOP06-018&#10;2xST21-017"
                customClass="h-96 font-mono text-sm resize-none"
              />
            </div>
          </div>

          <div className="lg:col-span-2 xl:col-span-3">
            <div className="bg-ctp-surface0 rounded-xl p-6 shadow-lg">
              <h2 className="text-ctp-text mb-4 text-xl font-semibold">
                Generated Links
              </h2>
              {generatedLinks.gumgum ||
              generatedLinks.egman ||
              generatedLinks.cardkaizoku ? (
                <div className="space-y-6">
                  {generatedLinks.gumgum && (
                    <div className="border-ctp-surface2 bg-ctp-surface1 rounded-lg border p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-ctp-text text-lg font-semibold">
                          gumgum.gg
                        </h3>
                        <button
                          className="bg-ctp-blue hover:bg-ctp-sapphire text-ctp-base rounded px-4 py-2 text-sm transition-colors"
                          onClick={() => copyToClipboard(generatedLinks.gumgum)}
                        >
                          Copy Link
                        </button>
                      </div>
                      <a
                        href={generatedLinks.gumgum}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-ctp-surface2 hover:bg-ctp-surface2 text-ctp-blue hover:text-ctp-sapphire bg-ctp-surface0 block rounded border p-3 text-sm leading-relaxed break-all transition-colors"
                      >
                        {generatedLinks.gumgum}
                      </a>
                    </div>
                  )}

                  {generatedLinks.egman && (
                    <div className="border-ctp-surface2 bg-ctp-surface1 rounded-lg border p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-ctp-text text-lg font-semibold">
                          Egman Events
                        </h3>
                        <button
                          className="bg-ctp-blue hover:bg-ctp-sapphire text-ctp-base rounded px-4 py-2 text-sm transition-colors"
                          onClick={() => copyToClipboard(generatedLinks.egman)}
                        >
                          Copy Link
                        </button>
                      </div>
                      <a
                        href={generatedLinks.egman}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-ctp-surface2 hover:bg-ctp-surface2 text-ctp-blue hover:text-ctp-sapphire bg-ctp-surface0 block rounded border p-3 text-sm leading-relaxed break-all transition-colors"
                      >
                        {generatedLinks.egman}
                      </a>
                    </div>
                  )}

                  {generatedLinks.cardkaizoku && (
                    <div className="border-ctp-surface2 bg-ctp-surface1 rounded-lg border p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-ctp-text text-lg font-semibold">
                          CardKaizoku
                        </h3>
                        <button
                          className="bg-ctp-blue hover:bg-ctp-sapphire text-ctp-base rounded px-4 py-2 text-sm transition-colors"
                          onClick={() =>
                            copyToClipboard(generatedLinks.cardkaizoku)
                          }
                        >
                          Copy Link
                        </button>
                      </div>
                      <a
                        href={generatedLinks.cardkaizoku}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-ctp-surface2 hover:bg-ctp-surface2 text-ctp-blue hover:text-ctp-sapphire bg-ctp-surface0 block rounded border p-3 text-sm leading-relaxed break-all transition-colors"
                      >
                        {generatedLinks.cardkaizoku}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="text-ctp-overlay0 mb-4 text-6xl">⚡</div>
                  <p className="text-ctp-subtext0 mb-2 text-lg">
                    Ready to generate links
                  </p>
                  <p className="text-ctp-subtext1 text-sm">
                    Enter a deck list to see deckbuilder links appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DeckbuilderLinks;
