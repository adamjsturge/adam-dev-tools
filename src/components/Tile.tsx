import classNames from "../utils/classNames";

interface TileProps {
  title: string;
  value: number;
  highlight?: boolean;
  subtitle?: string;
}

const Tile = ({ title, value, highlight = false, subtitle }: TileProps) => {
  return (
    <div
      className={classNames(
        "rounded-md border-2 p-6 text-center transition-colors duration-100",
        highlight
          ? "border-ctp-blue bg-ctp-blue/10"
          : "bg-ctp-surface0 border-ctp-surface2 hover:border-ctp-overlay0",
      )}
    >
      <h3
        className={classNames(
          "mb-3 text-sm font-semibold tracking-wider uppercase",
          highlight ? "text-ctp-blue" : "text-ctp-overlay1",
        )}
      >
        {title}
      </h3>
      <p
        className={classNames(
          "text-3xl font-bold tabular-nums",
          highlight ? "text-ctp-blue" : "text-ctp-text",
        )}
      >
        {(value * 100).toFixed(2)}%
      </p>
      {subtitle && <p className="text-ctp-subtext0 mt-2 text-xs">{subtitle}</p>}
    </div>
  );
};

export default Tile;
