import { useState } from "react";
import { useReactPersist } from "../../utils/Storage";

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
  const [currentCharge, setCurrentCharge] = useReactPersist(
    "ev-current-charge",
    20,
  );
  const [targetCharge, setTargetCharge] = useReactPersist(
    "ev-target-charge",
    80,
  );
  const [estimatedMinutes, setEstimatedMinutes] = useReactPersist(
    "ev-estimated-minutes",
    45,
  );
  const [startTime, setStartTime] = useReactPersist("ev-start-time", "");
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
  };

  const calculateCharging = () => {
    if (!isValidInputs) {
      alert(
        "Please check your inputs: Current charge must be less than target charge and time must be greater than 0",
      );
      return;
    }

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
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col px-4 pt-8 pb-4">
      <h1 className="text-ctp-text mb-6 text-center text-3xl font-bold">
        ⚡ EV Charging Estimator
      </h1>

      <div className="bg-ctp-surface0 text-ctp-blue mb-4 rounded-lg p-4 text-center">
        <p>
          <strong>Slow Charging Model:</strong> This estimator assumes linear
          charging throughout the entire process. Unlike fast charging which
          typically slows down at 80%, slow charging (Level 1/2) maintains a
          consistent rate.
        </p>
      </div>

      {!showResults ? (
        <>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
            <div className="bg-ctp-surface0 rounded-xl p-6">
              <h2 className="text-ctp-text mb-4 text-lg font-semibold">
                Battery Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="currentCharge"
                    className="text-ctp-text mb-2 block text-sm font-medium"
                  >
                    Current Charge (%)
                  </label>
                  <input
                    id="currentCharge"
                    type="number"
                    min={0}
                    max={100}
                    value={currentCharge}
                    onChange={(e) => setCurrentCharge(Number(e.target.value))}
                    className="border-ctp-surface2 bg-ctp-surface1 text-ctp-text w-full rounded border p-2"
                  />
                </div>
                <div>
                  <label
                    htmlFor="targetCharge"
                    className="text-ctp-text mb-2 block text-sm font-medium"
                  >
                    Target Charge (%)
                  </label>
                  <input
                    id="targetCharge"
                    type="number"
                    min={0}
                    max={100}
                    value={targetCharge}
                    onChange={(e) => setTargetCharge(Number(e.target.value))}
                    className="border-ctp-surface2 bg-ctp-surface1 text-ctp-text w-full rounded border p-2"
                  />
                </div>
              </div>
            </div>

            <div className="bg-ctp-surface0 rounded-xl p-6">
              <h2 className="text-ctp-text mb-4 text-lg font-semibold">
                Charging Time
              </h2>
              <label
                htmlFor="estimatedMinutes"
                className="text-ctp-text mb-2 block text-sm font-medium"
              >
                Estimated Time (minutes)
              </label>
              <input
                id="estimatedMinutes"
                type="number"
                min={1}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                placeholder="45"
                className="border-ctp-surface2 bg-ctp-surface1 text-ctp-text w-full rounded border p-2"
              />
              <p className="text-ctp-subtext1 mt-2 text-sm">
                Time your car estimates to reach target charge
              </p>
            </div>

            <div className="bg-ctp-surface0 rounded-xl p-6 md:col-span-2">
              <h2 className="text-ctp-text mb-4 text-lg font-semibold">
                Start Time
              </h2>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label
                    htmlFor="startTime"
                    className="text-ctp-text mb-2 block text-sm font-medium"
                  >
                    Start Time (optional)
                  </label>
                  <input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="border-ctp-surface2 bg-ctp-surface1 text-ctp-text w-full rounded border p-2"
                  />
                </div>
                <button
                  className="bg-ctp-blue hover:bg-ctp-sapphire text-ctp-base h-10 rounded px-4 py-2"
                  onClick={setCurrentTime}
                >
                  Now
                </button>
              </div>
              <p className="text-ctp-subtext1 mt-2 text-sm">
                Set to see actual completion times (times will display in AM/PM
                format)
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <button
              className="bg-ctp-green hover:bg-ctp-teal text-ctp-base rounded-lg px-6 py-3 font-semibold"
              onClick={calculateCharging}
            >
              Calculate Charging
            </button>
            <button
              className="bg-ctp-surface2 hover:bg-ctp-overlay0 text-ctp-text rounded-lg px-6 py-3"
              onClick={reset}
            >
              Reset
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div>
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
            <button
              className="bg-ctp-surface2 hover:bg-ctp-overlay0 text-ctp-text rounded px-4 py-2"
              onClick={() => setShowResults(false)}
            >
              Back to Settings
            </button>
          </div>

          <div className="bg-ctp-surface0 flex-1 rounded-lg p-6 shadow-lg">
            <div className="relative">
              <svg
                width="600"
                height="400"
                className="border-ctp-surface1 bg-ctp-mantle rounded-lg border"
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
                      textAnchor={line.type === "horizontal" ? "end" : "middle"}
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
                    340 - ((currentCharge - currentCharge) / chargeRange) * 280
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
                <div className="border-ctp-surface1 bg-ctp-surface2 text-ctp-text absolute top-4 right-4 rounded-lg border p-3 text-sm shadow-lg">
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

            <div className="mt-4 flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="bg-ctp-red h-4 w-4 rounded-full"></div>
                <span className="text-ctp-text">Start ({currentCharge}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-ctp-green h-1 w-4"></div>
                <span className="text-ctp-text">Linear Charging Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-ctp-green h-4 w-4 rounded-full"></div>
                <span className="text-ctp-text">Target ({targetCharge}%)</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 text-center md:grid-cols-3">
              <div className="border-ctp-blue/30 bg-ctp-blue/20 rounded-lg border p-4">
                <div className="text-ctp-blue text-2xl font-bold">
                  {chargeRange}%
                </div>
                <div className="text-ctp-subtext0">Charge Added</div>
              </div>
              <div className="border-ctp-green/30 bg-ctp-green/20 rounded-lg border p-4">
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
                <div className="border-ctp-mauve/30 bg-ctp-mauve/20 rounded-lg border p-4">
                  <div className="text-ctp-mauve text-2xl font-bold">
                    {formatTimeAmPm(
                      addMinutesToTime(startTime, estimatedMinutes),
                    )}
                  </div>
                  <div className="text-ctp-subtext0">Completion Time</div>
                </div>
              ) : (
                <div className="border-ctp-surface2 bg-ctp-surface1 rounded-lg border p-4">
                  <div className="text-ctp-subtext1 text-lg">
                    Set start time
                  </div>
                  <div className="text-ctp-subtext0">for completion time</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default EVCharging;
