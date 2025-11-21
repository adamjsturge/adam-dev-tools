import { CardEntry } from "./deckImporter";

export const generateGumgumUrl = (cards: CardEntry[]): string => {
  if (cards.length === 0) return "";

  const deckString = cards
    .map((card) => `${card.minQuantity}x${card.cardCode}`)
    .join(";");

  return `https://gumgum.gg/deckbuilder?deck=${deckString}`;
};

export const generateEgmanUrl = (cards: CardEntry[]): string => {
  if (cards.length === 0) return "";

  const deckString = cards
    .map((card) => `${card.cardCode}:${card.minQuantity}`)
    .join(",");

  return `https://deckbuilder.egmanevents.com/?deck=${deckString}&type=optcg`;
};

export const generateCardkaizokuUrl = (cards: CardEntry[]): string => {
  if (cards.length === 0) return "";

  const deckObject: Record<string, number> = {};
  for (const card of cards) {
    deckObject[card.cardCode] = card.minQuantity;
  }

  const jsonString = JSON.stringify(deckObject);
  const base64String = btoa(jsonString);

  return `https://deckbuilder.cardkaizoku.com/?deck=${base64String}`;
};

export type ExportFormat = "gumgum" | "egman" | "cardkaizoku";

export const generateUrl = (
  cards: CardEntry[],
  format: ExportFormat
): string => {
  switch (format) {
    case "gumgum":
      return generateGumgumUrl(cards);
    case "egman":
      return generateEgmanUrl(cards);
    case "cardkaizoku":
      return generateCardkaizokuUrl(cards);
    default:
      return "";
  }
};

