import { useEffect } from "react";
import CopyButton from "../../components/CopyButton";
import PageShell from "../../components/PageShell";
import Section from "../../components/Section";
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

  const linkEntries = [
    { name: "gumgum.gg", url: generatedLinks.gumgum },
    { name: "Egman Events", url: generatedLinks.egman },
    { name: "CardKaizoku", url: generatedLinks.cardkaizoku },
  ].filter((entry) => entry.url);

  return (
    <PageShell
      title="Deckbuilder Links Generator"
      subtitle="Turn a sim deck list into gumgum.gg, Egman, and CardKaizoku links"
      wide
    >
      <div className="grid gap-8 lg:grid-cols-3 xl:grid-cols-5">
        <div className="lg:col-span-1 xl:col-span-2">
          <Section title="Deck List Input">
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
          </Section>
        </div>

        <div className="lg:col-span-2 xl:col-span-3">
          <Section title="Generated Links">
            {linkEntries.length > 0 ? (
              <div className="space-y-6">
                {linkEntries.map(({ name, url }) => (
                  <div
                    key={name}
                    className="border-ctp-surface2 bg-ctp-surface1 rounded-md border p-6"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-ctp-text text-lg font-semibold">
                        {name}
                      </h3>
                      <CopyButton
                        text={url}
                        label="Copy Link"
                        variant="primary"
                        size="sm"
                      />
                    </div>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-ctp-surface2 hover:bg-ctp-surface2 text-ctp-blue hover:text-ctp-sapphire bg-ctp-surface0 block rounded-md border p-3 text-sm leading-relaxed break-all transition-colors duration-100"
                    >
                      {url}
                    </a>
                  </div>
                ))}
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
          </Section>
        </div>
      </div>
    </PageShell>
  );
};

export default DeckbuilderLinks;
