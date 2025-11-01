import IOwithCopy from "../../components/IOwithCopy";

const decodeBase64 = (input: string): string => {
  try {
    return atob(input);
  } catch {
    return "Invalid Base64 string";
  }
};

const Base64Decode = () => {
  return (
    <IOwithCopy
      title="Base64 Decoder"
      inputPlaceholder="Enter Base64 string"
      buttonText="Decode"
      onButtonClick={decodeBase64}
    />
  );
};

export default Base64Decode;
