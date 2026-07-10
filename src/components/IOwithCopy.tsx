import { useState } from "react";
import Button from "./Button";
import CopyButton from "./CopyButton";
import PageShell from "./PageShell";
import TextArea from "./TextArea";

interface IOwithCopyProps {
  title: string;
  subtitle: string;
  inputPlaceholder?: string;
  buttonText: string;
  onButtonClick: (input: string) => string;
}

const IOwithCopy = ({
  title,
  subtitle,
  inputPlaceholder = "",
  buttonText,
  onButtonClick,
}: IOwithCopyProps) => {
  const [inputValue, setInputValue] = useState("");
  const [outputValue, setOutputValue] = useState("");

  const handleClick = () => {
    setOutputValue(onButtonClick(inputValue));
  };

  return (
    <PageShell title={title} subtitle={subtitle} wide>
      <div className="grid flex-1 grid-cols-1 content-start gap-4 lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)_auto]">
        <div className="flex min-h-[45vh] flex-col lg:min-h-0">
          <TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={inputPlaceholder}
            label="Input"
            fill
          />
        </div>

        <div className="flex justify-center lg:order-3">
          <Button onClick={handleClick} disabled={!inputValue.trim()}>
            {buttonText}
          </Button>
        </div>

        <div className="flex min-h-[45vh] flex-col lg:order-2 lg:min-h-0">
          <TextArea
            value={outputValue}
            readOnly
            placeholder="Output will appear here..."
            label="Output"
            fill
          />
        </div>

        <div className="flex justify-center lg:order-4">
          <CopyButton
            text={outputValue}
            label="Copy Output"
            disabled={!outputValue}
          />
        </div>
      </div>
    </PageShell>
  );
};

export default IOwithCopy;
