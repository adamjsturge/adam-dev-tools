import { useClipboard } from "../utils/useClipboard";
import Button, { ButtonProps } from "./Button";

interface CopyButtonProps extends Omit<ButtonProps, "onClick" | "children"> {
  text: string | (() => string);
  label?: string;
  copiedLabel?: string;
}

const CopyButton = ({
  text,
  label = "Copy",
  copiedLabel = "✓ Copied!",
  variant = "secondary",
  ...props
}: CopyButtonProps) => {
  const { copy, copied } = useClipboard();

  return (
    <Button
      variant={variant}
      onClick={() => copy(typeof text === "function" ? text() : text)}
      {...props}
    >
      {copied ? copiedLabel : label}
    </Button>
  );
};

export default CopyButton;
