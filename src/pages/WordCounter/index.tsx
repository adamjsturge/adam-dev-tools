import { useMemo, useState } from "react";
import PageShell from "../../components/PageShell";
import TextArea from "../../components/TextArea";

interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  sentences: number;
  paragraphs: number;
}

function calculateStats(input: string): TextStats {
  return {
    characters: input.length,
    charactersNoSpaces: input.replaceAll(/\s/g, "").length,
    words: input.trim() === "" ? 0 : input.trim().split(/\s+/).length,
    lines: input.split("\n").length,
    sentences:
      input.trim() === "" ? 0 : input.split(/[.!?]+/).filter(Boolean).length,
    paragraphs:
      input.trim() === "" ? 0 : input.split(/\n\s*\n/).filter(Boolean).length,
  };
}

const WordCounter = () => {
  const [text, setText] = useState("");

  const stats = useMemo(() => calculateStats(text), [text]);

  const statEntries = [
    { label: "Characters", value: stats.characters },
    { label: "Characters (no spaces)", value: stats.charactersNoSpaces },
    { label: "Words", value: stats.words },
    { label: "Lines", value: stats.lines },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
  ];

  return (
    <PageShell
      title="Ultimate Word Counter"
      subtitle="Count characters, words, lines, sentences, and paragraphs as you type"
      wide
    >
      <div className="grid flex-1 grid-cols-1 content-start gap-4 lg:grid-cols-[minmax(0,1fr)_16rem] lg:grid-rows-[minmax(0,1fr)]">
        <div className="flex min-h-[45vh] flex-col lg:min-h-0">
          <TextArea
            aria-label="Text to count"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing or paste your text here..."
            fill
          />
        </div>

        <div className="grid grid-cols-2 content-start gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {statEntries.map((entry) => (
            <div key={entry.label} className="bg-ctp-surface0 rounded-md p-4">
              <h3 className="text-ctp-subtext0 text-sm font-medium">
                {entry.label}
              </h3>
              <p className="text-ctp-text text-xl font-bold">{entry.value}</p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

export default WordCounter;
