import { useMemo, useState } from "react";
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

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col px-4 pt-8 pb-4">
      <h1 className="text-ctp-text mb-4 text-2xl font-bold">
        Ultimate Word Counter
      </h1>

      <TextArea
        value={text}
        onChange={(e) => setText(e.target.value)}
        customClass="h-[40vh] w-full mb-4"
        placeholder="Start typing or paste your text here..."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="bg-ctp-surface0 rounded-lg p-4">
          <h3 className="text-ctp-text mb-2 font-bold">Characters</h3>
          <p className="text-ctp-text">{stats.characters}</p>
        </div>
        <div className="bg-ctp-surface0 rounded-lg p-4">
          <h3 className="text-ctp-text mb-2 font-bold">
            Characters (no spaces)
          </h3>
          <p className="text-ctp-text">{stats.charactersNoSpaces}</p>
        </div>
        <div className="bg-ctp-surface0 rounded-lg p-4">
          <h3 className="text-ctp-text mb-2 font-bold">Words</h3>
          <p className="text-ctp-text">{stats.words}</p>
        </div>
        <div className="bg-ctp-surface0 rounded-lg p-4">
          <h3 className="text-ctp-text mb-2 font-bold">Lines</h3>
          <p className="text-ctp-text">{stats.lines}</p>
        </div>
        <div className="bg-ctp-surface0 rounded-lg p-4">
          <h3 className="text-ctp-text mb-2 font-bold">Sentences</h3>
          <p className="text-ctp-text">{stats.sentences}</p>
        </div>
        <div className="bg-ctp-surface0 rounded-lg p-4">
          <h3 className="text-ctp-text mb-2 font-bold">Paragraphs</h3>
          <p className="text-ctp-text">{stats.paragraphs}</p>
        </div>
      </div>
    </main>
  );
};

export default WordCounter;
