import QRCode from "qrcode";
import { useCallback, useEffect, useRef, useState } from "react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import PageShell from "../../components/PageShell";
import Select from "../../components/Select";
import { useReactPersist } from "../../utils/Storage";
import {
  useUrlBooleanState,
  useUrlState,
  useUrlStringState,
} from "../../utils/useUrlState";

type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";
type LogoPosition =
  | "center"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

interface ColorPreset {
  name: string;
  dark: string;
  light: string;
}

const colorPresets: ColorPreset[] = [
  { name: "Classic", dark: "#000000", light: "#FFFFFF" },
  { name: "Blue", dark: "#1e40af", light: "#dbeafe" },
  { name: "Green", dark: "#166534", light: "#dcfce7" },
  { name: "Purple", dark: "#6b21a8", light: "#f3e8ff" },
  { name: "Red", dark: "#991b1b", light: "#fee2e2" },
  { name: "Orange", dark: "#c2410c", light: "#fed7aa" },
  { name: "Teal", dark: "#0f766e", light: "#ccfbf1" },
  { name: "Pink", dark: "#be185d", light: "#fce7f3" },
];

function roundCornerPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  radius: number,
  color: string,
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + size - radius, y);
  ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
  ctx.lineTo(x + size, y + size - radius);
  ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
  ctx.lineTo(x + radius, y + size);
  ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function applyCornerRadius(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  radius: number,
  margin: number,
  cornerDots: boolean,
  darkColor: string,
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const moduleCount = Math.sqrt((width - margin * 2) / 10);
  const moduleSize = (width - margin * 2) / moduleCount;
  const cornerPixels = Math.floor((radius * moduleSize) / 100);

  if (cornerDots) {
    const positions = [
      { x: margin, y: margin },
      { x: width - margin - 7 * moduleSize, y: margin },
      { x: margin, y: height - margin - 7 * moduleSize },
    ];

    for (const pos of positions) {
      roundCornerPattern(
        ctx,
        pos.x,
        pos.y,
        7 * moduleSize,
        cornerPixels,
        darkColor,
      );
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

interface LogoDrawOptions {
  logoDataUrl: string;
  logoSize: number;
  logoPosition: LogoPosition;
  logoBackground: boolean;
  logoPadding: number;
  lightColor: string;
}

function addLogoToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: LogoDrawOptions,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const logo = new Image();

    logo.addEventListener("load", () => {
      const logoWidth = (width * options.logoSize) / 100;
      const logoHeight = (logoWidth * logo.height) / logo.width;

      let x: number, y: number;
      switch (options.logoPosition) {
        case "center": {
          x = (width - logoWidth) / 2;
          y = (height - logoHeight) / 2;
          break;
        }
        case "top-left": {
          x = width * 0.1;
          y = height * 0.1;
          break;
        }
        case "top-right": {
          x = width * 0.9 - logoWidth;
          y = height * 0.1;
          break;
        }
        case "bottom-left": {
          x = width * 0.1;
          y = height * 0.9 - logoHeight;
          break;
        }
        case "bottom-right": {
          x = width * 0.9 - logoWidth;
          y = height * 0.9 - logoHeight;
          break;
        }
        default: {
          x = (width - logoWidth) / 2;
          y = (height - logoHeight) / 2;
        }
      }

      const logoCanvas = document.createElement("canvas");
      const logoCtx = logoCanvas.getContext("2d", { alpha: true });

      if (!logoCtx) {
        reject(new Error("Failed to create logo canvas context"));
        return;
      }

      logoCanvas.width = logoWidth;
      logoCanvas.height = logoHeight;

      logoCtx.clearRect(0, 0, logoCanvas.width, logoCanvas.height);
      logoCtx.drawImage(logo, 0, 0, logoWidth, logoHeight);

      if (options.logoBackground) {
        const padding = options.logoPadding;
        ctx.fillStyle = options.lightColor;
        ctx.fillRect(
          x - padding,
          y - padding,
          logoWidth + padding * 2,
          logoHeight + padding * 2,
        );
      }

      ctx.drawImage(logoCanvas, x, y);
      resolve();
    });

    logo.addEventListener("error", () => {
      reject(new Error("Failed to load logo image"));
    });

    logo.src = options.logoDataUrl;
  });
}

const QRCodeGenerator = () => {
  const [url, setUrl] = useReactPersist("qr-url", "");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [isAdvancedMode, setIsAdvancedMode] = useUrlBooleanState(
    "advanced",
    false,
  );

  const [darkColor, setDarkColor] = useUrlStringState("dark", "#000000");
  const [lightColor, setLightColor] = useUrlStringState("light", "#FFFFFF");
  const [errorCorrection, setErrorCorrection] = useUrlStringState("ec", "H");
  const [qrSize, setQrSize] = useUrlState("size", 1024);
  const [margin, setMargin] = useUrlState("margin", 2);
  const [cornerRadius, setCornerRadius] = useUrlState("radius", 0);
  const [cornerDots, setCornerDots] = useUrlBooleanState("dots", false);

  const [logoDataUrl, setLogoDataUrl] = useState("");
  const [logoSize, setLogoSize] = useUrlState("logoSize", 20);
  const [logoPosition, setLogoPosition] = useUrlStringState(
    "logoPos",
    "center",
  );
  const [logoBackground, setLogoBackground] = useUrlBooleanState(
    "logoBg",
    false,
  );
  const [logoPadding, setLogoPadding] = useUrlState("logoPad", 5);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const generationRef = useRef(0);
  const blobUrlRef = useRef("");

  const publishQr = useCallback((next: string) => {
    if (blobUrlRef.current && blobUrlRef.current !== next) {
      URL.revokeObjectURL(blobUrlRef.current);
    }
    blobUrlRef.current = next.startsWith("blob:") ? next : "";
    setQrCodeDataUrl(next);
  }, []);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          setLogoDataUrl(result);
          if (errorCorrection !== "H") {
            setErrorCorrection("H");
          }
        }
      });
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoDataUrl("");
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };

  const applyColorPreset = (preset: ColorPreset) => {
    setDarkColor(preset.dark);
    setLightColor(preset.light);
  };

  const generateQRCode = useCallback(async () => {
    const generation = ++generationRef.current;
    try {
      const options = {
        errorCorrectionLevel: isAdvancedMode
          ? (errorCorrection as ErrorCorrectionLevel)
          : "H",
        type: "image/png" as const,
        quality: 1,
        margin: isAdvancedMode ? margin : 2,
        width: isAdvancedMode ? qrSize : 1024,
        color: {
          dark: isAdvancedMode ? darkColor : "#000000",
          light: isAdvancedMode ? lightColor : "#FFFFFF",
        },
      };

      if (isAdvancedMode && (cornerRadius > 0 || logoDataUrl)) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) {
          console.error("Failed to get canvas context");
          return;
        }
        canvas.width = qrSize;
        canvas.height = qrSize;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        await QRCode.toCanvas(canvas, url, options);

        if (cornerRadius > 0) {
          applyCornerRadius(
            ctx,
            canvas.width,
            canvas.height,
            cornerRadius,
            margin,
            cornerDots,
            darkColor,
          );
        }

        if (logoDataUrl) {
          try {
            await addLogoToCanvas(ctx, canvas.width, canvas.height, {
              logoDataUrl,
              logoSize,
              logoPosition: logoPosition as LogoPosition,
              logoBackground,
              logoPadding,
              lightColor,
            });
          } catch (error) {
            console.error("Error adding logo:", error);
          }
        }

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Failed to create blob"));
            },
            "image/webp",
            1 - Number.EPSILON,
          );
        });
        if (generation !== generationRef.current) return;
        publishQr(URL.createObjectURL(blob));
      } else {
        const dataUrl = await QRCode.toDataURL(url, options);
        if (generation !== generationRef.current) return;
        publishQr(dataUrl);
      }
    } catch (error) {
      console.error(error);
    }
  }, [
    url,
    isAdvancedMode,
    errorCorrection,
    margin,
    qrSize,
    darkColor,
    lightColor,
    cornerRadius,
    cornerDots,
    logoDataUrl,
    logoSize,
    logoPosition,
    logoBackground,
    logoPadding,
    publishQr,
  ]);

  useEffect(() => {
    const hasInput = url.trim() !== "";
    const timer = setTimeout(
      () => {
        if (hasInput) {
          void generateQRCode();
        } else {
          generationRef.current++;
          publishQr("");
        }
      },
      hasInput ? 250 : 0,
    );
    return () => clearTimeout(timer);
  }, [url, generateQRCode, publishQr]);

  const saveQRCode = async () => {
    if (qrCodeDataUrl.startsWith("blob:")) {
      const link = document.createElement("a");
      link.href = qrCodeDataUrl;
      link.download = `qrcode-${Date.now()}.webp`;
      link.click();
    } else {
      const response = await fetch(qrCodeDataUrl);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `qrcode-${Date.now()}.webp`;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  const clearAll = () => {
    setUrl("");
    if (isAdvancedMode) {
      removeLogo();
    }
  };

  const resetAdvancedSettings = () => {
    setDarkColor("#000000");
    setLightColor("#FFFFFF");
    setErrorCorrection("H");
    setQrSize(1024);
    setMargin(2);
    setCornerRadius(0);
    setCornerDots(false);
    setLogoSize(20);
    setLogoPosition("center");
    setLogoBackground(false);
    setLogoPadding(5);
    removeLogo();
  };

  const betaTag = (
    <span className="text-ctp-mauve text-xs font-medium">beta</span>
  );

  const urlInput = (
    <Input
      id="url-input"
      label="Enter URL or Text"
      type="text"
      value={url}
      onChange={(e) => setUrl(e.target.value)}
      placeholder="https://example.com or any text"
    />
  );

  const preview = (
    <div className="bg-ctp-surface0 rounded-md p-6">
      <h2 className="text-ctp-text mb-4 text-center text-lg font-semibold">
        Your QR Code
      </h2>

      {qrCodeDataUrl ? (
        <>
          <div className="mb-4 flex justify-center">
            <div
              className="rounded-md p-4"
              style={{
                backgroundColor: isAdvancedMode ? lightColor : "#FFFFFF",
              }}
            >
              <img
                src={qrCodeDataUrl}
                alt="Generated QR Code"
                className="h-auto w-full max-w-[300px] sm:max-w-[360px]"
                style={{ imageRendering: "-webkit-optimize-contrast" }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={saveQRCode} customClass="flex-1">
              Download QR Code
            </Button>
            <Button variant="secondary" customClass="flex-1" onClick={clearAll}>
              Clear
            </Button>
          </div>

          <p className="text-ctp-subtext0 mt-4 text-xs">
            {isAdvancedMode
              ? `${qrSize}×${qrSize}px • Error correction ${errorCorrection} • Margin ${margin} modules`
              : "1024×1024px at high error correction — suitable for printing."}
          </p>
          {isAdvancedMode && logoDataUrl && (
            <p className="text-ctp-yellow mt-1 text-xs">
              Logo added — test scanning before production use.
            </p>
          )}
        </>
      ) : (
        <div className="border-ctp-surface2 text-ctp-subtext0 flex min-h-64 items-center justify-center rounded-md border-2 border-dashed p-6 text-center text-sm">
          Enter a URL or text — your QR code appears here automatically.
        </div>
      )}
    </div>
  );

  const advancedControls = (
    <>
      <section>
        <h3 className="text-ctp-text mb-3 text-sm font-semibold">Colors</h3>

        <p className="text-ctp-subtext0 mb-2 text-xs">Quick Presets</p>
        <div className="mb-4 grid grid-cols-4 gap-2">
          {colorPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyColorPreset(preset)}
              className="border-ctp-surface2 text-ctp-text rounded-md border px-2 py-1.5 text-xs font-medium transition-colors duration-100"
              style={{
                background: `linear-gradient(to right, ${preset.dark} 50%, ${preset.light} 50%)`,
              }}
            >
              <span className="bg-ctp-base rounded px-1">{preset.name}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="dark-color"
              className="text-ctp-subtext0 mb-1 block text-xs"
            >
              Foreground Color
            </label>
            <div className="flex items-center gap-2">
              <input
                id="dark-color"
                type="color"
                value={darkColor}
                onChange={(e) => setDarkColor(e.target.value)}
                className="border-ctp-surface2 h-10 w-full cursor-pointer rounded-md border"
              />
              <input
                type="text"
                value={darkColor}
                onChange={(e) => setDarkColor(e.target.value)}
                aria-label="Foreground color hex value"
                className="bg-ctp-surface0 border-ctp-surface2 text-ctp-text w-24 rounded-md border px-2 py-1.5 text-xs"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="light-color"
              className="text-ctp-subtext0 mb-1 block text-xs"
            >
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                id="light-color"
                type="color"
                value={lightColor}
                onChange={(e) => setLightColor(e.target.value)}
                className="border-ctp-surface2 h-10 w-full cursor-pointer rounded-md border"
              />
              <input
                type="text"
                value={lightColor}
                onChange={(e) => setLightColor(e.target.value)}
                aria-label="Background color hex value"
                className="bg-ctp-surface0 border-ctp-surface2 text-ctp-text w-24 rounded-md border px-2 py-1.5 text-xs"
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-ctp-text mb-3 flex items-center gap-2 text-sm font-semibold">
          Logo {betaTag}
        </h3>

        {logoDataUrl ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={logoDataUrl}
                alt="Logo preview"
                className="border-ctp-surface2 h-16 w-16 rounded-md border object-contain"
              />
              <Button variant="danger" size="sm" onClick={removeLogo}>
                Remove Logo
              </Button>
            </div>

            <p className="border-ctp-yellow/30 bg-ctp-yellow/10 text-ctp-yellow rounded-md border p-3 text-xs">
              A logo can reduce scannability — test your QR code on multiple
              devices. Error correction is set to High automatically.
            </p>

            <Select
              id="logo-position"
              label="Position"
              value={logoPosition}
              onChange={(e) => setLogoPosition(e.target.value as LogoPosition)}
            >
              <option value="center">Center</option>
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
            </Select>

            <div>
              <label
                htmlFor="logo-size"
                className="text-ctp-subtext0 mb-1 block text-xs"
              >
                Logo Size: {logoSize}%
              </label>
              <input
                id="logo-size"
                type="range"
                min="10"
                max="40"
                value={logoSize}
                onChange={(e) => setLogoSize(Number(e.target.value))}
                className="accent-ctp-blue w-full"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="text-ctp-text flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={logoBackground}
                  onChange={(e) => setLogoBackground(e.target.checked)}
                  className="accent-ctp-blue rounded"
                />
                Add background to logo
              </label>
              {logoBackground && (
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="logo-padding"
                    className="text-ctp-subtext0 text-xs"
                  >
                    Padding:
                  </label>
                  <input
                    id="logo-padding"
                    type="number"
                    min="0"
                    max="20"
                    value={logoPadding}
                    onChange={(e) => setLogoPadding(Number(e.target.value))}
                    className="bg-ctp-surface0 border-ctp-surface2 text-ctp-text w-16 rounded-md border px-2 py-1 text-xs"
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <label htmlFor="logo-input" className="sr-only">
              Upload logo image
            </label>
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="border-ctp-surface2 bg-ctp-surface0 hover:border-ctp-blue hover:bg-ctp-surface1 w-full cursor-pointer rounded-md border-2 border-dashed p-4 text-center transition-colors duration-100"
            >
              <svg
                className="text-ctp-subtext0 mx-auto mb-2 h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-ctp-subtext0 text-xs">Click to upload logo</p>
              <p className="text-ctp-subtext1 mt-1 text-xs">
                PNG, JPG, SVG up to 2MB — transparency supported
              </p>
            </button>
            <input
              ref={logoInputRef}
              id="logo-input"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </>
        )}
      </section>

      <section>
        <h3 className="text-ctp-text mb-3 text-sm font-semibold">
          QR Code Settings
        </h3>

        <div className="space-y-4">
          <Select
            id="error-correction"
            label="Error Correction Level"
            value={errorCorrection}
            onChange={(e) =>
              setErrorCorrection(e.target.value as ErrorCorrectionLevel)
            }
          >
            <option value="L">Low (7%)</option>
            <option value="M">Medium (15%)</option>
            <option value="Q">Quartile (25%)</option>
            <option value="H">High (30%)</option>
          </Select>

          <div>
            <label
              htmlFor="qr-size"
              className="text-ctp-subtext0 mb-1 block text-xs"
            >
              Size: {qrSize}px
            </label>
            <input
              id="qr-size"
              type="range"
              min="256"
              max="2048"
              step="256"
              value={qrSize}
              onChange={(e) => setQrSize(Number(e.target.value))}
              className="accent-ctp-blue w-full"
            />
          </div>

          <div>
            <label
              htmlFor="qr-margin"
              className="text-ctp-subtext0 mb-1 block text-xs"
            >
              Quiet Zone: {margin} modules
            </label>
            <input
              id="qr-margin"
              type="range"
              min="0"
              max="10"
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="accent-ctp-blue w-full"
            />
          </div>

          <div>
            <label
              htmlFor="corner-radius"
              className="text-ctp-subtext0 mb-1 block text-xs"
            >
              <span className="flex items-center gap-2">
                Corner Softness: {cornerRadius}% {betaTag}
              </span>
            </label>
            <input
              id="corner-radius"
              type="range"
              min="0"
              max="50"
              value={cornerRadius}
              onChange={(e) => setCornerRadius(Number(e.target.value))}
              className="accent-ctp-blue w-full"
            />
          </div>

          <label className="text-ctp-text flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={cornerDots}
              onChange={(e) => setCornerDots(e.target.checked)}
              className="accent-ctp-blue rounded"
            />
            <span className="flex items-center gap-2">
              Round corner detection patterns {betaTag}
            </span>
          </label>
        </div>
      </section>

      <Button variant="secondary" size="sm" onClick={resetAdvancedSettings}>
        Reset to Defaults
      </Button>
    </>
  );

  return (
    <PageShell
      title="QR Code Generator"
      subtitle="Generate high-quality QR codes instantly"
      wide
    >
      <div className={isAdvancedMode ? "" : "mx-auto w-full max-w-2xl"}>
        <div className="mb-6 flex items-center gap-2">
          <Button
            variant={isAdvancedMode ? "secondary" : "primary"}
            size="sm"
            onClick={() => setIsAdvancedMode(false)}
          >
            Simple Mode
          </Button>
          <Button
            variant={isAdvancedMode ? "primary" : "secondary"}
            size="sm"
            onClick={() => setIsAdvancedMode(true)}
          >
            Advanced Mode
          </Button>
        </div>

        {isAdvancedMode ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              {urlInput}
              {advancedControls}
            </div>
            <div>
              <div className="lg:sticky lg:top-8">{preview}</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {urlInput}
            {preview}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default QRCodeGenerator;
