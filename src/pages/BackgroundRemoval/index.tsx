import { removeBackground } from "@imgly/background-removal";
import { useState } from "react";

const BackgroundRemoval = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [resultUrl, setResultUrl] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResultUrl("");

      // Create preview
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setPreviewUrl(reader.result as string);
      });
      reader.readAsDataURL(selectedFile);
    }
  };

  const processImage = async () => {
    if (!file) return;

    setProcessing(true);
    setProgress(0);

    try {
      const imageUrl = URL.createObjectURL(file);

      const blob = await removeBackground(imageUrl, {
        progress: (_key, current, total) => {
          const percentage = Math.round((current / total) * 100);
          setProgress(percentage);
        },
      });

      // Create URL for the result
      const resultImageUrl = URL.createObjectURL(blob);
      setResultUrl(resultImageUrl);

      // Cleanup
      URL.revokeObjectURL(imageUrl);
    } catch (error) {
      console.error("Error removing background:", error);
      alert(
        "Failed to remove background. Please try again with a different image.",
      );
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const downloadResult = () => {
    if (!resultUrl || !file) return;

    const link = document.createElement("a");
    link.href = resultUrl;
    const originalName = file.name.slice(0, file.name.lastIndexOf("."));
    link.download = `${originalName}-no-bg.png`;
    link.click();
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl("");
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl("");
    }
  };

  return (
    <main className="container mx-auto max-w-4xl px-4 pt-8 pb-4">
      <h1 className="text-ctp-text mb-6 text-2xl font-bold">
        Background Removal
      </h1>

      <div className="flex flex-col gap-6">
        {/* File Input */}
        <div className="w-full">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={processing}
            className="file:bg-ctp-surface0 file:text-ctp-text hover:file:bg-ctp-surface1 border-ctp-surface2 w-full rounded-lg border p-2 file:mr-4 file:rounded-lg file:border-0 file:px-4 file:py-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="text-ctp-subtext0 mt-2 text-sm">
            Upload an image to remove its background using AI. The result will
            be a PNG with transparency, preserving full quality.
          </p>
        </div>

        {/* Preview and Result */}
        {previewUrl && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Original Preview */}
            <div className="flex flex-col gap-2">
              <h2 className="text-ctp-text text-lg font-semibold">Original</h2>
              <div className="bg-ctp-surface0 rounded-lg p-4">
                <img
                  src={previewUrl}
                  alt="Original"
                  className="h-auto w-full rounded"
                />
              </div>
            </div>

            {/* Result */}
            <div className="flex flex-col gap-2">
              <h2 className="text-ctp-text text-lg font-semibold">
                Background Removed
              </h2>
              <div
                className="rounded-lg p-4"
                style={{
                  background:
                    "repeating-conic-gradient(#808080 0% 25%, #ffffff 0% 50%) 50% / 20px 20px",
                }}
              >
                {resultUrl ? (
                  <img
                    src={resultUrl}
                    alt="Result"
                    className="h-auto w-full rounded"
                  />
                ) : (
                  <div className="bg-ctp-surface0/50 flex h-64 items-center justify-center rounded">
                    <span className="text-ctp-subtext0">
                      {processing
                        ? `Processing... ${progress}%`
                        : "Result will appear here"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={processImage}
            disabled={!file || processing || !!resultUrl}
            className="bg-ctp-mauve text-ctp-base hover:bg-ctp-pink rounded-lg px-4 py-2 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? `Processing... ${progress}%` : "Remove Background"}
          </button>

          {resultUrl && (
            <>
              <button
                onClick={downloadResult}
                className="bg-ctp-green text-ctp-base hover:bg-ctp-teal rounded-lg px-4 py-2 transition-colors duration-200"
              >
                Download PNG
              </button>
              <button
                onClick={reset}
                className="bg-ctp-surface0 text-ctp-text hover:bg-ctp-surface1 rounded-lg px-4 py-2 transition-colors duration-200"
              >
                Process Another Image
              </button>
            </>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-ctp-surface0 rounded-lg p-4">
          <h3 className="text-ctp-text mb-2 text-lg font-semibold">
            About this tool
          </h3>
          <ul className="text-ctp-subtext0 list-inside list-disc space-y-1 text-sm">
            <li>Uses AI to intelligently remove backgrounds from images</li>
            <li>
              Processes images entirely in your browser - no upload to servers
            </li>
            <li>Preserves original image quality</li>
            <li>Outputs PNG format with transparency</li>
            <li>First use may take a moment to load the AI model</li>
          </ul>
        </div>
      </div>
    </main>
  );
};

export default BackgroundRemoval;
