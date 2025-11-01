import QRCode from "qrcode";
import { useRef, useState } from "react";
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

  const checkImageTransparency = (dataUrl: string) => {
    const img = new Image();
    img.addEventListener("load", () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let hasTransparency = false;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 255) {
          hasTransparency = true;
          break;
        }
      }

      console.log("Logo has transparency:", hasTransparency);
    });
    img.src = dataUrl;
  };

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
          checkImageTransparency(result);
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

  const applyCornerRadius = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    radius: number,
  ) => {
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
  };

  const roundCornerPattern = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    radius: number,
    color: string,
  ) => {
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
  };

  const addLogoToCanvas = async (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const logo = new Image();

      logo.addEventListener("load", () => {
        const logoWidth = (width * logoSize) / 100;
        const logoHeight = (logoWidth * logo.height) / logo.width;

        let x: number, y: number;
        switch (logoPosition as LogoPosition) {
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

        if (logoBackground) {
          const padding = logoPadding;
          ctx.fillStyle = lightColor;
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

      logo.src = logoDataUrl;
    });
  };

  const generateQRCode = async () => {
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
          applyCornerRadius(ctx, canvas.width, canvas.height, cornerRadius);
        }

        if (logoDataUrl) {
          try {
            await addLogoToCanvas(ctx, canvas.width, canvas.height);
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
        setQrCodeDataUrl(URL.createObjectURL(blob));
      } else {
        const dataUrl = await QRCode.toDataURL(url, options);
        setQrCodeDataUrl(dataUrl);
      }
    } catch (error) {
      console.error(error);
    }
  };

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

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto px-4 pt-8 pb-6 sm:pt-10 sm:pb-8">
        <div className="mb-8 text-center">
          <h1 className="text-ctp-text mb-3 text-3xl font-bold sm:text-4xl">
            QR Code Generator
          </h1>
          <p className="text-ctp-subtext0 text-lg">
            Generate high-quality QR codes instantly
          </p>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => setIsAdvancedMode(false)}
              className={
                isAdvancedMode
                  ? "bg-ctp-surface1 text-ctp-subtext0 hover:bg-ctp-surface2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  : "bg-ctp-blue text-ctp-base rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              }
            >
              Simple Mode
            </button>
            <button
              onClick={() => setIsAdvancedMode(true)}
              className={
                isAdvancedMode
                  ? "bg-ctp-blue text-ctp-base rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  : "bg-ctp-surface1 text-ctp-subtext0 hover:bg-ctp-surface2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              }
            >
              Advanced Mode
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-6xl">
          <div
            className={
              isAdvancedMode ? "grid gap-6 lg:grid-cols-2" : "grid gap-6"
            }
          >
            <div>
              <div className="bg-ctp-surface0 mb-6 rounded-2xl p-6 shadow-lg sm:p-8">
                <div className="mb-6">
                  <label
                    htmlFor="url-input"
                    className="text-ctp-text mb-2 block text-sm font-medium"
                  >
                    Enter URL or Text
                  </label>
                  <input
                    id="url-input"
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com or any text"
                    className="border-ctp-surface2 bg-ctp-base text-ctp-text placeholder:text-ctp-subtext0 focus:border-ctp-blue focus:ring-ctp-blue focus:ring-opacity-20 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                  />
                </div>

                {isAdvancedMode && (
                  <div className="border-ctp-surface2 space-y-6 border-t pt-6">
                    <div>
                      <h3 className="text-ctp-text mb-4 text-sm font-semibold">
                        Colors
                      </h3>

                      <div className="mb-4">
                        <p className="text-ctp-subtext0 mb-2 text-xs">
                          Quick Presets
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {colorPresets.map((preset) => (
                            <button
                              key={preset.name}
                              onClick={() => applyColorPreset(preset)}
                              className="border-ctp-surface2 text-ctp-text hover:bg-ctp-surface1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors"
                              style={{
                                background: `linear-gradient(to right, ${preset.dark} 50%, ${preset.light} 50%)`,
                              }}
                            >
                              <span className="bg-ctp-base rounded px-1">
                                {preset.name}
                              </span>
                            </button>
                          ))}
                        </div>
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
                              className="border-ctp-surface2 h-10 w-full cursor-pointer rounded-lg border"
                            />
                            <input
                              type="text"
                              value={darkColor}
                              onChange={(e) => setDarkColor(e.target.value)}
                              className="border-ctp-surface2 bg-ctp-base text-ctp-text w-24 rounded-lg border px-2 py-1.5 text-xs"
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
                              className="border-ctp-surface2 h-10 w-full cursor-pointer rounded-lg border"
                            />
                            <input
                              type="text"
                              value={lightColor}
                              onChange={(e) => setLightColor(e.target.value)}
                              className="border-ctp-surface2 bg-ctp-base text-ctp-text w-24 rounded-lg border px-2 py-1.5 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-ctp-text mb-4 flex items-center gap-2 text-sm font-semibold">
                        Logo
                        <span className="bg-ctp-mauve text-ctp-base rounded-full px-2 py-0.5 text-xs font-medium">
                          BETA
                        </span>
                      </h3>

                      {logoDataUrl ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={logoDataUrl}
                              alt="Logo preview"
                              className="border-ctp-surface2 h-16 w-16 rounded-lg border object-contain"
                            />
                            <button
                              onClick={removeLogo}
                              className="bg-ctp-red text-ctp-base hover:bg-ctp-maroon rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                            >
                              Remove Logo
                            </button>
                          </div>

                          <div className="border-ctp-yellow/30 bg-ctp-yellow/10 rounded-lg border p-3">
                            <div className="flex items-start gap-2">
                              <svg
                                className="text-ctp-yellow mt-0.5 h-4 w-4 shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                              </svg>
                              <div className="text-ctp-yellow text-xs">
                                <p className="mb-1 font-medium">
                                  Important: Test Your QR Code
                                </p>
                                <p className="text-ctp-subtext0">
                                  Adding a logo may reduce scannability. Always
                                  test your QR code with multiple devices before
                                  using it. Error correction has been
                                  automatically set to High for better
                                  reliability with logos.
                                </p>
                                <p className="text-ctp-subtext0 mt-1">
                                  💡 Tip: Transparent logos are fully supported
                                  - transparency will be preserved unless you
                                  enable background padding.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="logo-position"
                              className="text-ctp-subtext0 mb-1 block text-xs"
                            >
                              Position
                            </label>
                            <select
                              id="logo-position"
                              value={logoPosition}
                              onChange={(e) =>
                                setLogoPosition(e.target.value as LogoPosition)
                              }
                              className="border-ctp-surface2 bg-ctp-base text-ctp-text w-full rounded-lg border px-3 py-2 text-xs"
                            >
                              <option value="center">Center</option>
                              <option value="top-left">Top Left</option>
                              <option value="top-right">Top Right</option>
                              <option value="bottom-left">Bottom Left</option>
                              <option value="bottom-right">Bottom Right</option>
                            </select>
                          </div>

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
                              onChange={(e) =>
                                setLogoSize(Number(e.target.value))
                              }
                              className="w-full"
                            />
                          </div>

                          <div className="flex items-center gap-4">
                            <label className="text-ctp-text flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={logoBackground}
                                onChange={(e) =>
                                  setLogoBackground(e.target.checked)
                                }
                                className="border-ctp-surface2 rounded"
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
                                  onChange={(e) =>
                                    setLogoPadding(Number(e.target.value))
                                  }
                                  className="border-ctp-surface2 bg-ctp-base text-ctp-text w-16 rounded-lg border px-2 py-1 text-xs"
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
                            className="border-ctp-surface2 bg-ctp-surface1 hover:border-ctp-blue hover:bg-ctp-surface2 w-full cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-colors"
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
                            <p className="text-ctp-subtext0 text-xs">
                              Click to upload logo
                            </p>
                            <p className="text-ctp-subtext1 mt-1 text-xs">
                              PNG, JPG, SVG up to 2MB
                            </p>
                            <p className="text-ctp-green mt-1 text-xs">
                              ✓ Transparency supported
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
                    </div>

                    <div>
                      <h3 className="text-ctp-text mb-4 text-sm font-semibold">
                        QR Code Settings
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="error-correction"
                            className="text-ctp-subtext0 mb-1 block text-xs"
                          >
                            Error Correction Level
                          </label>
                          <select
                            id="error-correction"
                            value={errorCorrection}
                            onChange={(e) =>
                              setErrorCorrection(
                                e.target.value as ErrorCorrectionLevel,
                              )
                            }
                            className="border-ctp-surface2 bg-ctp-base text-ctp-text w-full rounded-lg border px-3 py-2 text-xs"
                          >
                            <option value="L">Low (7%)</option>
                            <option value="M">Medium (15%)</option>
                            <option value="Q">Quartile (25%)</option>
                            <option value="H">High (30%)</option>
                          </select>
                        </div>

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
                            className="w-full"
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
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="corner-radius"
                            className="text-ctp-subtext0 mb-1 block text-xs"
                          >
                            <span className="flex items-center gap-2">
                              Corner Softness: {cornerRadius}%
                              <span className="bg-ctp-mauve text-ctp-base rounded-full px-1.5 py-0.5 text-xs font-medium">
                                BETA
                              </span>
                            </span>
                          </label>
                          <input
                            id="corner-radius"
                            type="range"
                            min="0"
                            max="50"
                            value={cornerRadius}
                            onChange={(e) =>
                              setCornerRadius(Number(e.target.value))
                            }
                            className="w-full"
                          />
                        </div>

                        <label className="text-ctp-text flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={cornerDots}
                            onChange={(e) => setCornerDots(e.target.checked)}
                            className="border-ctp-surface2 rounded"
                          />
                          <span className="flex items-center gap-2">
                            Round corner detection patterns
                            <span className="bg-ctp-mauve text-ctp-base rounded-full px-1.5 py-0.5 text-xs font-medium">
                              BETA
                            </span>
                          </span>
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={resetAdvancedSettings}
                      className="bg-ctp-surface2 text-ctp-text hover:bg-ctp-overlay0 w-full rounded-lg px-4 py-2 text-xs font-medium transition-colors"
                    >
                      Reset to Defaults
                    </button>
                  </div>
                )}

                <button
                  onClick={generateQRCode}
                  disabled={!url}
                  className="bg-ctp-blue text-ctp-base hover:bg-ctp-sapphire focus:ring-ctp-blue focus:ring-offset-ctp-base mt-6 w-full rounded-xl px-6 py-3 font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Generate QR Code
                </button>
              </div>
            </div>

            <div className={isAdvancedMode ? "" : "mx-auto max-w-3xl"}>
              {qrCodeDataUrl && (
                <div className="bg-ctp-surface0 rounded-2xl p-6 shadow-lg sm:p-8">
                  <h2 className="text-ctp-text mb-4 text-center text-lg font-semibold">
                    Your QR Code
                  </h2>

                  <div className="mb-6 flex justify-center">
                    <div
                      className="rounded-xl p-4"
                      style={{
                        backgroundColor: isAdvancedMode
                          ? lightColor
                          : "#FFFFFF",
                      }}
                    >
                      <img
                        src={qrCodeDataUrl}
                        alt="Generated QR Code"
                        className="h-auto w-full max-w-[300px] sm:max-w-[400px]"
                        style={{
                          imageRendering: "-webkit-optimize-contrast",
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={saveQRCode}
                      className="bg-ctp-green text-ctp-base hover:bg-ctp-teal focus:ring-ctp-green focus:ring-offset-ctp-base flex-1 rounded-xl px-6 py-3 font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Download QR Code
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setUrl("");
                        setQrCodeDataUrl("");
                        if (isAdvancedMode) {
                          removeLogo();
                        }
                      }}
                      className="bg-ctp-surface2 text-ctp-text hover:bg-ctp-overlay0 focus:ring-ctp-surface2 focus:ring-offset-ctp-base flex-1 rounded-xl px-6 py-3 font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="bg-ctp-surface1 mt-6 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <svg
                        className="text-ctp-blue mt-0.5 h-5 w-5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="text-ctp-subtext0 text-sm">
                        {isAdvancedMode ? (
                          <>
                            <p className="mb-2">
                              QR code generated at {qrSize}x{qrSize} resolution
                              with custom settings.
                            </p>
                            <p className="text-xs">
                              <strong>Error Correction:</strong>{" "}
                              {errorCorrection === "L"
                                ? "Low (7%)"
                                : errorCorrection === "M"
                                  ? "Medium (15%)"
                                  : errorCorrection === "Q"
                                    ? "Quartile (25%)"
                                    : "High (30%)"}
                              {" • "}
                              <strong>Margin:</strong> {margin} modules
                              {logoDataUrl && (
                                <>
                                  {" • "}
                                  <strong>Logo:</strong> {logoSize}% at{" "}
                                  {logoPosition}
                                </>
                              )}
                            </p>
                            {logoDataUrl && (
                              <p className="text-ctp-yellow mt-2 text-xs">
                                ⚠️ Logo added - please test scanning before
                                production use
                              </p>
                            )}
                          </>
                        ) : (
                          <p>
                            QR code generated at 1024x1024 resolution for
                            maximum quality. The saved image will be
                            high-resolution and suitable for printing.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default QRCodeGenerator;
