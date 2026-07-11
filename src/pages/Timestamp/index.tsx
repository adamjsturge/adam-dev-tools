import { useState } from "react";
import Button from "../../components/Button";
import CopyButton from "../../components/CopyButton";
import Input from "../../components/Input";
import PageShell from "../../components/PageShell";
import { useUrlStringState } from "../../utils/useUrlState";

interface ParsedEpoch {
  date: Date;
  unit: "seconds" | "milliseconds";
}

function parseEpoch(input: string): ParsedEpoch | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return null;
  const unit = Math.abs(value) >= 1e12 ? "milliseconds" : "seconds";
  const date = new Date(unit === "milliseconds" ? value : value * 1000);
  return Number.isNaN(date.getTime()) ? null : { date, unit };
}

function relativeTime(date: Date): string {
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["day", 86_400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  for (const [unit, unitSeconds] of units) {
    if (Math.abs(seconds) >= unitSeconds) {
      return formatter.format(Math.round(seconds / unitSeconds), unit);
    }
  }
  return formatter.format(seconds, "second");
}

interface ResultRow {
  label: string;
  value: string;
}

const ResultRows = ({ rows }: { rows: ResultRow[] }) => (
  <div className="bg-ctp-surface0 divide-ctp-surface1 divide-y rounded-md">
    {rows.map(({ label, value }) => (
      <div key={label} className="flex items-center gap-3 px-4 py-2">
        <div className="text-ctp-subtext0 w-32 shrink-0 text-sm font-semibold">
          {label}
        </div>
        <code className="text-ctp-text flex-1 font-mono text-sm break-all">
          {value}
        </code>
        <CopyButton text={value} size="sm" />
      </div>
    ))}
  </div>
);

const Timestamp = () => {
  const [epochInput, setEpochInput] = useUrlStringState("t", "");
  const [dateInput, setDateInput] = useState("");

  const parsedEpoch = parseEpoch(epochInput);
  const parsedDate = dateInput ? new Date(dateInput) : null;
  const isDateValid =
    parsedDate !== null && !Number.isNaN(parsedDate.getTime());

  return (
    <PageShell
      title="Unix Timestamp Converter"
      subtitle="Convert between Unix epoch timestamps and human-readable dates"
    >
      <div className="mb-10">
        <h2 className="text-ctp-text mb-4 text-xl font-bold">
          Timestamp to Date
        </h2>
        <div className="mb-4 flex items-end gap-3">
          <Input
            id="epoch-input"
            label="Epoch timestamp"
            type="text"
            inputMode="numeric"
            value={epochInput}
            onChange={(e) => setEpochInput(e.target.value)}
            placeholder="1752105600"
            customClass="flex-1"
            error={
              epochInput.trim() && !parsedEpoch
                ? "Invalid timestamp"
                : undefined
            }
            helperText={
              parsedEpoch ? `Interpreted as ${parsedEpoch.unit}` : undefined
            }
          />
          <Button
            onClick={() =>
              setEpochInput(Math.floor(Date.now() / 1000).toString())
            }
          >
            Now
          </Button>
        </div>
        {parsedEpoch && (
          <ResultRows
            rows={[
              {
                label: "ISO 8601 (UTC)",
                value: parsedEpoch.date.toISOString(),
              },
              { label: "Local time", value: parsedEpoch.date.toLocaleString() },
              { label: "Relative", value: relativeTime(parsedEpoch.date) },
            ]}
          />
        )}
      </div>

      <div>
        <h2 className="text-ctp-text mb-4 text-xl font-bold">
          Date to Timestamp
        </h2>
        <div className="mb-4">
          <Input
            id="date-input"
            label="Date and time (local)"
            type="datetime-local"
            step="1"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
          />
        </div>
        {isDateValid && (
          <ResultRows
            rows={[
              {
                label: "Epoch seconds",
                value: Math.floor(parsedDate.getTime() / 1000).toString(),
              },
              {
                label: "Epoch ms",
                value: parsedDate.getTime().toString(),
              },
            ]}
          />
        )}
      </div>
    </PageShell>
  );
};

export default Timestamp;
