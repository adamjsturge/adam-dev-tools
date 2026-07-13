import { useEffect, useRef } from "react";
import Button from "../../components/Button";
import PageShell from "../../components/PageShell";
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
    <PageShell
      title="Extra Line Removal"
      subtitle="Strip blank lines from any block of text"
      wide
    >
      <div className="mb-4 flex justify-end">
        <Button onClick={removeExtraLines}>Remove Extra Lines</Button>
      </div>
      <TextArea
        ref={textAreaRef}
        aria-label="Text to remove extra lines from"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        fill
      />
    </PageShell>
  );
};

export default ExtraLineRemoval;
