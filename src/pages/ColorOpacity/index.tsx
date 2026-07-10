import { useEffect, useMemo, useRef } from "react";
import CopyButton from "../../components/CopyButton";
import Input from "../../components/Input";
import PageShell from "../../components/PageShell";
import { useUrlStringState } from "../../utils/useUrlState";

interface RGB {
  r: number;
  g: number;
  b: number;
  valid: boolean;
}

function parseColor(color: string): RGB {
  color = color.trim();

  if (color.startsWith("#")) {
    const hex = color.slice(1);
    let r: number, g: number, b: number;

    if (hex.length === 3) {
      r = Number.parseInt(hex[0] + hex[0], 16);
      g = Number.parseInt(hex[1] + hex[1], 16);
      b = Number.parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = Number.parseInt(hex.slice(0, 2), 16);
      g = Number.parseInt(hex.slice(2, 4), 16);
      b = Number.parseInt(hex.slice(4, 6), 16);
    } else {
      return { r: 0, g: 0, b: 0, valid: false };
    }

    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
      return { r: 0, g: 0, b: 0, valid: false };
    }

    return { r, g, b, valid: true };
  }

  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: Number.parseInt(rgbMatch[1]),
      g: Number.parseInt(rgbMatch[2]),
      b: Number.parseInt(rgbMatch[3]),
      valid: true,
    };
  }

  if (typeof document !== "undefined") {
    const ctx = document.createElement("canvas").getContext("2d");
    if (ctx) {
      ctx.fillStyle = color;
      const computed = ctx.fillStyle;
      if (computed.startsWith("#")) {
        return parseColor(computed);
      }
    }
  }

  return { r: 0, g: 0, b: 0, valid: false };
}

function rgbaToHex(r: number, g: number, b: number, opacity: number): string {
  const finalR = Math.round(r * opacity + 255 * (1 - opacity));
  const finalG = Math.round(g * opacity + 255 * (1 - opacity));
  const finalB = Math.round(b * opacity + 255 * (1 - opacity));

  const hexR = finalR.toString(16).padStart(2, "0");
  const hexG = finalG.toString(16).padStart(2, "0");
  const hexB = finalB.toString(16).padStart(2, "0");

  return "#" + hexR + hexG + hexB;
}

const opacityLevels = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.05];

const ColorOpacity = () => {
  const [colorInput, setColorInput] = useUrlStringState("color", "#3B82F6");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const parsedColor = useMemo(() => parseColor(colorInput), [colorInput]);

  return (
    <PageShell
      title="Opacifier"
      subtitle="Enter a color (hex, RGB, or name) and see it at every opacity level"
    >
      <div className="mb-8">
        <h2 className="text-ctp-text mb-4 text-xl font-bold">Input Color</h2>
        <div className="flex items-end gap-4">
          <Input
            id="color-input"
            label="Color"
            type="text"
            ref={inputRef}
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            placeholder="#3B82F6 or rgb(59, 130, 246) or blue"
            customClass="flex-1"
          />
          {parsedColor.valid && (
            <div
              className="border-ctp-surface2 h-16 w-16 rounded-md border-2 bg-white"
              style={{
                backgroundImage: `linear-gradient(rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, 1), rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, 1))`,
              }}
            ></div>
          )}
        </div>
        {!parsedColor.valid && colorInput !== "" && (
          <p className="text-ctp-red mt-2 text-sm">Invalid color format</p>
        )}
      </div>

      {parsedColor.valid && (
        <div>
          <h2 className="text-ctp-text mb-4 text-xl font-bold">
            Opacity Variations
          </h2>
          <div className="bg-ctp-surface0 divide-ctp-surface1 divide-y rounded-md">
            {opacityLevels.map((opacity, index) => {
              const hexCode = rgbaToHex(
                parsedColor.r,
                parsedColor.g,
                parsedColor.b,
                opacity,
              );

              return (
                <div key={index} className="flex items-center gap-3 px-4 py-2">
                  <div className="text-ctp-text w-12 text-sm font-semibold">
                    {Math.round(opacity * 100)}%
                  </div>
                  <div
                    className="border-ctp-surface2 h-8 w-8 rounded border"
                    style={{ backgroundColor: hexCode }}
                  ></div>
                  <code className="text-ctp-text flex-1 font-mono text-sm">
                    {hexCode}
                  </code>
                  <CopyButton text={hexCode} size="sm" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default ColorOpacity;
