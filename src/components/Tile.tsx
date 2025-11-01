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
        "group relative overflow-hidden rounded-xl p-6 text-center transition-all duration-300",
        "bg-ctp-surface0 border-2",
        highlight
          ? "border-ctp-blue from-ctp-blue/10 to-ctp-blue/5 shadow-ctp-blue/20 bg-gradient-to-br shadow-lg"
          : "border-ctp-surface2 hover:border-ctp-overlay0 hover:shadow-lg",
      )}
    >
      <div className="relative z-10">
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
            "text-3xl font-bold tabular-nums transition-colors",
            highlight
              ? "text-ctp-blue"
              : "text-ctp-text group-hover:text-ctp-lavender",
          )}
        >
          {(value * 100).toFixed(2)}%
        </p>
        {subtitle && (
          <p className="text-ctp-overlay0 mt-2 text-xs">{subtitle}</p>
        )}
      </div>
      {highlight && (
        <div className="bg-ctp-blue absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5" />
      )}
    </div>
  );
};

export default Tile;
