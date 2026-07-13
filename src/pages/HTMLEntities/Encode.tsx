import IOwithCopy from "../../components/IOwithCopy";

const encodeHtmlEntities = (input: string): string =>
  input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const HTMLEntityEncode = () => {
  return (
    <IOwithCopy
      title="HTML Entity Encoder"
      subtitle="Escape HTML special characters into entities"
      inputPlaceholder='<div class="example">Text & more</div>'
      buttonText="Encode"
      onButtonClick={encodeHtmlEntities}
    />
  );
};

export default HTMLEntityEncode;
