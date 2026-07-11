import { useState } from "react";
import Button from "../../components/Button";
import CopyButton from "../../components/CopyButton";
import Input from "../../components/Input";
import PageShell from "../../components/PageShell";
import Select from "../../components/Select";

type IdType = "uuid-v4" | "uuid-v7" | "ulid";

function uuidV7(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const timestamp = BigInt(Date.now());
  for (let index = 0; index < 6; index++) {
    bytes[index] = Number((timestamp >> BigInt(8 * (5 - index))) & 255n);
  }
  // Decimal masks: Prettier and unicorn/number-literal-case disagree on hex
  bytes[6] = (bytes[6] & 15) | 112; // version 7 in the high nibble
  bytes[8] = (bytes[8] & 63) | 128; // RFC 4122 variant bits
  const hex = [...bytes]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function ulid(): string {
  let timestamp = Date.now();
  let timePart = "";
  for (let index = 0; index < 10; index++) {
    timePart = CROCKFORD[timestamp % 32] + timePart;
    timestamp = Math.floor(timestamp / 32);
  }
  // 256 is a multiple of 32, so byte % 32 stays uniform
  const randomBytes = crypto.getRandomValues(new Uint8Array(16));
  let randomPart = "";
  for (let index = 0; index < 16; index++) {
    randomPart += CROCKFORD[randomBytes[index] % 32];
  }
  return timePart + randomPart;
}

const GENERATORS: Record<IdType, () => string> = {
  "uuid-v4": () => crypto.randomUUID(),
  "uuid-v7": uuidV7,
  ulid,
};

const UUIDGenerator = () => {
  const [type, setType] = useState<IdType>("uuid-v4");
  const [count, setCount] = useState(1);
  const [ids, setIds] = useState<string[]>(() => [crypto.randomUUID()]);

  const generate = () => {
    setIds(Array.from({ length: count }, GENERATORS[type]));
  };

  return (
    <PageShell
      title="UUID / ULID Generator"
      subtitle="Generate UUID v4, UUID v7, and ULID identifiers"
    >
      <div className="mb-8 flex flex-wrap items-end gap-3">
        <Select
          id="id-type"
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value as IdType)}
          customClass="w-40"
        >
          <option value="uuid-v4">UUID v4</option>
          <option value="uuid-v7">UUID v7</option>
          <option value="ulid">ULID</option>
        </Select>
        <Input
          id="id-count"
          label="Count"
          type="number"
          min={1}
          max={100}
          value={count}
          onChange={(e) =>
            setCount(Math.min(100, Math.max(1, Number(e.target.value) || 1)))
          }
          customClass="w-28"
        />
        <Button onClick={generate}>Generate</Button>
        {ids.length > 1 && (
          <CopyButton text={ids.join("\n")} label="Copy All" />
        )}
      </div>

      {ids.length > 0 && (
        <div className="bg-ctp-surface0 divide-ctp-surface1 divide-y rounded-md">
          {ids.map((id, index) => (
            <div key={index} className="flex items-center gap-3 px-4 py-2">
              <code className="text-ctp-text flex-1 font-mono text-sm break-all">
                {id}
              </code>
              <CopyButton text={id} size="sm" />
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default UUIDGenerator;
