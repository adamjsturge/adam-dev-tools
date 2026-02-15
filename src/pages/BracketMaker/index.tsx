import { useCallback, useMemo, useState } from "react";
import { useLocation, useSearch } from "wouter";
import Input from "../../components/Input";
import Section from "../../components/Section";
import TextArea from "../../components/TextArea";
import classNames from "../../utils/classNames";
import { useReactPersist } from "../../utils/Storage";
import BracketDisplay from "./BracketDisplay";
import {
  type BracketData,
  type PathRound,
  generateBracket,
  getPlayerPath,
} from "./bracketUtils";
import StandingsImport from "./StandingsImport";

function encodePlayersToBase64(players: string[]): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(players))));
}

function decodePlayersFromBase64(encoded: string): string[] | null {
  try {
    const decoded = decodeURIComponent(escape(atob(encoded)));
    const parsed: unknown = JSON.parse(decoded);
    if (Array.isArray(parsed) && parsed.every((p) => typeof p === "string")) {
      return parsed as string[];
    }
    return null;
  } catch {
    return null;
  }
}

const MAX_PLAYERS = 128;

function formatOpponentList(
  opponents: { name: string; seed: number }[],
): string {
  const names = opponents.map((o) => `${o.name} (${o.seed})`);
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} or ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, or ${names.at(-1)}`;
}

const BracketMaker = () => {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();

  const params = new URLSearchParams(searchParams);
  const encodedPlayers = params.get("p");

  const savedPlayers = useMemo(
    () => (encodedPlayers ? decodePlayersFromBase64(encodedPlayers) : null),
    [encodedPlayers],
  );

  const [namesText, setNamesText] = useReactPersist<string>(
    "bracket_maker_names",
    "",
  );
  const [playerCount, setPlayerCount] = useState(32);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const bracket: BracketData | null = useMemo(
    () =>
      savedPlayers && savedPlayers.length >= 2
        ? generateBracket(savedPlayers)
        : null,
    [savedPlayers],
  );

  const playerPath: PathRound[] = useMemo(
    () =>
      selectedPlayer && bracket ? getPlayerPath(selectedPlayer, bracket) : [],
    [selectedPlayer, bracket],
  );

  const handleGenerate = useCallback(() => {
    const names = namesText
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n !== "");

    if (names.length < 2) return;

    const capped = names.slice(0, MAX_PLAYERS);
    const encoded = encodePlayersToBase64(capped);
    setSelectedPlayer(null);
    setLocation(`/bracket-maker?p=${encoded}`);
  }, [namesText, setLocation]);

  const handleEdit = useCallback(() => {
    if (savedPlayers) {
      setNamesText(savedPlayers.join("\n"));
      setPlayerCount(savedPlayers.length);
    }
    setSelectedPlayer(null);
    setLocation("/bracket-maker");
  }, [savedPlayers, setLocation, setNamesText]);

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(globalThis.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, []);

  const handleImport = useCallback(
    (names: string[]) => {
      setNamesText(names.join("\n"));
      setPlayerCount(names.length);
    },
    [setNamesText],
  );

  const handlePlayerCountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.min(
        MAX_PLAYERS,
        Math.max(2, Number.parseInt(e.target.value, 10) || 2),
      );
      setPlayerCount(val);
    },
    [],
  );

  const nameCount = namesText.split("\n").filter((n) => n.trim() !== "").length;
  const isValid = nameCount >= 2;

  if (bracket) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-ctp-text text-2xl font-bold">
            Tournament Bracket
          </h1>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCopyLink}
              className={classNames(
                "rounded-md px-4 py-2 text-sm font-semibold",
                "transition-colors duration-100",
                isCopied
                  ? "bg-ctp-green text-ctp-base"
                  : "bg-ctp-blue text-ctp-base hover:bg-ctp-blue/90",
              )}
              aria-label="Copy shareable link"
            >
              {isCopied ? "Copied!" : "Copy Link"}
            </button>
            <button
              type="button"
              onClick={handleEdit}
              className={classNames(
                "bg-ctp-surface1 text-ctp-text rounded-md px-4 py-2 text-sm font-semibold",
                "transition-colors duration-100",
                "hover:bg-ctp-surface2",
              )}
              aria-label="Edit player list"
            >
              Edit Players
            </button>
          </div>
        </div>
        <Section>
          <p className="text-ctp-subtext0 mb-4 text-sm">
            Click a player name in the first round to see their path through the
            bracket.
          </p>
          <BracketDisplay
            bracket={bracket}
            selectedPlayer={selectedPlayer}
            onSelectPlayer={setSelectedPlayer}
          />
        </Section>
        {selectedPlayer && playerPath.length > 0 && (
          <Section title={`${selectedPlayer}'s Path`}>
            <div className="space-y-1">
              {playerPath.map((round, index) => (
                <div key={round.roundName}>
                  <div className="flex items-start gap-3 py-2">
                    <span className="text-ctp-subtext1 w-28 shrink-0 text-right text-sm font-semibold">
                      {round.roundName}
                    </span>
                    <span className="text-ctp-text text-sm">
                      {round.isBye
                        ? "BYE (auto-advance)"
                        : `vs. ${formatOpponentList(round.opponents)}`}
                    </span>
                  </div>
                  {index < playerPath.length - 1 && (
                    <div className="flex">
                      <span className="text-ctp-overlay0 w-28 shrink-0 text-right">
                        &darr;
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <h1 className="text-ctp-text text-2xl font-bold">Bracket Maker</h1>
      <Section title="Players">
        <div className="space-y-4">
          <Input
            label="Number of Players"
            type="number"
            min={2}
            max={MAX_PLAYERS}
            value={playerCount}
            onChange={handlePlayerCountChange}
            aria-label="Number of players"
          />
          <TextArea
            label="Player Names (one per line)"
            value={namesText}
            onChange={(e) => setNamesText(e.target.value)}
            placeholder={`Enter up to ${playerCount} player names, one per line...`}
            rows={Math.min(playerCount, 16)}
            aria-label="Player names input"
          />
          <p className="text-ctp-subtext0 text-sm">
            {nameCount} player{nameCount === 1 ? "" : "s"} entered
            {nameCount < 2 && " (minimum 2)"}
          </p>
          <StandingsImport onImport={handleImport} />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!isValid}
            className={classNames(
              "bg-ctp-blue text-ctp-base w-full rounded-md py-3 text-sm font-semibold",
              "transition-colors duration-100",
              "hover:bg-ctp-blue/90",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
            aria-label="Generate tournament bracket"
          >
            Generate Bracket
          </button>
        </div>
      </Section>
    </div>
  );
};

export default BracketMaker;
