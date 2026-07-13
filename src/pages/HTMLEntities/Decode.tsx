import IOwithCopy from "../../components/IOwithCopy";

const decodeHtmlEntities = (input: string): string =>
  new DOMParser().parseFromString(input, "text/html").documentElement
    .textContent ?? "";

const HTMLEntityDecode = () => {
  return (
    <IOwithCopy
      title="HTML Entity Decoder"
      subtitle="Convert HTML entities back to plain text"
      inputPlaceholder="&lt;div&gt;Text &amp;amp; more&lt;/div&gt;"
      buttonText="Decode"
      onButtonClick={decodeHtmlEntities}
    />
  );
};

export default HTMLEntityDecode;
