import IOwithCopy from "../../components/IOwithCopy";

const encodeURL = (input: string): string => {
  try {
    return encodeURIComponent(input);
  } catch {
    return "Invalid input string";
  }
};

const URLEncode = () => {
  return (
    <IOwithCopy
      title="URL Encoder"
      inputPlaceholder="Enter string to encode"
      buttonText="Encode"
      onButtonClick={encodeURL}
    />
  );
};

export default URLEncode;
