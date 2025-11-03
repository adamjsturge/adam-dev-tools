export interface SimCard {
  code: string;
  quantity: number;
}

export const normalizeSimCodeLine = (line: string): string => {
  const trimmedLine = line.trim();
  if (trimmedLine === "") return trimmedLine;

  const match = trimmedLine.match(/^(\d+)(x|\s)([^\s]+)/);
  if (match) {
    const quantity = match[1];
    const cardCode = match[3];
    return `${quantity}x${cardCode}`;
  }

  return line;
};

export const normalizeSimCodes = (content: string): string => {
  return content
    .split("\n")
    .map(normalizeSimCodeLine)
    .join("\n");
};

export const parseSimDecklist = (content: string): SimCard[] => {
  if (!content.trim()) return [];

  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "")
    .map((line) => {
      const match = line.match(/^(\d+)x([A-Z0-9-]+)/);
      if (match) {
        return {
          code: match[2],
          quantity: Number.parseInt(match[1]),
        };
      }
      return null;
    })
    .filter((item): item is SimCard => item !== null);
};

