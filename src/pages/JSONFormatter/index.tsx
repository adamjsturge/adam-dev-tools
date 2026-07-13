import IOwithCopy from "../../components/IOwithCopy";

const transformJson =
  (indent: number) =>
  (input: string): string => {
    try {
      return JSON.stringify(JSON.parse(input), null, indent);
    } catch (error) {
      return error instanceof Error ? error.message : "Invalid JSON";
    }
  };

const JSONFormatter = () => {
  return (
    <IOwithCopy
      title="JSON Formatter"
      subtitle="Format, minify, and validate JSON"
      inputPlaceholder='{"paste": "your JSON here"}'
      actions={[
        { label: "Format", transform: transformJson(2) },
        { label: "Minify", transform: transformJson(0) },
      ]}
    />
  );
};

export default JSONFormatter;
