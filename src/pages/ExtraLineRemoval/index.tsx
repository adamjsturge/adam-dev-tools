import { useEffect, useRef } from "react";
import TextArea from "../../components/TextArea";
import { useReactPersist } from "../../utils/Storage";

const ExtraLineRemoval = () => {
  const [content, setContent] = useReactPersist(
    "extra-line-removal-content",
    "",
  );
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  const removeExtraLines = () => {
    const filtered = content
      .split("\n")
      .filter((line) => line.trim() !== "")
      .join("\n");
    setContent(filtered);
  };

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col px-4 pt-8 pb-4">
      <h1 className="text-ctp-text mb-4 text-2xl font-bold">
        Extra Line Removal
      </h1>
      <div className="mb-4 flex justify-end">
        <button
          className="bg-ctp-blue text-ctp-base hover:bg-ctp-sapphire rounded px-4 py-2"
          onClick={removeExtraLines}
        >
          Remove Extra Lines
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

export default ExtraLineRemoval;
