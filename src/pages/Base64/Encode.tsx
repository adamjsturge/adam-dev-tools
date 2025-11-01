import IOwithCopy from "../../components/IOwithCopy";

const encodeBase64 = (input: string): string => {
  try {
    return btoa(input);
  } catch {
    return "Invalid input string";
  }
};

const Base64Encode = () => {
  return (
    <IOwithCopy
      title="Base64 Encoder"
      inputPlaceholder="Enter string to encode"
      buttonText="Encode"
      onButtonClick={encodeBase64}
    />
  );
};

export default Base64Encode;
