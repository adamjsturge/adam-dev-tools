import QrScanner from "qr-scanner";
import { useState } from "react";

const QRCodeScanner = () => {
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const scanQRFromFile = async (file: File) => {
    setIsScanning(true);
    setError("");
    setResult("");

    try {
      const objectURL = URL.createObjectURL(file);
      setImageSrc(objectURL);

      const qrResult = await QrScanner.scanImage(file);
      setResult(qrResult);
    } catch {
      setError("No QR code found in the image");
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file && file.type.startsWith("image/")) {
      scanQRFromFile(file);
    }
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          scanQRFromFile(file);
          return;
        }
      }
    }
  };

  const handleClipboardRead = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.read) {
        setError("Clipboard access is not supported in this browser");
        return;
      }

      const clipboardItems = await navigator.clipboard.read();

      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith("image/")) {
            const blob = await clipboardItem.getType(type);
            const file = new File(
              [blob],
              `clipboard-image.${type.split("/")[1]}`,
              { type },
            );
            scanQRFromFile(file);
            return;
          }
        }
      }

      setError("No image found in clipboard");
    } catch (error_) {
      if (error_ instanceof Error && error_.name === "NotAllowedError") {
        setError(
          "Permission denied. Please allow clipboard access or use Ctrl+V instead",
        );
      } else {
        setError("Failed to read from clipboard. Try using Ctrl+V instead");
      }
    }
  };

  const copyResult = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result);
      } catch (error_) {
        console.error("Failed to copy to clipboard:", error_);
      }
    }
  };

  const clearScan = () => {
    setResult("");
    setError("");
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }
    setImageSrc("");
  };

  return (
    <main className="min-h-[calc(100vh-4rem)]" onPaste={handlePaste}>
      <div className="container mx-auto px-4 pt-8 pb-6 sm:pt-10 sm:pb-8">
        <div className="mb-8 text-center">
          <h1 className="text-ctp-text mb-3 text-3xl font-bold sm:text-4xl">
            QR Code Scanner
          </h1>
          <p className="text-ctp-subtext0 text-lg">
            Scan QR codes from images instantly
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="bg-ctp-surface0 mb-6 rounded-2xl p-6 shadow-lg sm:p-8">
            <div className="bg-ctp-surface1 mb-6 rounded-xl p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="bg-ctp-blue flex h-8 w-8 items-center justify-center rounded-full">
                  <svg
                    className="text-ctp-base h-5 w-5"
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
                </div>
                <h2 className="text-ctp-text text-lg font-semibold sm:text-xl">
                  How to scan
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="shrink-0">
                    <div className="bg-ctp-blue/20 text-ctp-blue flex h-6 w-6 items-center justify-center rounded-full">
                      <span className="text-sm font-bold">1</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-ctp-text font-medium">
                      Paste from clipboard
                    </p>
                    <p className="text-ctp-subtext0 text-sm">
                      Use button below or{" "}
                      <kbd className="bg-ctp-surface2 text-ctp-text rounded px-2 py-1 font-mono text-xs">
                        Ctrl+V
                      </kbd>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="shrink-0">
                    <div className="bg-ctp-green/20 text-ctp-green flex h-6 w-6 items-center justify-center rounded-full">
                      <span className="text-sm font-bold">2</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-ctp-text font-medium">
                      Upload image file
                    </p>
                    <p className="text-ctp-subtext0 text-sm">
                      PNG, JPG, WebP supported
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleClipboardRead}
                className="bg-ctp-surface2 hover:bg-ctp-overlay0 focus:ring-ctp-surface2 focus:ring-offset-ctp-base flex flex-1 items-center justify-center gap-3 rounded-xl p-4 transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
              >
                <svg
                  className="text-ctp-blue h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                <div className="text-left">
                  <p className="text-ctp-text font-medium">
                    Paste from Clipboard
                  </p>
                  <p className="text-ctp-subtext0 text-sm">
                    Tap to paste image
                  </p>
                </div>
              </button>
            </div>

            <div className="mb-6">
              <label
                className="group relative block"
                aria-label="Upload image file"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <div className="border-ctp-surface2 bg-ctp-base hover:border-ctp-blue hover:bg-ctp-surface1 peer-focus:border-ctp-blue peer-focus:ring-ctp-blue peer-focus:ring-opacity-20 flex min-h-[120px] items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all duration-200 peer-focus:ring-2 sm:min-h-[140px]">
                  <div className="text-center">
                    <svg
                      className="text-ctp-subtext0 group-hover:text-ctp-blue mx-auto mb-3 h-12 w-12"
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
                    <p className="text-ctp-text mb-1 text-lg font-medium">
                      Drop image here or click to browse
                    </p>
                    <p className="text-ctp-subtext0 text-sm">
                      Supports PNG, JPG, WebP, and other image formats
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {isScanning && (
              <div className="bg-ctp-blue/10 mb-6 flex flex-col items-center justify-center rounded-xl p-6">
                <div className="border-ctp-blue mb-3 h-8 w-8 animate-spin rounded-full border-3 border-t-transparent"></div>
                <p className="text-ctp-blue font-medium">Scanning QR code...</p>
              </div>
            )}

            {error && (
              <div className="border-ctp-red/30 bg-ctp-red/10 mb-6 rounded-xl border p-4">
                <div className="flex items-center gap-3">
                  <svg
                    className="text-ctp-red h-5 w-5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <p className="text-ctp-red font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>

          {imageSrc && (
            <div className="bg-ctp-surface0 mb-6 rounded-2xl p-6 shadow-lg">
              <h3 className="text-ctp-text mb-4 text-lg font-semibold">
                Uploaded Image
              </h3>
              <div className="overflow-hidden rounded-xl">
                <img
                  src={imageSrc}
                  alt="Uploaded QR code"
                  className="mx-auto max-h-80 w-full max-w-full object-contain"
                />
              </div>
            </div>
          )}

          {result && (
            <div className="bg-ctp-green/10 mb-6 rounded-2xl p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-ctp-green flex h-8 w-8 items-center justify-center rounded-full">
                  <svg
                    className="text-ctp-base h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-ctp-green text-lg font-semibold sm:text-xl">
                  QR Code Content
                </h3>
              </div>
              <div className="border-ctp-surface2 bg-ctp-base mb-4 rounded-xl border p-4">
                <code className="text-ctp-text block text-sm break-all sm:text-base">
                  {result}
                </code>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={copyResult}
                  className="bg-ctp-blue hover:bg-ctp-sapphire focus:ring-ctp-blue focus:ring-offset-ctp-base text-ctp-base flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy to Clipboard
                </button>
                {(result.startsWith("http://") ||
                  result.startsWith("https://")) && (
                  <a
                    href={result}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-ctp-mauve hover:bg-ctp-pink focus:ring-ctp-mauve focus:ring-offset-ctp-base text-ctp-base flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Open Link
                  </a>
                )}
              </div>
            </div>
          )}

          {(result || error || imageSrc) && (
            <div className="text-center">
              <button
                onClick={clearScan}
                className="bg-ctp-surface2 hover:bg-ctp-overlay0 focus:ring-ctp-surface2 focus:ring-offset-ctp-base text-ctp-text rounded-xl px-6 py-3 font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
              >
                Clear Results
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default QRCodeScanner;
