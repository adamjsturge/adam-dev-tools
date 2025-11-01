import IOwithCopy from "../../components/IOwithCopy";

const decodeUrl = (input: string): string => {
  try {
    return decodeURIComponent(input);
  } catch {
    return "Invalid URL encoded string";
  }
};

const URLDecode = () => {
  return (
    <IOwithCopy
      title="URL Decoder"
      inputPlaceholder="Enter string to decode"
      buttonText="Decode"
      onButtonClick={decodeUrl}
    />
  );
};

export default URLDecode;
