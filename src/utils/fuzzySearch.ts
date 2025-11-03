export function fuzzySearch(
  string: string,
  term: string,
  ratio: number,
): boolean {
  string = string.toLowerCase();
  term = term.toLowerCase();
  let matches = 0;
  if (string.includes(term)) return true;
  for (let i = 0; i < term.length; i++) {
    matches += string.includes(term[i]) ? 1 : -1;
  }
  return matches / string.length >= ratio || term === "";
}
