import { useState } from "react";
import Input from "../../components/Input";
import Section from "../../components/Section";
import Tile from "../../components/Tile";

interface Preset {
  label: string;
  values: Record<string, number | (() => number)>;
}

const DeckDrawOdds = () => {
  const defaultValues = {
    singleCard: {
      deckSize: 50,
      copiesRan: 4,
      cardsDrawn: 5,
      oddsToHave: 1,
    },
    multiCard: {
      deckSize: 50,
      copiesCardA: 4,
      copiesCardB: 4,
      drawSize: 5,
    },
  };

  const [deckSize, setDeckSize] = useState(defaultValues.singleCard.deckSize);
  const [copiesRan, setCopiesRan] = useState(
    defaultValues.singleCard.copiesRan,
  );
  const [cardsDrawn, setCardsDrawn] = useState(
    defaultValues.singleCard.cardsDrawn,
  );
  const [oddsToHave, setOddsToHave] = useState(
    defaultValues.singleCard.oddsToHave,
  );

  const [mvDeckSize, setMvDeckSize] = useState(
    defaultValues.multiCard.deckSize,
  );
  const [copiesCardA, setCopiesCardA] = useState(
    defaultValues.multiCard.copiesCardA,
  );
  const [copiesCardB, setCopiesCardB] = useState(
    defaultValues.multiCard.copiesCardB,
  );
  const [mvDrawSize, setMvDrawSize] = useState(
    defaultValues.multiCard.drawSize,
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

  const atLeast = (
    N: number,
    K: number,
    n: number,
    minimum: number,
  ): number => {
    let probability = 0;
    for (let index = minimum; index <= Math.min(n, K); index++) {
      probability += hypergeometric(N, K, n, index);
    }
    return probability;
  };

  const withMulligan = (
    N: number,
    K: number,
    n: number,
    minimum: number,
  ): number => {
    const firstTry = atLeast(N, K, n, minimum);
    const secondTry = atLeast(N, K, n, minimum);
    return firstTry + (1 - firstTry) * secondTry;
  };

  const calculateMultivariateIntersect = (
    N: number,
    A: number,
    B: number,
    d: number,
  ): number => {
    const combinations = (n_: number, r: number): number => {
      if (r > n_) return 0;
      let p = 1;
      for (let index = 1; index <= r; index++) {
        p *= (n_ - index + 1) / index;
      }
      return Math.round(p);
    };

    const pNoA = combinations(N - A, d) / combinations(N, d);
    const pNoB = combinations(N - B, d) / combinations(N, d);
    const pNeither = combinations(N - A - B, d) / combinations(N, d);

    return 1 - pNoA - pNoB + pNeither;
  };

  const calculateMultivariateMulligan = (
    N: number,
    A: number,
    B: number,
    d: number,
  ): number => {
    const firstTry = calculateMultivariateIntersect(N, A, B, d);
    const secondTry = calculateMultivariateIntersect(N, A, B, d);
    return firstTry + (1 - firstTry) * secondTry;
  };

  const exactProbability = hypergeometric(
    deckSize,
    copiesRan,
    cardsDrawn,
    oddsToHave,
  );
  const atLeastProbability = atLeast(
    deckSize,
    copiesRan,
    cardsDrawn,
    oddsToHave,
  );
  const mulliganProbability = withMulligan(
    deckSize,
    copiesRan,
    cardsDrawn,
    oddsToHave,
  );

  const mvProbability = calculateMultivariateIntersect(
    mvDeckSize,
    copiesCardA,
    copiesCardB,
    mvDrawSize,
  );
  const mvMulliganProbability = calculateMultivariateMulligan(
    mvDeckSize,
    copiesCardA,
    copiesCardB,
    mvDrawSize,
  );

  const gameStatePresets: Preset[] = [
    {
      label: "Start of Game",
      values: {
        deckSize: () => defaultValues.singleCard.deckSize,
        mvDeckSize: () => defaultValues.multiCard.deckSize,
      },
    },
    {
      label: "First Turn",
      values: {
        deckSize: () => defaultValues.singleCard.deckSize - 10,
        mvDeckSize: () => defaultValues.multiCard.deckSize - 10,
      },
    },
    {
      label: "Late Game",
      values: {
        deckSize: () => defaultValues.singleCard.deckSize - 16,
        mvDeckSize: () => defaultValues.multiCard.deckSize - 16,
      },
    },
  ];

  const drawSizePresets: Preset[] = [
    {
      label: "Cards Drawn 3",
      values: {
        cardsDrawn: () => 3,
        mvDrawSize: () => 3,
      },
    },
    {
      label: "Cards Drawn 4",
      values: {
        cardsDrawn: () => 4,
        mvDrawSize: () => 4,
      },
    },
    {
      label: "Cards Drawn 5",
      values: {
        cardsDrawn: () => 5,
        mvDrawSize: () => 5,
      },
    },
  ];

  const resetSingleCard = () => {
    setDeckSize(defaultValues.singleCard.deckSize);
    setCopiesRan(defaultValues.singleCard.copiesRan);
    setCardsDrawn(defaultValues.singleCard.cardsDrawn);
    setOddsToHave(defaultValues.singleCard.oddsToHave);
  };

  const resetMultiCard = () => {
    setMvDeckSize(defaultValues.multiCard.deckSize);
    setCopiesCardA(defaultValues.multiCard.copiesCardA);
    setCopiesCardB(defaultValues.multiCard.copiesCardB);
    setMvDrawSize(defaultValues.multiCard.drawSize);
  };

  const applyPreset = (preset: Preset) => {
    for (const [key, value] of Object.entries(preset.values)) {
      const calculatedValue = typeof value === "function" ? value() : value;

      if (key === "deckSize") setDeckSize(calculatedValue);
      if (key === "mvDeckSize") setMvDeckSize(calculatedValue);
      if (key === "cardsDrawn") setCardsDrawn(calculatedValue);
      if (key === "mvDrawSize") setMvDrawSize(calculatedValue);
    }
  };

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col px-4 pt-8 pb-4">
      <h1 className="text-ctp-text mb-4 text-center text-2xl font-bold">
        Deck Draw Odds Calculator
      </h1>

      <Section title="Single Card Probability Calculator" customClass="mb-8">
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
              Cards Drawn:
            </span>
            <div className="flex flex-wrap gap-2">
              {drawSizePresets.map((preset) => (
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
              onClick={resetSingleCard}
            >
              Reset Single Card
            </button>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            id="deckSize"
            label="Deck Size"
            type="number"
            value={deckSize}
            onChange={(e) => setDeckSize(Number(e.target.value))}
          />
          <Input
            id="copiesRan"
            label="Copies Ran"
            type="number"
            max={deckSize}
            value={copiesRan}
            onChange={(e) => setCopiesRan(Number(e.target.value))}
          />
          <Input
            id="cardsDrawn"
            label="Cards Drawn"
            type="number"
            max={deckSize}
            value={cardsDrawn}
            onChange={(e) => setCardsDrawn(Number(e.target.value))}
          />
          <Input
            id="oddsToHave"
            label="Odds to Have"
            type="number"
            max={Math.min(copiesRan, cardsDrawn)}
            value={oddsToHave}
            onChange={(e) => setOddsToHave(Number(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Tile title="Exact Probability" value={exactProbability} />
          <Tile title="At Least Probability" value={atLeastProbability} />
          <Tile title="With One Mulligan" value={mulliganProbability} />
        </div>
      </Section>

      <Section title="Multi Card Probability Calculator">
        <div className="mb-4 flex justify-end">
          <button
            className="bg-ctp-blue hover:bg-ctp-sapphire text-ctp-base rounded-md px-4 py-2 text-sm font-medium"
            onClick={resetMultiCard}
          >
            Reset Multi Card
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            id="mvDeckSize"
            label="Deck Size"
            type="number"
            value={mvDeckSize}
            onChange={(e) => setMvDeckSize(Number(e.target.value))}
          />
          <Input
            id="copiesCardA"
            label="Copies of Card A"
            type="number"
            max={mvDeckSize}
            value={copiesCardA}
            onChange={(e) => setCopiesCardA(Number(e.target.value))}
          />
          <Input
            id="copiesCardB"
            label="Copies of Card B"
            type="number"
            max={mvDeckSize}
            value={copiesCardB}
            onChange={(e) => setCopiesCardB(Number(e.target.value))}
          />
          <Input
            id="mvDrawSize"
            label="Draw Size"
            type="number"
            min={2}
            max={mvDeckSize}
            value={mvDrawSize}
            onChange={(e) => setMvDrawSize(Number(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Tile title="Probability of Drawing Both" value={mvProbability} />
          <Tile title="With One Mulligan" value={mvMulliganProbability} />
        </div>
      </Section>
    </main>
  );
};

export default DeckDrawOdds;
