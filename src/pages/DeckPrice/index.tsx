import { useEffect, useMemo, useState } from "react";
import TextArea from "../../components/TextArea";
import classNames from "../../utils/classNames";
import { parseBatchInput } from "../../utils/multiDeckParser";
import { useReactPersist } from "../../utils/Storage";

interface CardProduct {
  productID: number;
  cardUrl: string;
  marketPrice: number;
  cardSet: string;
  cardName: string;
  massentry_name: string;
}

interface CardData {
  cardNumber: string;
  cardName: string;
  cardType: string;
  cardSet: string;
  products?: CardProduct[];
}

interface DeckPriceResult {
  title: string;
  original: string;
  totalPrice: number;
  valid: boolean;
  cardCount: number;
  error?: string;
  leader?: {
    name: string;
    set: string;
    price: number;
  };
}

const DeckPrice = () => {
  const [content, setContent] = useReactPersist("deck-price-content", "");
  const [cardData, setCardData] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "https://cdn.cardkaizoku.com/card_data.json?v=2",
        );
        if (!response.ok) {
          throw new Error("Failed to fetch card data");
        }
        const data = await response.json();
        setCardData(data);
      } catch (error) {
        console.error("Error fetching card data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCardData();
  }, []);

  const results = useMemo(() => {
    if (cardData.length === 0) return [];

    const decks = parseBatchInput(content);

    return decks.map((deck): DeckPriceResult => {
      if (deck.cards.length === 0) {
        return {
          title: deck.title,
          original: deck.original,
          totalPrice: 0,
          valid: false,
          cardCount: 0,
          error: "Unable to parse deck link or no cards found",
        };
      }

      let total = 0;
      let leader: { name: string; set: string; price: number } | undefined;

      for (const card of deck.cards) {
        const cardInfo = cardData.find((c) => c.cardNumber === card.cardCode);
        if (cardInfo) {
          let price = 0;
          if (cardInfo.products && cardInfo.products.length > 0) {
            // Use the first product price, which seems to be the standard behavior
            price = cardInfo.products[0].marketPrice || 0;
            total += price * card.minQuantity;
          }

          if (!leader && cardInfo.cardType === "LEADER") {
            leader = {
              name: cardInfo.cardName,
              set:
                cardInfo.cardSet ||
                (cardInfo.products && cardInfo.products[0]?.cardSet) ||
                "",
              price: price,
            };
          }
        }
      }

      return {
        title: deck.title,
        original: deck.original,
        totalPrice: total,
        valid: true,
        cardCount: deck.cards.reduce((acc, c) => acc + c.minQuantity, 0),
        leader,
      };
    });
  }, [content, cardData]);

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto max-w-7xl px-6 pt-8 pb-6">
        <h1 className="text-ctp-text mb-8 text-3xl font-bold">
          Deck Price Calculator
        </h1>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="bg-ctp-surface0 rounded-xl p-6 shadow-lg">
              <h2 className="text-ctp-text mb-4 text-xl font-semibold">
                Input Links
              </h2>
              <p className="text-ctp-subtext0 mb-4 text-sm">
                Paste your deck links or custom card lists here.
              </p>
              <TextArea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="https://gumgum.gg/deckbuilder?deck=...&#10;My Deck:&#10;4xOP01-001&#10;..."
                customClass="h-96 font-mono text-sm resize-none"
              />
            </div>
          </div>

          <div className="bg-ctp-surface0 flex flex-col rounded-xl p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-ctp-text text-xl font-semibold">
                Prices{" "}
                {isLoading && (
                  <span className="text-ctp-overlay0 ml-2 animate-pulse text-sm">
                    (Loading prices...)
                  </span>
                )}
              </h2>
              <div className="text-ctp-subtext0 text-sm">
                Source: CardKaizoku / TCGPlayer
              </div>
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
                      {result.title &&
                      result.title !== "Untitled Deck" &&
                      result.title !== "Imported Deck (Link)"
                        ? `${result.title} (${result.original.slice(0, 20)}...)`
                        : result.original.slice(0, 50)}
                    </div>

                    {result.valid ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-ctp-text text-lg font-bold">
                            ${result.totalPrice.toFixed(2)}
                          </div>
                          {result.leader && (
                            <div className="text-ctp-green text-sm font-medium">
                              {result.leader.set} {result.leader.name} ($
                              {result.leader.price.toFixed(2)})
                            </div>
                          )}
                          <div className="text-ctp-overlay0 text-xs">
                            {result.cardCount} Cards
                          </div>
                        </div>
                        <a
                          href={
                            result.original.startsWith("http")
                              ? result.original
                              : "#"
                          }
                          target={
                            result.original.startsWith("http") ? "_blank" : ""
                          }
                          rel="noopener noreferrer"
                          className={classNames(
                            "rounded px-3 py-1.5 text-sm transition-colors",
                            result.original.startsWith("http")
                              ? "bg-ctp-surface2 hover:bg-ctp-overlay0 text-ctp-text"
                              : "bg-ctp-surface0 text-ctp-subtext0 cursor-default",
                          )}
                        >
                          {result.original.startsWith("http")
                            ? "Open Deck"
                            : "Custom List"}
                        </a>
                      </div>
                    ) : (
                      <div className="text-ctp-red text-sm">
                        {result.error || "Invalid link"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                <div className="text-ctp-overlay0 mb-4 text-5xl">💰</div>
                <p className="text-ctp-subtext0">
                  Paste links on the left to see estimated prices here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default DeckPrice;
