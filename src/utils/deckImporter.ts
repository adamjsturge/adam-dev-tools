export interface ImportOptions {
  maxQuantityMode: "min" | "four";
  initialQuantityMode: "zero" | "min" | "max";
  quantityMode: "min" | "quantity";
}

export interface CardEntry {
  minQuantity: number;
  cardCode: string;
}

export interface ImporterProps {
  onAction: (entries: CardEntry[], options: ImportOptions) => void;
  showQuantityModeOption?: boolean;
  showInitialQuantityOption?: boolean;
  showMaxQuantityOption?: boolean;
  defaultQuantityMode?: "min" | "quantity";
  defaultInitialQuantityMode?: "zero" | "min" | "max";
  defaultMaxQuantityMode?: "min" | "four";
}

export function processInput(input: string): CardEntry[] {
  if (!input.trim()) return [];

  let entries: CardEntry[] = [];

  // Split input into lines and process each line
  const lines = input.split("\n").filter((line) => line.trim());

  for (const line of lines) {
    if (line.startsWith("https://onepiecetopdecks.com/deck-list/")) {
      try {
        const url = new URL(line);
        const deck = url.searchParams.get("dg");

        if (deck) {
          const topDeckEntries = deck
            .split("a")
            .filter((entry) => entry.trim())
            .map((entry) => {
              const match = entry.match(/^(\d+)n([A-Z]+\d{2}-\d{3})/);

              if (!match) return null;

              return {
                minQuantity: Number.parseInt(match[1], 10),
                cardCode: match[2],
              };
            })
            .filter((entry): entry is CardEntry => entry !== null);

          entries = entries.concat(topDeckEntries);
        }
      } catch (error) {
        console.error("Error parsing One Piece TCG URL:", error);
      }
    } else if (line.startsWith("https://deckbuilder.egmanevents.com")) {
      try {
        const url = new URL(line);
        const deck = url.searchParams.get("deck");

        if (deck) {
          const egmanEntries = deck
            .split(",")
            .map((entry) => {
              const [cardCode, quantity] = entry.split(":");
              if (!cardCode || !quantity) return null;

              return {
                minQuantity: Number.parseInt(quantity, 10),
                cardCode: cardCode,
              };
            })
            .filter((entry): entry is CardEntry => entry !== null);

          entries = entries.concat(egmanEntries);
        }
      } catch (error) {
        console.error("Error parsing URL:", error);
      }
    } else if (line.startsWith("https://gumgum.gg/deckbuilder")) {
      try {
        const url = new URL(line);
        const deck = url.searchParams.get("deck");

        if (deck) {
          const gumgumEntries = deck
            .split(";")
            .filter((entry) => entry.trim())
            .map((entry) => {
              const match = entry.match(/^(\d+)x([A-Z]+\d{2}-\d{3})/);

              if (!match) return null;

              return {
                minQuantity: Number.parseInt(match[1], 10),
                cardCode: match[2],
              };
            })
            .filter((entry): entry is CardEntry => entry !== null);

          entries = entries.concat(gumgumEntries);
        }
      } catch (error) {
        console.error("Error parsing gumgum URL:", error);
      }
    } else if (line.startsWith("https://deckbuilder.cardkaizoku.com")) {
      try {
        const url = new URL(line);
        const deck = url.searchParams.get("deck");

        if (deck) {
          // Decode base64 and parse JSON
          const decodedDeck = atob(decodeURIComponent(deck));
          const deckData = JSON.parse(decodedDeck);

          const cardkaizokuEntries = Object.entries(deckData)
            .map(([cardCode, quantity]) => {
              if (typeof quantity !== "number" || !cardCode) return null;

              return {
                minQuantity: quantity,
                cardCode: cardCode,
              };
            })
            .filter((entry): entry is CardEntry => entry !== null);

          entries = entries.concat(cardkaizokuEntries);
        }
      } catch (error) {
        console.error("Error parsing cardkaizoku URL:", error);
      }
    } else {
      // Handle standard card format
      const match = line.trim().match(/^(\d+)(x|\s)([^\s]+)/);
      if (match) {
        entries.push({
          minQuantity: Number.parseInt(match[1], 10),
          cardCode: match[3],
        });
      }
    }
  }

  // Consolidate entries with the same card code
  const consolidatedEntries = entries.reduce((acc: CardEntry[], entry) => {
    const existingEntry = acc.find((e) => e.cardCode === entry.cardCode);

    if (existingEntry) {
      existingEntry.minQuantity = Math.min(
        existingEntry.minQuantity + entry.minQuantity,
        4
      );
    } else {
      acc.push({
        ...entry,
        minQuantity: Math.min(entry.minQuantity, 4),
      });
    }

    return acc;
  }, []);

  return consolidatedEntries;
}

