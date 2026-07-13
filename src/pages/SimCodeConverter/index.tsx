import { useEffect, useRef } from "react";
import PageShell from "../../components/PageShell";
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
    <PageShell
      title="Sim Code Converter"
      subtitle="Paste a deck list to auto-convert it to standard format (4 OP01-001 → 4xOP01-001)"
      wide
    >
      <TextArea
        ref={textAreaRef}
        aria-label="Deck list to convert"
        value={content}
        onChange={handleInput}
        fill
      />
    </PageShell>
  );
};

export default SimCodeConverter;
