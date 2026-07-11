import { useEffect, useState } from "react";
import CopyButton from "../../components/CopyButton";
import PageShell from "../../components/PageShell";
import TextArea from "../../components/TextArea";

const ALGORITHMS = ["SHA-1", "SHA-256", "SHA-512"] as const;

type Algorithm = (typeof ALGORITHMS)[number];

async function digest(algorithm: Algorithm, text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buffer = await crypto.subtle.digest(algorithm, data);
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

const HashGenerator = () => {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<Algorithm, string> | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const compute = async () => {
      const entries = await Promise.all(
        ALGORITHMS.map(async (algorithm) => [
          algorithm,
          await digest(algorithm, input),
        ]),
      );
      if (!isCancelled) {
        setHashes(Object.fromEntries(entries) as Record<Algorithm, string>);
      }
    };
    void compute();
    return () => {
      isCancelled = true;
    };
  }, [input]);

  return (
    <PageShell
      title="Hash Generator"
      subtitle="Compute SHA-1, SHA-256, and SHA-512 hashes of any text"
    >
      <div className="mb-8">
        <TextArea
          id="hash-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to hash"
          label="Input"
          rows={6}
        />
      </div>

      {hashes && (
        <div>
          <h2 className="text-ctp-text mb-4 text-xl font-bold">Hashes</h2>
          <div className="bg-ctp-surface0 divide-ctp-surface1 divide-y rounded-md">
            {ALGORITHMS.map((algorithm) => (
              <div
                key={algorithm}
                className="flex items-center gap-3 px-4 py-2"
              >
                <div className="text-ctp-text w-20 shrink-0 text-sm font-semibold">
                  {algorithm}
                </div>
                <code className="text-ctp-text flex-1 font-mono text-sm break-all">
                  {hashes[algorithm]}
                </code>
                <CopyButton text={hashes[algorithm]} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default HashGenerator;
