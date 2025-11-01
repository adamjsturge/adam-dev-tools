import { useEffect, useRef } from "react";
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
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col px-4 pt-8 pb-4">
      <h1 className="mb-4 text-2xl font-bold">Text Bin</h1>
      <TextArea
        ref={textAreaRef}
        value={content}
        onChange={handleInput}
        customClass="h-[70vh] w-full"
      />
    </main>
  );
};

export default TextBin;
