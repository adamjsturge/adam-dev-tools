import classNames from "../../utils/classNames";
import {
  type BracketData,
  getPathMatchIndices,
  getRoundName,
} from "./bracketUtils";

interface BracketDisplayProps {
  bracket: BracketData;
  selectedPlayer: string | null;
  onSelectPlayer: (name: string | null) => void;
}

const BracketDisplay = ({
  bracket,
  selectedPlayer,
  onSelectPlayer,
}: BracketDisplayProps) => {
  const totalRounds = bracket.rounds.length;
  const pathIndices = selectedPlayer
    ? getPathMatchIndices(selectedPlayer, bracket)
    : new Map<number, number>();

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-6" style={{ minWidth: "fit-content" }}>
        {bracket.rounds.map((round, roundIndex) => (
          <div key={roundIndex} className="flex min-w-[220px] flex-col">
            <h3 className="text-ctp-subtext1 mb-3 text-center text-sm font-semibold">
              {getRoundName(roundIndex, totalRounds)}
            </h3>
            <div className="flex flex-1 flex-col justify-around gap-3">
              {round.map((match, matchIndex) => {
                const isOnPath = pathIndices.get(roundIndex) === matchIndex;

                return (
                  <div
                    key={matchIndex}
                    className={classNames(
                      "bg-ctp-surface0 overflow-hidden rounded-md border transition-colors duration-100",
                      isOnPath ? "border-ctp-blue" : "border-ctp-surface2",
                    )}
                  >
                    <MatchSlot
                      seed={match.seed1}
                      player={match.player1}
                      isFirstRound={roundIndex === 0}
                      isSelected={match.player1 === selectedPlayer}
                      onSelect={onSelectPlayer}
                    />
                    <div className="bg-ctp-surface2 h-px" />
                    <MatchSlot
                      seed={match.seed2}
                      player={match.player2}
                      isFirstRound={roundIndex === 0}
                      isSelected={match.player2 === selectedPlayer}
                      onSelect={onSelectPlayer}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface MatchSlotProps {
  seed: number;
  player: string;
  isFirstRound: boolean;
  isSelected: boolean;
  onSelect: (name: string | null) => void;
}

const MatchSlot = ({
  seed,
  player,
  isFirstRound,
  isSelected,
  onSelect,
}: MatchSlotProps) => {
  const isBye = player === "BYE";
  const isEmpty = !player;
  const isClickable = isFirstRound && !isBye && !isEmpty;

  const content = (
    <>
      {isFirstRound && seed > 0 && (
        <span className="text-ctp-overlay0 w-6 text-right text-xs">{seed}</span>
      )}
      {!isFirstRound && <span className="w-6" />}
      <span
        className={classNames(
          "truncate text-sm",
          isSelected
            ? "text-ctp-blue font-semibold"
            : isBye
              ? "text-ctp-overlay0 italic"
              : isEmpty
                ? "text-ctp-overlay0"
                : "text-ctp-text",
        )}
      >
        {isEmpty ? "TBD" : player}
      </span>
    </>
  );

  if (isClickable) {
    return (
      <button
        type="button"
        className={classNames(
          "flex w-full items-center gap-2 px-3 py-2 text-left",
          "hover:bg-ctp-surface1 cursor-pointer transition-colors duration-100",
          isSelected ? "bg-ctp-blue/15" : "",
        )}
        onClick={() => onSelect(isSelected ? null : player)}
        aria-label={`${isSelected ? "Deselect" : "Select"} ${player}`}
      >
        {content}
      </button>
    );
  }

  return <div className="flex items-center gap-2 px-3 py-2">{content}</div>;
};

export default BracketDisplay;
