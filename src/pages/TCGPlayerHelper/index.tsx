import { useEffect, useMemo, useState } from "react";
import classNames from "../../utils/classNames";
import storage from "../../utils/Storage";
import { getAffiliateLink } from "../../utils/tcgplayerAffiliate";
import type {
  CardDataset,
  CardPrices,
  CardVersion,
  FilterState,
  FlattenedCard,
} from "./types";

const CACHE_KEY = "tcgplayer_helper_card_data";
const CACHE_TTL_SECONDS = 60 * 60; // 1 hour

const TCGPlayerHelper = () => {
  const [cardData, setCardData] = useState<CardDataset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    selectedSet: "",
    selectedRarity: "",
  });
  const [selectedCard, setSelectedCard] = useState<FlattenedCard | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(filters.searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.searchQuery]);

  // Fetch card data on mount
  useEffect(() => {
    const fetchCardData = async () => {
      // Try loading from cache first
      const cached = storage.load<CardDataset | null>(CACHE_KEY, null);
      if (cached) {
        setCardData(cached);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(
          "https://prices.bounty.cards/one_piece_tcg_card_data.json",
        );
        if (!response.ok) {
          throw new Error("Failed to fetch card data");
        }
        const data: CardDataset = await response.json();
        setCardData(data);
        storage.save(CACHE_KEY, data, {
          secondsTillExpiry: CACHE_TTL_SECONDS,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCardData();
  }, []);

  // Flatten card data for searching
  const flattenedCards = useMemo((): FlattenedCard[] => {
    if (!cardData) return [];

    const flattened: FlattenedCard[] = [];
    for (const [cardCode, entry] of Object.entries(cardData)) {
      for (const [index, version] of entry.versions.entries()) {
        flattened.push({
          cardCode,
          version,
          versionIndex: index,
        });
      }
    }
    return flattened;
  }, [cardData]);

  // Get unique sets and rarities for filters
  const { uniqueSets, uniqueRarities } = useMemo(() => {
    const sets = new Set<string>();
    const rarities = new Set<string>();

    for (const card of flattenedCards) {
      if (card.version.setName) sets.add(card.version.setName);
      if (card.version.rarity) rarities.add(card.version.rarity);
    }

    return {
      uniqueSets: Array.from(sets).toSorted(),
      uniqueRarities: Array.from(rarities).toSorted(),
    };
  }, [flattenedCards]);

  // Filter cards based on search and filters
  const filteredCards = useMemo(() => {
    const query = debouncedQuery.toLowerCase().trim();
    const { selectedSet, selectedRarity } = filters;

    return flattenedCards
      .filter((card) => {
        // Search filter
        if (query) {
          const matchesCode = card.cardCode.toLowerCase().includes(query);
          const matchesName = card.version.name.toLowerCase().includes(query);
          const matchesCleanName = card.version.cleanName
            .toLowerCase()
            .includes(query);
          if (!matchesCode && !matchesName && !matchesCleanName) {
            return false;
          }
        }

        // Set filter
        if (selectedSet && card.version.setName !== selectedSet) {
          return false;
        }

        // Rarity filter
        if (selectedRarity && card.version.rarity !== selectedRarity) {
          return false;
        }

        return true;
      })
      .slice(0, 100); // Limit results
  }, [flattenedCards, debouncedQuery, filters]);

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      selectedSet: "",
      selectedRarity: "",
    });
  };

  const getMarketPrice = (version: CardVersion): number | null => {
    const prices = Object.values(version.prices)[0];
    return prices?.market ?? null;
  };

  const formatPrice = (price: number | null): string => {
    if (price === null) return "N/A";
    return `$${price.toFixed(2)}`;
  };

  const hasActiveFilters =
    filters.searchQuery || filters.selectedSet || filters.selectedRarity;

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto max-w-7xl px-6 pt-8 pb-6">
        <h1 className="text-ctp-text mb-8 text-3xl font-bold">
          TCGPlayer Helper
        </h1>

        {/* Search and Filters */}
        <div className="bg-ctp-surface0 mb-6 rounded-xl p-6">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <label
                htmlFor="search"
                className="text-ctp-text mb-2 block text-sm font-semibold"
              >
                Search
              </label>
              <input
                id="search"
                type="text"
                placeholder="Card code (e.g., EB01-001) or name..."
                value={filters.searchQuery}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    searchQuery: e.target.value,
                  }))
                }
                className="bg-ctp-surface1 text-ctp-text border-ctp-surface2 placeholder:text-ctp-overlay0 focus:border-ctp-blue focus:ring-ctp-blue/50 w-full rounded-md border-2 px-4 py-2.5 transition-all duration-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
              />
            </div>

            {/* Set Filter */}
            <div>
              <label
                htmlFor="set"
                className="text-ctp-text mb-2 block text-sm font-semibold"
              >
                Set
              </label>
              <select
                id="set"
                value={filters.selectedSet}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    selectedSet: e.target.value,
                  }))
                }
                className="bg-ctp-surface1 text-ctp-text border-ctp-surface2 focus:border-ctp-blue focus:ring-ctp-blue/50 w-full rounded-md border-2 px-4 py-2.5 transition-all duration-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
              >
                <option value="">All Sets</option>
                {uniqueSets.map((set) => (
                  <option key={set} value={set}>
                    {set}
                  </option>
                ))}
              </select>
            </div>

            {/* Rarity Filter */}
            <div>
              <label
                htmlFor="rarity"
                className="text-ctp-text mb-2 block text-sm font-semibold"
              >
                Rarity
              </label>
              <select
                id="rarity"
                value={filters.selectedRarity}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    selectedRarity: e.target.value,
                  }))
                }
                className="bg-ctp-surface1 text-ctp-text border-ctp-surface2 focus:border-ctp-blue focus:ring-ctp-blue/50 w-full rounded-md border-2 px-4 py-2.5 transition-all duration-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
              >
                <option value="">All Rarities</option>
                {uniqueRarities.map((rarity) => (
                  <option key={rarity} value={rarity}>
                    {rarity}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="bg-ctp-surface2 hover:bg-ctp-overlay0 text-ctp-text mt-4 rounded-md px-4 py-2 text-sm transition-colors duration-100"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-ctp-subtext0 text-lg">
              Loading card data...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-ctp-red/10 border-ctp-red/30 rounded-xl border p-6 text-center">
            <p className="text-ctp-red">{error}</p>
          </div>
        )}

        {/* Card Grid */}
        {!isLoading && !error && (
          <>
            <div className="text-ctp-subtext0 mb-4 text-sm">
              {filteredCards.length === 100
                ? "Showing first 100 results"
                : `${filteredCards.length} cards found`}
            </div>

            {filteredCards.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-ctp-overlay0 mb-4 text-5xl">🔍</div>
                <p className="text-ctp-subtext0">
                  No cards found matching your search
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {filteredCards.map((card) => (
                  <button
                    key={`${card.cardCode}-${card.versionIndex}`}
                    onClick={() => setSelectedCard(card)}
                    className="bg-ctp-surface0 hover:bg-ctp-surface1 border-ctp-surface2 hover:border-ctp-blue group rounded-lg border-2 p-3 text-left transition-all duration-100"
                  >
                    <div className="relative mb-2 aspect-[5/7] overflow-hidden rounded-md">
                      <img
                        src={card.version.imageUrl}
                        alt={card.version.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="text-ctp-blue text-xs font-semibold">
                      {card.cardCode}
                    </div>
                    <div className="text-ctp-text mt-1 line-clamp-2 text-sm font-medium">
                      {card.version.name}
                    </div>
                    <div className="text-ctp-green mt-1 text-sm font-bold">
                      {formatPrice(getMarketPrice(card.version))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Card Detail Modal */}
        {selectedCard && (
          <CardDetailModal
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
          />
        )}
      </div>
    </main>
  );
};

interface CardDetailModalProps {
  card: FlattenedCard;
  onClose: () => void;
}

const CardDetailModal = ({ card, onClose }: CardDetailModalProps) => {
  const { version, cardCode } = card;

  // Get all price tiers from cached data
  const priceTiers = useMemo(() => {
    const allPrices: { condition: string; prices: CardPrices }[] = [];
    for (const [condition, prices] of Object.entries(version.prices)) {
      allPrices.push({ condition, prices });
    }
    return allPrices;
  }, [version.prices]);

  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) return "N/A";
    return `$${price.toFixed(2)}`;
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close modal"
      />
      {/* Modal content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-ctp-surface0 relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl p-6"
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 id="modal-title" className="text-ctp-text text-xl font-bold">
              {version.name}
            </h2>
            <div className="text-ctp-blue mt-1 text-sm font-semibold">
              {cardCode}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ctp-overlay0 hover:text-ctp-text transition-colors duration-100"
            aria-label="Close modal"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Card Image */}
          <div>
            <img
              src={version.imageUrl}
              alt={version.name}
              className="w-full rounded-lg"
            />
          </div>

          {/* Card Details */}
          <div>
            {/* Metadata */}
            <div className="mb-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-ctp-subtext0">Set:</span>
                <span className="text-ctp-text font-medium">
                  {version.setName || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ctp-subtext0">Rarity:</span>
                <span className="text-ctp-text font-medium">
                  {version.rarity || "Unknown"}
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-ctp-surface1 rounded-lg p-4">
              <h3 className="text-ctp-text mb-3 font-semibold">
                Pricing (Cached)
              </h3>
              {priceTiers.length > 0 ? (
                <div className="space-y-3">
                  {priceTiers.map(({ condition, prices }) => (
                    <div
                      key={condition}
                      className="border-ctp-surface2 border-b pb-2 last:border-0"
                    >
                      <div className="text-ctp-subtext0 mb-1 text-xs font-medium uppercase">
                        {condition}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-ctp-overlay0">Low:</span>
                          <span className="text-ctp-text">
                            {formatPrice(prices.low)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ctp-overlay0">Mid:</span>
                          <span className="text-ctp-text">
                            {formatPrice(prices.mid)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ctp-overlay0">High:</span>
                          <span className="text-ctp-text">
                            {formatPrice(prices.high)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ctp-green font-medium">
                            Market:
                          </span>
                          <span className="text-ctp-green font-bold">
                            {formatPrice(prices.market)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-ctp-subtext0 text-sm">
                  No pricing data available
                </p>
              )}
            </div>

            {/* TCGPlayer Link */}
            <a
              href={getAffiliateLink(version.url)}
              target="_blank"
              rel="noopener noreferrer"
              className={classNames(
                "mt-4 flex w-full items-center justify-center gap-2 rounded-md px-4 py-3",
                "bg-ctp-blue hover:bg-ctp-blue/90 text-ctp-base font-semibold",
                "transition-colors duration-100",
              )}
            >
              View on TCGPlayer
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TCGPlayerHelper;
