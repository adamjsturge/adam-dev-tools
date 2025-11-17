import { useRef, useState } from "react";

const ColorBackgroundRemoval = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [resultUrl, setResultUrl] = useState<string>("");
  const [tolerance, setTolerance] = useState(30);
  const [isPickerMode, setIsPickerMode] = useState(false);
  const [useCustomBackground, setUseCustomBackground] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [aggressiveCleanup, setAggressiveCleanup] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResultUrl("");
      setIsPickerMode(false);

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const img = new Image();
        img.addEventListener("load", () => {
          // Set up original canvas
          const origCanvas = originalCanvasRef.current;
          if (!origCanvas) return;

          origCanvas.width = img.width;
          origCanvas.height = img.height;
          const origCtx = origCanvas.getContext("2d", {
            willReadFrequently: true,
          });
          if (!origCtx) return;

          origCtx.drawImage(img, 0, 0);
          const data = origCtx.getImageData(0, 0, img.width, img.height);
          setImageData(data);

          // Set up result canvas
          const canvas = canvasRef.current;
          if (!canvas) return;

          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          ctx.drawImage(img, 0, 0);
        });
        img.src = reader.result as string;
      });
      reader.readAsDataURL(selectedFile);
    }
  };

  const colorMatch = (
    data: Uint8ClampedArray,
    index: number,
    r: number,
    g: number,
    b: number,
    tolerance: number,
  ) => {
    const rDiff = Math.abs(data[index] - r);
    const gDiff = Math.abs(data[index + 1] - g);
    const bDiff = Math.abs(data[index + 2] - b);
    return rDiff <= tolerance && gDiff <= tolerance && bDiff <= tolerance;
  };

  const floodFill = (
    imageData: ImageData,
    x: number,
    y: number,
    tolerance: number,
    aggressive: boolean = false,
  ) => {
    const width = imageData.width;
    const height = imageData.height;
    const data = new Uint8ClampedArray(imageData.data);
    const visited = new Set<number>();

    const targetIndex = (y * width + x) * 4;
    const targetR = data[targetIndex];
    const targetG = data[targetIndex + 1];
    const targetB = data[targetIndex + 2];

    const queue: Array<[number, number]> = [[x, y]];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) continue;

      const [currentX, currentY] = current;
      const index = (currentY * width + currentX) * 4;
      const key = currentY * width + currentX;

      if (
        currentX < 0 ||
        currentX >= width ||
        currentY < 0 ||
        currentY >= height ||
        visited.has(key)
      ) {
        continue;
      }

      if (!colorMatch(data, index, targetR, targetG, targetB, tolerance)) {
        continue;
      }

      visited.add(key);
      // Make pixel transparent
      data[index + 3] = 0;

      // Add neighbors to queue
      queue.push(
        [currentX + 1, currentY],
        [currentX - 1, currentY],
        [currentX, currentY + 1],
        [currentX, currentY - 1],
      );
    }

    // Aggressive cleanup: Remove ALL matching pixels, not just connected ones
    if (aggressive) {
      for (let i = 0; i < data.length; i += 4) {
        if (colorMatch(data, i, targetR, targetG, targetB, tolerance)) {
          data[i + 3] = 0;
        }
      }
    }

    const newImageData = new ImageData(data, width, height);
    return newImageData;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPickerMode || !imageData) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentImageData = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height,
    );
    const newImageData = floodFill(
      currentImageData,
      x,
      y,
      tolerance,
      aggressiveCleanup,
    );

    ctx.putImageData(newImageData, 0, 0);

    // Update result URL
    canvas.toBlob((blob) => {
      if (blob) {
        if (resultUrl) {
          URL.revokeObjectURL(resultUrl);
        }
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
      }
    });
  };

  const downloadResult = () => {
    if (!resultUrl || !file) return;

    const link = document.createElement("a");
    link.href = resultUrl;
    const originalName = file.name.slice(0, file.name.lastIndexOf("."));
    link.download = `${originalName}-color-removed.png`;
    link.click();
  };

  const reset = () => {
    setFile(null);
    setImageData(null);
    setIsPickerMode(false);
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl("");
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const resetCanvas = () => {
    if (!imageData) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.putImageData(imageData, 0, 0);

    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl("");
    }
  };

  return (
    <main className="container mx-auto max-w-4xl px-4 pt-8 pb-4">
      <h1 className="text-ctp-text mb-6 text-2xl font-bold">
        Color Background Removal
      </h1>

      <div className="flex flex-col gap-6">
        {/* File Input */}
        <div className="w-full">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file:bg-ctp-surface0 file:text-ctp-text hover:file:bg-ctp-surface1 border-ctp-surface2 w-full rounded-lg border p-2 file:mr-4 file:rounded-lg file:border-0 file:px-4 file:py-2"
          />
          <p className="text-ctp-subtext0 mt-2 text-sm">
            Upload an image, then click on any color to remove it and all
            connected pixels of similar color.
          </p>
        </div>

        {/* Tolerance Slider */}
        {file && (
          <div className="flex flex-col gap-4">
            <label className="flex flex-col">
              <span className="text-ctp-text mb-2 text-sm font-medium">
                Tolerance: {tolerance}
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={tolerance}
                onChange={(e) => setTolerance(Number.parseInt(e.target.value))}
                className="accent-ctp-mauve w-full"
              />
              <span className="text-ctp-subtext0 mt-1 text-xs">
                Higher tolerance removes more similar colors
              </span>
            </label>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={useCustomBackground}
                  onChange={(e) => setUseCustomBackground(e.target.checked)}
                  className="accent-ctp-mauve"
                />
                <span className="text-ctp-text text-sm">
                  Use custom background color
                </span>
              </label>

              {useCustomBackground && (
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="bg-color-picker"
                    className="text-ctp-text text-sm"
                  >
                    Background color:
                  </label>
                  <input
                    id="bg-color-picker"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="border-ctp-surface2 h-10 w-20 cursor-pointer rounded border-2"
                  />
                  <span className="text-ctp-subtext0 text-xs">
                    {backgroundColor}
                  </span>
                </div>
              )}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={aggressiveCleanup}
                  onChange={(e) => setAggressiveCleanup(e.target.checked)}
                  className="accent-ctp-mauve"
                />
                <span className="text-ctp-text text-sm">
                  🧪 Aggressive cleanup (experimental)
                </span>
              </label>
              {aggressiveCleanup && (
                <p className="text-ctp-subtext0 ml-6 text-xs">
                  Removes ALL matching pixels across the entire image, not just
                  connected areas. Great for eliminating leftover edge pixels.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Canvas Display */}
        {file && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <button
                onClick={() => setIsPickerMode(!isPickerMode)}
                className={`rounded-lg px-4 py-2 transition-colors duration-200 ${
                  isPickerMode
                    ? "bg-ctp-green text-ctp-base"
                    : "bg-ctp-surface0 text-ctp-text hover:bg-ctp-surface1"
                }`}
              >
                {isPickerMode ? "✓ Picker Active" : "Activate Color Picker"}
              </button>
              <button
                onClick={resetCanvas}
                disabled={!resultUrl}
                className="bg-ctp-surface0 text-ctp-text hover:bg-ctp-surface1 rounded-lg px-4 py-2 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reset Image
              </button>
            </div>

            <div
              className="rounded-lg p-4"
              style={{
                background: useCustomBackground
                  ? backgroundColor
                  : "repeating-conic-gradient(#808080 0% 25%, #ffffff 0% 50%) 50% / 20px 20px",
              }}
            >
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className={`max-w-full rounded ${isPickerMode ? "cursor-crosshair" : ""}`}
                style={{ display: "block" }}
              />
            </div>

            {isPickerMode && (
              <div className="bg-ctp-blue/20 border-ctp-blue rounded-lg border p-3">
                <p className="text-ctp-text text-sm">
                  🎨 Click on any color in the image to remove it and all
                  connected pixels of similar color. Adjust tolerance to control
                  how similar colors must be.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Hidden original canvas */}
        <canvas ref={originalCanvasRef} style={{ display: "none" }} />

        {/* Action Buttons */}
        {file && (
          <div className="flex flex-wrap gap-4">
            {resultUrl && (
              <button
                onClick={downloadResult}
                className="bg-ctp-green text-ctp-base hover:bg-ctp-teal rounded-lg px-4 py-2 transition-colors duration-200"
              >
                Download PNG
              </button>
            )}
            <button
              onClick={reset}
              className="bg-ctp-surface0 text-ctp-text hover:bg-ctp-surface1 rounded-lg px-4 py-2 transition-colors duration-200"
            >
              Process Another Image
            </button>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-ctp-surface0 rounded-lg p-4">
          <h3 className="text-ctp-text mb-2 text-lg font-semibold">
            How to use
          </h3>
          <ol className="text-ctp-subtext0 list-inside list-decimal space-y-1 text-sm">
            <li>Upload an image</li>
            <li>Adjust the tolerance slider (higher = more similar colors)</li>
            <li>
              Optional: Enable custom background color to see leftover pixels
              (e.g., use black background when removing white)
            </li>
            <li>Click "Activate Color Picker"</li>
            <li>Click on any color in the image to remove it</li>
            <li>
              The tool removes the clicked color and all connected pixels of
              similar color
            </li>
            <li>Click multiple times to remove different areas</li>
            <li>Download your result as a PNG with transparency</li>
          </ol>
        </div>
      </div>
    </main>
  );
};

export default ColorBackgroundRemoval;
