import { useRef, useState } from "react";
import Button from "../../components/Button";
import PageShell from "../../components/PageShell";

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

  const targetIndex = (y * width + x) * 4;
  const targetR = data[targetIndex];
  const targetG = data[targetIndex + 1];
  const targetB = data[targetIndex + 2];

  // 1 byte per pixel — far cheaper than a Set<number> and O(1) to index.
  const visited = new Uint8Array(width * height);

  // Index-pointer queue over pixel keys (y * width + x). `queue.shift()`
  // is O(n) per dequeue (O(n^2) for the whole fill); reading at an
  // advancing head index is O(1). Checks happen BEFORE push, so the queue
  // never holds out-of-bounds, visited, or non-matching pixels.
  const queue: number[] = [];

  if (
    x >= 0 &&
    x < width &&
    y >= 0 &&
    y < height &&
    colorMatch(data, targetIndex, targetR, targetG, targetB, tolerance)
  ) {
    const startKey = y * width + x;
    visited[startKey] = 1;
    queue.push(startKey);
  }

  let head = 0;
  while (head < queue.length) {
    const key = queue[head++];
    const currentX = key % width;
    const currentY = (key - currentX) / width;
    const index = key * 4;

    // Make pixel transparent
    data[index + 3] = 0;

    // Left
    if (currentX > 0) {
      const neighborKey = key - 1;
      if (
        !visited[neighborKey] &&
        colorMatch(data, neighborKey * 4, targetR, targetG, targetB, tolerance)
      ) {
        visited[neighborKey] = 1;
        queue.push(neighborKey);
      }
    }
    // Right
    if (currentX < width - 1) {
      const neighborKey = key + 1;
      if (
        !visited[neighborKey] &&
        colorMatch(data, neighborKey * 4, targetR, targetG, targetB, tolerance)
      ) {
        visited[neighborKey] = 1;
        queue.push(neighborKey);
      }
    }
    // Up
    if (currentY > 0) {
      const neighborKey = key - width;
      if (
        !visited[neighborKey] &&
        colorMatch(data, neighborKey * 4, targetR, targetG, targetB, tolerance)
      ) {
        visited[neighborKey] = 1;
        queue.push(neighborKey);
      }
    }
    // Down
    if (currentY < height - 1) {
      const neighborKey = key + width;
      if (
        !visited[neighborKey] &&
        colorMatch(data, neighborKey * 4, targetR, targetG, targetB, tolerance)
      ) {
        visited[neighborKey] = 1;
        queue.push(neighborKey);
      }
    }
  }

  // Aggressive cleanup: Remove ALL matching pixels, not just connected ones
  if (aggressive) {
    for (let i = 0; i < data.length; i += 4) {
      if (colorMatch(data, i, targetR, targetG, targetB, tolerance)) {
        data[i + 3] = 0;
      }
    }
  }

  return new ImageData(data, width, height);
};

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
    <PageShell
      title="Color Background Removal"
      subtitle="Click any color in an image to remove it and similar connected pixels"
    >
      <div className="flex flex-col gap-6">
        {/* File Input */}
        <div className="w-full">
          <input
            type="file"
            accept="image/*"
            aria-label="Choose image to remove a color from"
            onChange={handleFileChange}
            className="file:bg-ctp-surface0 file:text-ctp-text hover:file:bg-ctp-surface1 border-ctp-surface2 w-full rounded-md border p-2 file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2"
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
                aria-label="Tolerance"
                value={tolerance}
                onChange={(e) => setTolerance(Number.parseInt(e.target.value))}
                className="accent-ctp-blue w-full"
              />
              <span className="text-ctp-subtext0 mt-1 text-xs">
                Higher tolerance removes more similar colors
              </span>
            </label>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  aria-label="Use custom background color"
                  checked={useCustomBackground}
                  onChange={(e) => setUseCustomBackground(e.target.checked)}
                  className="accent-ctp-blue"
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
                    aria-label="Background color"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="border-ctp-surface2 h-10 w-20 cursor-pointer rounded-md border-2"
                  />
                  <span className="text-ctp-subtext0 text-xs">
                    {backgroundColor}
                  </span>
                </div>
              )}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  aria-label="Aggressive cleanup (experimental)"
                  checked={aggressiveCleanup}
                  onChange={(e) => setAggressiveCleanup(e.target.checked)}
                  className="accent-ctp-blue"
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
              <Button
                variant={isPickerMode ? "primary" : "secondary"}
                onClick={() => setIsPickerMode(!isPickerMode)}
              >
                {isPickerMode ? "✓ Picker Active" : "Activate Color Picker"}
              </Button>
              <Button
                variant="secondary"
                onClick={resetCanvas}
                disabled={!resultUrl}
              >
                Reset Image
              </Button>
            </div>

            <div
              className="rounded-md p-4"
              style={{
                background: useCustomBackground
                  ? backgroundColor
                  : "repeating-conic-gradient(#808080 0% 25%, #ffffff 0% 50%) 50% / 20px 20px",
              }}
            >
              <canvas
                ref={canvasRef}
                aria-label="Image preview. Click a color to remove it"
                onClick={handleCanvasClick}
                className={`max-w-full rounded-md ${isPickerMode ? "cursor-crosshair" : ""}`}
                style={{ display: "block" }}
              />
            </div>

            {isPickerMode && (
              <div className="bg-ctp-blue/20 border-ctp-blue rounded-md border p-3">
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
        <canvas
          ref={originalCanvasRef}
          aria-hidden="true"
          style={{ display: "none" }}
        />

        {/* Action Buttons */}
        {file && (
          <div className="flex flex-wrap gap-4">
            {resultUrl && (
              <Button onClick={downloadResult}>Download PNG</Button>
            )}
            <Button variant="secondary" onClick={reset}>
              Process Another Image
            </Button>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-ctp-surface0 rounded-md p-4">
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
            <li>
              Optional: Enable aggressive cleanup to remove ALL matching pixels
              in the image (not just connected ones) - great for eliminating
              stray edge pixels
            </li>
            <li>Click "Activate Color Picker"</li>
            <li>Click on any color in the image to remove it</li>
            <li>
              The tool removes the clicked color and all connected pixels of
              similar color (or all matching pixels if aggressive mode is on)
            </li>
            <li>Click multiple times to remove different areas</li>
            <li>Download your result as a PNG with transparency</li>
          </ol>
        </div>
      </div>
    </PageShell>
  );
};

export default ColorBackgroundRemoval;
