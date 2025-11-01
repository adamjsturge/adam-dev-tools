import { useState } from "react";
import TextArea from "./TextArea";

interface IOwithCopyProps {
  title: string;
  inputPlaceholder?: string;
  buttonText: string;
  onButtonClick: (input: string) => string;
}

const IOwithCopy = ({
  title,
  inputPlaceholder = "",
  buttonText,
  onButtonClick,
}: IOwithCopyProps) => {
  const [inputValue, setInputValue] = useState("");
  const [outputValue, setOutputValue] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const handleClick = () => {
    setOutputValue(onButtonClick(inputValue));
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(outputValue);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="container mx-auto flex max-w-4xl flex-col gap-6 px-4 pt-8">
      <h1 className="text-ctp-text text-center text-3xl font-bold tracking-tight">
        {title}
      </h1>

      <div className="space-y-6">
        <TextArea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={inputPlaceholder}
          customClass="h-[45vh] w-full"
          label="Input"
        />

        <div className="flex justify-center">
          <button
            onClick={handleClick}
            disabled={!inputValue.trim()}
            className="bg-ctp-blue hover:bg-ctp-blue/90 disabled:bg-ctp-surface2 disabled:text-ctp-overlay0 text-ctp-base rounded-lg px-6 py-2.5 font-semibold shadow-lg transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {buttonText}
          </button>
        </div>

        <TextArea
          value={outputValue}
          readOnly
          customClass="h-[45vh] w-full"
          placeholder="Output will appear here..."
          label="Output"
        />

        <div className="flex justify-center">
          <button
            onClick={copyToClipboard}
            disabled={!outputValue}
            className="bg-ctp-surface0 hover:bg-ctp-surface1 disabled:bg-ctp-surface0/50 disabled:text-ctp-overlay0 border-ctp-surface2 text-ctp-text rounded-lg border-2 px-6 py-2.5 font-semibold transition-all duration-200 active:scale-95 disabled:cursor-not-allowed"
          >
            {isCopied ? "✓ Copied!" : "Copy Output"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IOwithCopy;
