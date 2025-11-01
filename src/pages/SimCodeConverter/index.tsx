import { useEffect, useRef } from "react";
import TextArea from "../../components/TextArea";
import { useReactPersist } from "../../utils/Storage";

const SimCodeConverter = () => {
  const [content, setContent] = useReactPersist(
    "sim-code-converter-content",
    "",
  );
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  const convertSimCodes = () => {
    const converted = content
      .split("\n")
      .map((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine === "") return trimmedLine;

        const match = trimmedLine.match(/^(\d+)(x|\s)([^\s]+)/);
        if (match) {
          const quantity = match[1];
          const cardCode = match[3];
          return `${quantity}x${cardCode}`;
        }

        return line;
      })
      .join("\n");

    setContent(converted);
  };

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col px-4 pt-8 pb-4">
      <h1 className="text-ctp-text mb-4 text-2xl font-bold">
        Sim Code Converter
      </h1>
      <div className="mb-4 flex justify-end">
        <button
          className="bg-ctp-blue text-ctp-base hover:bg-ctp-sapphire rounded px-4 py-2"
          onClick={convertSimCodes}
        >
          Convert to Standard Format
        </button>
      </div>
      <TextArea
        ref={textAreaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        customClass="h-[70vh] w-full"
      />
    </main>
  );
};

export default SimCodeConverter;
