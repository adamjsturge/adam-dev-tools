export interface CardPrices {
  low: number;
  mid: number;
  high: number;
  market: number;
}

export interface CardVersion {
  productId: number;
  name: string;
  cleanName: string;
  imageUrl: string;
  url: string;
  rarity: string;
  prices: Record<string, CardPrices>;
  setName: string;
}

export interface CardEntry {
  versions: CardVersion[];
}

export interface CardDataset {
  [cardCode: string]: CardEntry;
}

export interface FlattenedCard {
  cardCode: string;
  version: CardVersion;
  versionIndex: number;
}

export interface FilterState {
  searchQuery: string;
  selectedSet: string;
  selectedRarity: string;
}
