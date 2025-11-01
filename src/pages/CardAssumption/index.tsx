import { useState } from "react";
import Input from "../../components/Input";
import Section from "../../components/Section";
import Tile from "../../components/Tile";

interface Preset {
  label: string;
  values: Record<string, number | ((def: number) => number)>;
}

const CardAssumption = () => {
  const defaultValues = {
    deckSize: 50,
    relevantCards: 12,
    handSize: 5,
    discardedCards: 0,
    knownRelevantInHand: 0,
  };

  const [deckSize, setDeckSize] = useState(defaultValues.deckSize);
  const [relevantCards, setRelevantCards] = useState(
    defaultValues.relevantCards,
  );
  const [handSize, setHandSize] = useState(defaultValues.handSize);
  const [discardedCards, setDiscardedCards] = useState(
    defaultValues.discardedCards,
  );
  const [knownRelevantInHand, setKnownRelevantInHand] = useState(
    defaultValues.knownRelevantInHand,
  );

  const hypergeometric = (
    N: number,
    K: number,
    n: number,
    k: number,
  ): number => {
    const combinations = (n_: number, r: number): number => {
      if (r > n_) return 0;
      let p = 1;
      for (let index = 1; index <= r; index++) {
        p *= (n_ - index + 1) / index;
      }
      return Math.round(p);
    };

    return (
      (combinations(K, k) * combinations(N - K, n - k)) / combinations(N, n)
    );
  };

  const adjustedDeckSize = deckSize - discardedCards;
  const adjustedRelevantCards = relevantCards - discardedCards;
  const remainingHandSize = handSize - knownRelevantInHand;
  const remainingRelevantCards = adjustedRelevantCards - knownRelevantInHand;
  const maxPossible =
    Math.min(remainingRelevantCards, remainingHandSize) + knownRelevantInHand;

  const probabilities = Array.from({ length: maxPossible + 1 }, (_, index) => {
    if (index < knownRelevantInHand) return { amount: index, probability: 0 };
    const additional = index - knownRelevantInHand;
    return {
      amount: index,
      probability: hypergeometric(
        adjustedDeckSize - knownRelevantInHand,
        remainingRelevantCards,
        remainingHandSize,
        additional,
      ),
    };
  });

  const highestProbability = Math.max(
    ...probabilities.map((p) => p.probability),
  );

  const gameStatePresets: Preset[] = [
    {
      label: "Start of Game",
      values: {
        deckSize: (def: number) => def,
      },
    },
    {
      label: "First Turn",
      values: {
        deckSize: (def: number) => def - 10,
      },
    },
    {
      label: "Late Game",
      values: {
        deckSize: (def: number) => def - 16,
      },
    },
  ];

  const relevantCardPresets: Preset[] = [
    {
      label: "Standard 2ks",
      values: {
        relevantCards: 12,
      },
    },
    {
      label: "Low 2ks",
      values: {
        relevantCards: 8,
      },
    },
    {
      label: "High 2ks",
      values: {
        relevantCards: 16,
      },
    },
  ];

  const resetToDefault = () => {
    setDeckSize(defaultValues.deckSize);
    setRelevantCards(defaultValues.relevantCards);
    setHandSize(defaultValues.handSize);
    setDiscardedCards(defaultValues.discardedCards);
    setKnownRelevantInHand(defaultValues.knownRelevantInHand);
  };

  const applyPreset = (preset: Preset) => {
    for (const [key, value] of Object.entries(preset.values)) {
      const calculatedValue =
        typeof value === "function"
          ? value(defaultValues[key as keyof typeof defaultValues])
          : value;

      if (key === "deckSize") setDeckSize(calculatedValue);
      if (key === "relevantCards") setRelevantCards(calculatedValue);
    }
  };

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col px-4 pt-8 pb-4">
      <h1 className="text-ctp-text mb-4 text-center text-2xl font-bold">
        Card Assumption Calculator
      </h1>

      <Section title="Calculate Opponent's Hand Probabilities">
        <div className="mb-4 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-ctp-text text-sm font-medium">
              Game State:
            </span>
            <div className="flex flex-wrap gap-2">
              {gameStatePresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className="bg-ctp-surface2 hover:bg-ctp-overlay0 text-ctp-text rounded-md px-4 py-2 text-sm font-medium transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-ctp-text text-sm font-medium">
              Relevant Cards:
            </span>
            <div className="flex flex-wrap gap-2">
              {relevantCardPresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className="bg-ctp-surface2 hover:bg-ctp-overlay0 text-ctp-text rounded-md px-4 py-2 text-sm font-medium transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              className="bg-ctp-blue hover:bg-ctp-sapphire text-ctp-base rounded-md px-4 py-2 text-sm font-medium"
              onClick={resetToDefault}
            >
              Reset to Default
            </button>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            id="deckSize"
            label="Opponent's Deck Size"
            type="number"
            min={1}
            value={deckSize}
            onChange={(e) => setDeckSize(Number(e.target.value))}
          />
          <Input
            id="relevantCards"
            label="Total Relevant Cards"
            type="number"
            max={deckSize}
            value={relevantCards}
            onChange={(e) => setRelevantCards(Number(e.target.value))}
          />
          <Input
            id="handSize"
            label="Opponent's Hand Size"
            type="number"
            max={adjustedDeckSize}
            value={handSize}
            onChange={(e) => setHandSize(Number(e.target.value))}
          />
          <Input
            id="discardedCards"
            label="Known Discarded Cards"
            type="number"
            max={relevantCards}
            value={discardedCards}
            onChange={(e) => setDiscardedCards(Number(e.target.value))}
          />
          <Input
            id="knownRelevantInHand"
            label="Known Relevant Cards in Hand"
            type="number"
            min={0}
            max={Math.min(handSize, adjustedRelevantCards)}
            value={knownRelevantInHand}
            onChange={(e) => setKnownRelevantInHand(Number(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {probabilities.map(({ amount, probability }) => (
            <Tile
              key={amount}
              title={`Has ${amount} ${amount === 1 ? "Card" : "Cards"}`}
              value={probability}
              highlight={probability === highestProbability}
            />
          ))}
        </div>
      </Section>
    </main>
  );
};

export default CardAssumption;
