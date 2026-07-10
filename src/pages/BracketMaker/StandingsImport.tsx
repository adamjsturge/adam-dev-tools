import { useState } from "react";
import Button from "../../components/Button";
import TextArea from "../../components/TextArea";
import classNames from "../../utils/classNames";

interface StandingsImportProps {
  onImport: (names: string[]) => void;
}

const StandingsImport = ({ onImport }: StandingsImportProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rawText, setRawText] = useState("");

  const handleParse = () => {
    const lines = rawText.split("\n").filter((line) => line.trim() !== "");
    const names: string[] = [];

    for (let i = 0; i < lines.length; i += 6) {
      if (i + 1 < lines.length) {
        names.push(lines[i + 1].trim());
      }
    }

    if (names.length > 0) {
      onImport(names);
      setRawText("");
      setIsOpen(false);
    }
  };

  return (
    <div className="border-ctp-surface2 rounded-md border">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={classNames(
          "text-ctp-text flex w-full items-center justify-between p-4 text-sm font-semibold",
          "transition-colors duration-100",
          "hover:bg-ctp-surface1 rounded-md",
        )}
        aria-expanded={isOpen}
        aria-label="Toggle import standings section"
      >
        <span>Import Standings</span>
        <svg
          className={classNames(
            "h-4 w-4 transition-transform duration-100",
            isOpen ? "rotate-180" : "",
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="space-y-3 p-4 pt-0">
          <TextArea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste standings here..."
            rows={8}
            aria-label="Standings text input"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleParse}
            disabled={!rawText.trim()}
            aria-label="Parse standings and fill player names"
          >
            Parse & Fill
          </Button>
        </div>
      )}
    </div>
  );
};

export default StandingsImport;
