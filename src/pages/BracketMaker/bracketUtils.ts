export interface Match {
  seed1: number;
  seed2: number;
  player1: string;
  player2: string;
  round: number;
}

export interface BracketData {
  rounds: Match[][];
  players: string[];
  bracketSize: number;
}

export function nextPowerOfTwo(n: number): number {
  let power = 1;
  while (power < n) {
    power *= 2;
  }
  return power;
}

export function generateSeeding(bracketSize: number): number[] {
  let seeds = [1, 2];
  while (seeds.length < bracketSize) {
    const nextRoundSize = seeds.length * 2;
    const newSeeds: number[] = [];
    for (const seed of seeds) {
      newSeeds.push(seed, nextRoundSize + 1 - seed);
    }
    seeds = newSeeds;
  }
  return seeds;
}

export function generateBracket(players: string[]): BracketData {
  const bracketSize = nextPowerOfTwo(players.length);
  const seeds = generateSeeding(bracketSize);
  const totalRounds = Math.log2(bracketSize);

  const rounds: Match[][] = [];

  const firstRound: Match[] = [];
  for (let i = 0; i < seeds.length; i += 2) {
    const seed1 = seeds[i];
    const seed2 = seeds[i + 1];
    const player1 = seed1 <= players.length ? players[seed1 - 1] : "BYE";
    const player2 = seed2 <= players.length ? players[seed2 - 1] : "BYE";
    firstRound.push({ seed1, seed2, player1, player2, round: 0 });
  }
  rounds.push(firstRound);

  for (let round = 1; round < totalRounds; round++) {
    const matchCount = bracketSize / Math.pow(2, round + 1);
    const roundMatches: Match[] = [];
    for (let i = 0; i < matchCount; i++) {
      roundMatches.push({
        seed1: 0,
        seed2: 0,
        player1: "",
        player2: "",
        round,
      });
    }
    rounds.push(roundMatches);
  }

  return { rounds, players, bracketSize };
}

export function getRoundName(round: number, totalRounds: number): string {
  const roundsFromEnd = totalRounds - round;
  if (roundsFromEnd === 1) return "Finals";
  if (roundsFromEnd === 2) return "Semifinals";
  if (roundsFromEnd === 3) return "Quarterfinals";
  const playersInRound = Math.pow(2, roundsFromEnd);
  return `Round of ${playersInRound}`;
}

export interface PathRound {
  roundName: string;
  opponents: { name: string; seed: number }[];
  isBye: boolean;
}

export function getPlayerPath(
  playerName: string,
  bracket: BracketData,
): PathRound[] {
  const firstRound = bracket.rounds[0];
  const matchIndex = firstRound.findIndex(
    (m) => m.player1 === playerName || m.player2 === playerName,
  );
  if (matchIndex === -1) return [];

  const totalRounds = bracket.rounds.length;
  const path: PathRound[] = [];
  const match = firstRound[matchIndex];

  const directOpponent =
    match.player1 === playerName
      ? { name: match.player2, seed: match.seed2 }
      : { name: match.player1, seed: match.seed1 };

  path.push({
    roundName: getRoundName(0, totalRounds),
    opponents: directOpponent.name === "BYE" ? [] : [directOpponent],
    isBye: directOpponent.name === "BYE",
  });

  for (let r = 1; r < totalRounds; r++) {
    const siblingAtPrevRound = Math.floor(matchIndex / Math.pow(2, r - 1)) ^ 1;
    const startMatch = siblingAtPrevRound * Math.pow(2, r - 1);
    const endMatch = (siblingAtPrevRound + 1) * Math.pow(2, r - 1) - 1;

    const opponents: { name: string; seed: number }[] = [];
    for (let m = startMatch; m <= endMatch; m++) {
      if (firstRound[m].player1 !== "BYE") {
        opponents.push({
          name: firstRound[m].player1,
          seed: firstRound[m].seed1,
        });
      }
      if (firstRound[m].player2 !== "BYE") {
        opponents.push({
          name: firstRound[m].player2,
          seed: firstRound[m].seed2,
        });
      }
    }

    path.push({
      roundName: getRoundName(r, totalRounds),
      opponents,
      isBye: false,
    });
  }

  return path;
}

export function getPathMatchIndices(
  playerName: string,
  bracket: BracketData,
): Map<number, number> {
  const matchIndex = bracket.rounds[0].findIndex(
    (m) => m.player1 === playerName || m.player2 === playerName,
  );
  if (matchIndex === -1) return new Map();

  const indices = new Map<number, number>();
  for (let r = 0; r < bracket.rounds.length; r++) {
    indices.set(r, Math.floor(matchIndex / Math.pow(2, r)));
  }
  return indices;
}
