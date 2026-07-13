import { useRef, useState } from "react";
import Button from "../../components/Button";
import PageShell from "../../components/PageShell";
import TextArea from "../../components/TextArea";
import { useReactPersist } from "../../utils/Storage";

type DiffLine = {
  type: "equal" | "added" | "removed";
  content: string;
};

function computeDiff(text1: string, text2: string): DiffLine[] {
  const lines1 = text1.split("\n");
  const lines2 = text2.split("\n");
  const result: DiffLine[] = [];

  let i = 0,
    j = 0;

  while (i < lines1.length || j < lines2.length) {
    if (i >= lines1.length) {
      result.push({ type: "added", content: lines2[j] });
      j++;
    } else if (j >= lines2.length) {
      result.push({ type: "removed", content: lines1[i] });
      i++;
    } else if (lines1[i] === lines2[j]) {
      result.push({ type: "equal", content: lines1[i] });
      i++;
      j++;
    } else {
      let found = false;

      for (let k = j + 1; k < Math.min(j + 5, lines2.length); k++) {
        if (lines1[i] === lines2[k]) {
          for (let l = j; l < k; l++) {
            result.push({ type: "added", content: lines2[l] });
          }
          result.push({ type: "equal", content: lines1[i] });
          i++;
          j = k + 1;
          found = true;
          break;
        }
      }

      if (!found) {
        for (let k = i + 1; k < Math.min(i + 5, lines1.length); k++) {
          if (lines2[j] === lines1[k]) {
            for (let l = i; l < k; l++) {
              result.push({ type: "removed", content: lines1[l] });
            }
            result.push({ type: "equal", content: lines2[j] });
            i = k + 1;
            j++;
            found = true;
            break;
          }
        }
      }

      if (!found) {
        result.push(
          { type: "removed", content: lines1[i] },
          { type: "added", content: lines2[j] },
        );
        i++;
        j++;
      }
    }
  }

  return result;
}

const TextCompare = () => {
  const [text1, setText1] = useReactPersist("compare-text1", "");
  const [text2, setText2] = useReactPersist("compare-text2", "");
  const [showDiff, setShowDiff] = useState(false);
  const [diffResult, setDiffResult] = useState<DiffLine[]>([]);
  const textArea1Ref = useRef<HTMLTextAreaElement>(null);

  const compareTexts = () => {
    setDiffResult(computeDiff(text1, text2));
    setShowDiff(true);
  };

  const clearAll = () => {
    setText1("");
    setText2("");
    setShowDiff(false);
    setDiffResult([]);
    setTimeout(() => textArea1Ref.current?.focus(), 0);
  };

  return (
    <PageShell
      title="Text Compare"
      subtitle="Compare two blocks of text line by line"
      wide
    >
      <div className="mb-4 flex gap-2">
        <Button onClick={compareTexts}>Compare Texts</Button>
        <Button variant="secondary" onClick={clearAll}>
          Clear All
        </Button>
      </div>

      {showDiff ? (
        <div className="flex-1 overflow-auto">
          <div className="mb-4 flex items-center gap-4">
            <h2 className="text-ctp-text text-lg font-semibold">
              Comparison Result
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDiff(false)}
            >
              Back to Edit
            </Button>
          </div>

          <div className="text-ctp-subtext1 mb-4 text-sm">
            <span className="border-ctp-red bg-ctp-red/30 mr-2 inline-block h-4 w-4 border"></span>
            Removed from original
            <span className="border-ctp-green bg-ctp-green/30 mr-2 ml-4 inline-block h-4 w-4 border"></span>
            Added in comparison
            <span className="border-ctp-surface2 bg-ctp-surface1 mr-2 ml-4 inline-block h-4 w-4 border"></span>
            Unchanged
          </div>

          <div className="bg-ctp-surface0 border-ctp-surface1 rounded-md border p-4 font-mono text-sm whitespace-pre-wrap">
            {diffResult.map((line, index) => {
              if (line.type === "equal") {
                return (
                  <div
                    key={index}
                    className="bg-ctp-surface1 border-ctp-surface2 border-l-4 px-2 py-1"
                  >
                    {line.content}
                  </div>
                );
              } else if (line.type === "removed") {
                return (
                  <div
                    key={index}
                    className="bg-ctp-red/20 border-ctp-red text-ctp-red border-l-4 px-2 py-1"
                  >
                    - {line.content}
                  </div>
                );
              } else {
                return (
                  <div
                    key={index}
                    className="bg-ctp-green/20 border-ctp-green text-ctp-green border-l-4 px-2 py-1"
                  >
                    + {line.content}
                  </div>
                );
              }
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-4 md:flex-row">
          <div className="flex min-h-[40vh] flex-1 flex-col md:min-h-0">
            <h2 className="text-ctp-text mb-2 text-lg font-semibold">
              Text 1 (Original)
            </h2>
            <TextArea
              ref={textArea1Ref}
              aria-label="Text 1 (Original)"
              value={text1}
              onChange={(e) => {
                setText1(e.target.value);
                setShowDiff(false);
              }}
              fill
              placeholder="Paste your first text here..."
            />
          </div>
          <div className="flex min-h-[40vh] flex-1 flex-col md:min-h-0">
            <h2 className="text-ctp-text mb-2 text-lg font-semibold">
              Text 2 (Compare to)
            </h2>
            <TextArea
              aria-label="Text 2 (Compare to)"
              value={text2}
              onChange={(e) => {
                setText2(e.target.value);
                setShowDiff(false);
              }}
              fill
              placeholder="Paste your second text here..."
            />
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default TextCompare;
