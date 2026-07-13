import { useEffect, useRef } from "react";
import PageShell from "../../components/PageShell";
import TextArea from "../../components/TextArea";
import { useReactPersist } from "../../utils/Storage";

const STORAGE_KEY = "text-bin-content";

const TextBin = () => {
  const [content, setContent] = useReactPersist(STORAGE_KEY, "");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.currentTarget.value;
    setContent(value);
  };

  return (
    <PageShell
      title="Text Bin"
      subtitle="A scratchpad that persists in your browser"
      wide
    >
      <TextArea
        ref={textAreaRef}
        aria-label="Text Bin scratchpad"
        value={content}
        onChange={handleInput}
        fill
      />
    </PageShell>
  );
};

export default TextBin;
