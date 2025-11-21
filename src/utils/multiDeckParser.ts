import { ImportOptions, CardEntry, processInput } from "./deckImporter";

export interface ParsedDeck {
  title: string;
  cards: CardEntry[];
  original: string;
}

export function parseBatchInput(input: string): ParsedDeck[] {
  const decks: ParsedDeck[] = [];
  const lines = input.split("\n");
  let currentDeck: ParsedDeck | null = null;

  // Regex to match "1xOP01-001" or "1 OP01-001" or "4xST01-001"
  // Allows optional x, whitespace, and card code format
  const cardRegex = /^\s*(\d+)(?:x|\s)\s*([A-Z0-9]+-?\d+)/i;
  const urlRegex = /^https?:\/\//i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (urlRegex.test(trimmed)) {
      // If we encounter a URL, treat it as a complete deck immediately
      // First finish any current deck we are building
      if (currentDeck) {
        decks.push(currentDeck);
        currentDeck = null;
      }

      // Process URL
      const cards = processInput(trimmed);
      if (cards.length > 0) {
        decks.push({
          title: "Imported Deck (Link)",
          cards,
          original: trimmed,
        });
      }
    } else if (cardRegex.test(trimmed)) {
      // It looks like a card line
      if (!currentDeck) {
        // Start a new deck if none exists
        currentDeck = {
          title: "Untitled Deck",
          cards: [],
          original: "",
        };
      }
      
      // Append to original string
      currentDeck.original += (currentDeck.original ? "\n" : "") + trimmed;

      // Parse just this line using existing logic (it returns array, we merge)
      const lineCards = processInput(trimmed);
      // We need to merge manually or use the reducer logic later
      // Let's just push for now and consolidate later if needed, 
      // but processInput typically returns consolidated for the input given.
      // Since we are feeding line by line, we get single entries.
      currentDeck.cards.push(...lineCards);

    } else {
      // It's a text line that is NOT a card and NOT a URL.
      // Treat as a title for a NEW deck.
      
      // Finish current deck
      if (currentDeck) {
        decks.push(currentDeck);
      }

      // Start new deck with this title
      // Remove trailing colon if present
      const title = trimmed.replace(/:$/, "");
      currentDeck = {
        title,
        cards: [],
        original: trimmed, // Title is part of the original text block for this deck? 
                           // Or should original include just cards? 
                           // Let's include title for completeness or just start empty?
                           // If we want "original" to be re-processable, maybe keep it.
      };
    }
  }

  // Push the last deck
  if (currentDeck) {
    decks.push(currentDeck);
  }

  // Post-process to consolidate cards within each deck
  return decks.map(deck => ({
    ...deck,
    cards: consolidateCards(deck.cards)
  }));
}

function consolidateCards(entries: CardEntry[]): CardEntry[] {
  return entries.reduce((acc: CardEntry[], entry) => {
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
}

