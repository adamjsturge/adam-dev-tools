import { useEffect, useRef } from "react";
import TextArea from "../../components/TextArea";
import { useReactPersist } from "../../utils/Storage";
import { normalizeSimCodes } from "../../utils/simCodes";

const SimCodeConverter = () => {
  const [content, setContent] = useReactPersist(
    "sim-code-converter-content",
    "",
  );
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    const normalized = normalizeSimCodes(newContent);
    setContent(normalized);
  };

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col px-4 pt-8 pb-4">
      <h1 className="text-ctp-text mb-4 text-2xl font-bold">
        Sim Code Converter
      </h1>
      <p className="text-ctp-subtext0 mb-4 text-sm">
        Paste your deck list and it will automatically convert to standard
        format (e.g., 4 OP01-001 → 4xOP01-001)
      </p>
      <TextArea
        ref={textAreaRef}
        value={content}
        onChange={handleInput}
        customClass="h-[70vh] w-full"
      />
    </main>
  );
};

export default SimCodeConverter;
