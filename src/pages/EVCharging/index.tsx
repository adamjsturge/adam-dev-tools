import { useState } from "react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import PageShell from "../../components/PageShell";
import Section from "../../components/Section";
import { useUrlState, useUrlStringState } from "../../utils/useUrlState";

interface ChargingDataPoint {
  time: number;
  charge: number;
  actualTime: string;
}

interface GridLine {
  type: "horizontal" | "vertical";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  actualTime?: string;
  labelX: number;
  labelY: number;
}

const EVCharging = () => {
  const [currentCharge, setCurrentCharge] = useUrlState("current", 20);
  const [targetCharge, setTargetCharge] = useUrlState("target", 80);
  const [estimatedMinutes, setEstimatedMinutes] = useUrlState("minutes", 45);
  const [startTime, setStartTime] = useUrlStringState("start", "");
  const [showResults, setShowResults] = useState(false);
  const [chargingData, setChargingData] = useState<ChargingDataPoint[]>([]);
  const [hoverInfo, setHoverInfo] = useState({
    time: 0,
    charge: 0,
    actualTime: "",
  });

  const chargeRange = targetCharge - currentCharge;
  const isValidInputs = currentCharge < targetCharge && estimatedMinutes > 0;

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    if (hours === 0) {
      return mins === 1 ? "1 minute" : `${mins} minutes`;
    } else if (mins === 0) {
      return hours === 1 ? "1 hour" : `${hours} hours`;
    } else {
      const hourText = hours === 1 ? "1 hour" : `${hours} hours`;
      const minText = mins === 1 ? "1 minute" : `${mins} minutes`;
      return `${hourText} and ${minText}`;
    }
  };

  const formatTimeShort = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const addMinutesToTime = (timeStr: string, minutesToAdd: number): string => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes + minutesToAdd, 0, 0);
    return date.toTimeString().slice(0, 5);
  };

  const formatTimeAmPm = (timeStr: string): string => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const generateChargingCurve = (): ChargingDataPoint[] => {
    const data: ChargingDataPoint[] = [];
    const totalMinutes = estimatedMinutes;

    for (let index = 0; index <= 100; index++) {
      const progress = index / 100;

      const minutes = progress * totalMinutes;
      const charge = currentCharge + chargeRange * progress;
      const actualTime = addMinutesToTime(startTime, minutes);

      data.push({
        time: minutes,
        charge: Math.min(charge, targetCharge),
        actualTime,
      });
    }

    return data;
  };

  const setCurrentTime = () => {
    const now = new Date();
    setStartTime(now.toTimeString().slice(0, 5));
    setShowResults(false);
  };

  const calculateCharging = () => {
    if (!isValidInputs) return;
    setChargingData(generateChargingCurve());
    setShowResults(true);
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const svg = event.currentTarget;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const svgWidth = 600;
    const padding = 60;
    const chartWidth = svgWidth - padding * 2;

    const relativeX = Math.max(0, Math.min(chartWidth, x - padding));
    const progress = relativeX / chartWidth;
    const dataIndex = Math.round(progress * (chargingData.length - 1));

    if (dataIndex >= 0 && dataIndex < chargingData.length) {
      const point = chargingData[dataIndex];
      setHoverInfo({
        time: point.time,
        charge: point.charge,
        actualTime: point.actualTime,
      });
    }
  };

  const getChargingPath = (): string => {
    if (chargingData.length === 0) return "";

    const svgWidth = 600;
    const svgHeight = 400;
    const padding = 60;
    const chartWidth = svgWidth - padding * 2;
    const chartHeight = svgHeight - padding * 2;

    const maxTime = Math.max(...chargingData.map((d) => d.time));
    const minCharge = Math.min(
      currentCharge,
      ...chargingData.map((d) => d.charge),
    );
    const maxCharge = Math.max(
      targetCharge,
      ...chargingData.map((d) => d.charge),
    );

    return chargingData
      .map((point, index) => {
        const x = padding + (point.time / maxTime) * chartWidth;
        const y =
          padding +
          chartHeight -
          ((point.charge - minCharge) / (maxCharge - minCharge)) * chartHeight;
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  const getGridLines = (): GridLine[] => {
    const svgWidth = 600;
    const svgHeight = 400;
    const padding = 60;
    const chartWidth = svgWidth - padding * 2;
    const chartHeight = svgHeight - padding * 2;

    const lines: GridLine[] = [];

    for (let index = 0; index <= 10; index++) {
      const y = padding + (index / 10) * chartHeight;
      const charge = targetCharge - (index / 10) * chargeRange;
      lines.push({
        type: "horizontal",
        x1: padding,
        y1: y,
        x2: padding + chartWidth,
        y2: y,
        label: `${Math.round(charge)}%`,
        labelX: padding - 10,
        labelY: y + 4,
      });
    }

    for (let index = 0; index <= 6; index++) {
      const x = padding + (index / 6) * chartWidth;
      const minutes = (index / 6) * estimatedMinutes;
      const timeLabel = formatTimeShort(minutes);
      const actualTime = addMinutesToTime(startTime, minutes);

      lines.push({
        type: "vertical",
        x1: x,
        y1: padding,
        x2: x,
        y2: padding + chartHeight,
        label: timeLabel,
        actualTime: actualTime,
        labelX: x,
        labelY: padding + chartHeight + 20,
      });
    }

    return lines;
  };

  const reset = () => {
    setShowResults(false);
    setChargingData([]);
    setCurrentCharge(20);
    setTargetCharge(80);
    setEstimatedMinutes(45);
    setStartTime("");
  };

  return (
    <PageShell
      title="EV Charging Estimator"
      subtitle="Estimate slow-charging time and completion for your EV"
      wide
    >
      <div className="bg-ctp-surface0 text-ctp-blue mb-4 rounded-md p-4 text-center">
        <p>
          <strong>Slow Charging Model:</strong> This estimator assumes linear
          charging throughout the entire process. Unlike fast charging which
          typically slows down at 80%, slow charging (Level 1/2) maintains a
          consistent rate.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[24rem_minmax(0,1fr)] lg:items-start">
        <Section title="Charging Details">
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="currentCharge"
              label="Current Charge (%)"
              type="number"
              min={0}
              max={100}
              value={currentCharge}
              onChange={(e) => {
                setCurrentCharge(Number(e.target.value));
                setShowResults(false);
              }}
            />
            <Input
              id="targetCharge"
              label="Target Charge (%)"
              type="number"
              min={0}
              max={100}
              value={targetCharge}
              onChange={(e) => {
                setTargetCharge(Number(e.target.value));
                setShowResults(false);
              }}
            />
          </div>

          <Input
            id="estimatedMinutes"
            label="Estimated Time (minutes)"
            type="number"
            min={1}
            value={estimatedMinutes}
            onChange={(e) => {
              setEstimatedMinutes(Number(e.target.value));
              setShowResults(false);
            }}
            placeholder="45"
            helperText="Time your car estimates to reach target charge"
            customClass="mt-4"
          />

          <div className="mt-4 flex items-start gap-2">
            <Input
              id="startTime"
              label="Start Time (optional)"
              type="time"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                setShowResults(false);
              }}
              helperText="Set to see actual completion times in AM/PM format"
              customClass="flex-1"
            />
            <Button
              variant="secondary"
              onClick={setCurrentTime}
              customClass="mt-9"
            >
              Now
            </Button>
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={calculateCharging} disabled={!isValidInputs}>
              Calculate Charging
            </Button>
            <Button variant="secondary" onClick={reset}>
              Reset
            </Button>
          </div>
        </Section>

        {showResults ? (
          <div className="flex flex-col">
            <div className="mb-4">
              <h2 className="text-ctp-text text-xl font-semibold">
                Charging from {currentCharge}% to {targetCharge}%
              </h2>
              <p
                className="text-ctp-subtext1 text-sm"
                aria-label={`Total charging time: ${formatTime(estimatedMinutes)}`}
              >
                Duration: {formatTime(estimatedMinutes)}
              </p>
            </div>

            <Section>
              <div className="relative overflow-x-auto">
                <svg
                  width="600"
                  height="400"
                  className="border-ctp-surface1 bg-ctp-mantle rounded-md border"
                  role="img"
                  aria-label={`EV charging curve showing linear progression from ${currentCharge}% to ${targetCharge}% over ${formatTime(estimatedMinutes)}`}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() =>
                    setHoverInfo({ time: 0, charge: 0, actualTime: "" })
                  }
                >
                  {getGridLines().map((line, index) => (
                    <g key={index}>
                      <line
                        x1={line.x1}
                        y1={line.y1}
                        x2={line.x2}
                        y2={line.y2}
                        className="stroke-ctp-surface2"
                        strokeWidth="1"
                      />
                      <text
                        x={line.labelX}
                        y={line.labelY}
                        className="fill-ctp-subtext0"
                        fontSize="12"
                        textAnchor={
                          line.type === "horizontal" ? "end" : "middle"
                        }
                      >
                        {line.label}
                      </text>
                      {line.actualTime && startTime && (
                        <text
                          x={line.labelX}
                          y={line.labelY + 15}
                          className="fill-ctp-subtext1"
                          fontSize="10"
                          textAnchor="middle"
                        >
                          {formatTimeAmPm(line.actualTime)}
                        </text>
                      )}
                    </g>
                  ))}

                  <path
                    d={getChargingPath()}
                    fill="none"
                    className="stroke-ctp-green"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  <circle
                    cx="60"
                    cy={
                      340 -
                      ((currentCharge - currentCharge) / chargeRange) * 280
                    }
                    r="6"
                    className="fill-ctp-red"
                  />
                  <circle
                    cx="540"
                    cy={340 - (chargeRange / chargeRange) * 280}
                    r="6"
                    className="fill-ctp-green"
                  />
                </svg>

                {hoverInfo.charge > 0 && (
                  <div className="border-ctp-surface1 bg-ctp-surface2 text-ctp-text absolute top-4 right-4 rounded-md border p-3 text-sm">
                    <div>
                      <strong>{Math.round(hoverInfo.charge)}%</strong> charge
                    </div>
                    <div>After {formatTime(hoverInfo.time)}</div>
                    {hoverInfo.actualTime && startTime && (
                      <div>At {formatTimeAmPm(hoverInfo.actualTime)}</div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="bg-ctp-red h-4 w-4 rounded-full"></div>
                  <span className="text-ctp-text">
                    Start ({currentCharge}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-ctp-green h-1 w-4"></div>
                  <span className="text-ctp-text">
                    Linear Charging Progress
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-ctp-green h-4 w-4 rounded-full"></div>
                  <span className="text-ctp-text">
                    Target ({targetCharge}%)
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 text-center md:grid-cols-3">
                <div className="border-ctp-blue/30 bg-ctp-blue/20 rounded-md border p-4">
                  <div className="text-ctp-blue text-2xl font-bold">
                    {chargeRange}%
                  </div>
                  <div className="text-ctp-subtext0">Charge Added</div>
                </div>
                <div className="border-ctp-green/30 bg-ctp-green/20 rounded-md border p-4">
                  <div
                    className="text-ctp-green text-2xl font-bold"
                    aria-label={`Total time: ${formatTime(estimatedMinutes)}`}
                  >
                    {formatTimeShort(estimatedMinutes)}
                  </div>
                  <div className="text-ctp-subtext0">Total Time</div>
                  <div className="text-ctp-subtext1 mt-1 text-xs">
                    {formatTime(estimatedMinutes)}
                  </div>
                </div>
                {startTime ? (
                  <div className="border-ctp-mauve/30 bg-ctp-mauve/20 rounded-md border p-4">
                    <div className="text-ctp-mauve text-2xl font-bold">
                      {formatTimeAmPm(
                        addMinutesToTime(startTime, estimatedMinutes),
                      )}
                    </div>
                    <div className="text-ctp-subtext0">Completion Time</div>
                  </div>
                ) : (
                  <div className="border-ctp-surface2 bg-ctp-surface1 rounded-md border p-4">
                    <div className="text-ctp-subtext1 text-lg">
                      Set start time
                    </div>
                    <div className="text-ctp-subtext0">for completion time</div>
                  </div>
                )}
              </div>
            </Section>
          </div>
        ) : (
          <div className="border-ctp-surface2 text-ctp-subtext0 flex min-h-64 items-center justify-center rounded-md border-2 border-dashed p-6 text-center text-sm lg:self-stretch">
            {isValidInputs
              ? "Press Calculate Charging to see the charging curve here."
              : "Current charge must be below the target and time must be greater than 0."}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default EVCharging;
