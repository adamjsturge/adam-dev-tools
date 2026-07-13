import { useMemo } from "react";
import CopyButton from "../../components/CopyButton";
import Input from "../../components/Input";
import PageShell from "../../components/PageShell";
import { useUrlStringState } from "../../utils/useUrlState";

function tokenize(input: string): string[] {
  return input
    .replaceAll(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replaceAll(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[\s/_-]+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());
}

const capitalize = (word: string): string =>
  word.charAt(0).toUpperCase() + word.slice(1);

const CASES: { label: string; convert: (words: string[]) => string }[] = [
  {
    label: "camelCase",
    convert: (words) =>
      words.map((word, i) => (i === 0 ? word : capitalize(word))).join(""),
  },
  {
    label: "PascalCase",
    convert: (words) => words.map(capitalize).join(""),
  },
  {
    label: "snake_case",
    convert: (words) => words.join("_"),
  },
  {
    label: "SCREAMING_SNAKE_CASE",
    convert: (words) => words.map((word) => word.toUpperCase()).join("_"),
  },
  {
    label: "kebab-case",
    convert: (words) => words.join("-"),
  },
  {
    label: "Title Case",
    convert: (words) => words.map(capitalize).join(" "),
  },
  {
    label: "Sentence case",
    convert: (words) =>
      words.map((word, i) => (i === 0 ? capitalize(word) : word)).join(" "),
  },
  {
    label: "lowercase",
    convert: (words) => words.join(" "),
  },
  {
    label: "UPPERCASE",
    convert: (words) => words.map((word) => word.toUpperCase()).join(" "),
  },
];

const CaseConverter = () => {
  const [input, setInput] = useUrlStringState("text", "");

  const words = useMemo(() => tokenize(input), [input]);

  return (
    <PageShell
      title="Case Converter"
      subtitle="Convert text between camelCase, snake_case, kebab-case, and more"
    >
      <div className="mb-8">
        <Input
          id="case-input"
          label="Input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="hello world example"
        />
      </div>

      {words.length > 0 && (
        <div>
          <h2 className="text-ctp-text mb-4 text-xl font-bold">Conversions</h2>
          <div className="bg-ctp-surface0 divide-ctp-surface1 divide-y rounded-md">
            {CASES.map(({ label, convert }) => {
              const converted = convert(words);
              return (
                <div key={label} className="flex items-center gap-3 px-4 py-2">
                  <div className="text-ctp-subtext0 w-48 shrink-0 text-sm font-semibold">
                    {label}
                  </div>
                  <code className="text-ctp-text flex-1 font-mono text-sm break-all">
                    {converted}
                  </code>
                  <CopyButton text={converted} size="sm" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default CaseConverter;
