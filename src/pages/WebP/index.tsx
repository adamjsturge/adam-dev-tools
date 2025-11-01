import { useState } from "react";
import { useReactPersist } from "../../utils/Storage";

const WebPConverter = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [quality, setQuality] = useReactPersist("webp-quality", 1);
  const [appendQuality, setAppendQuality] = useReactPersist(
    "webp-append-quality",
    false,
  );
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  const convertToWebP = async () => {
    if (!files || files.length === 0) return;

    setConverting(true);
    setTotalFiles(files.length);
    setProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const img = new Image();
      const reader = new FileReader();

      await new Promise<void>((resolve) => {
        reader.addEventListener("load", function (e) {
          img.src = e.target?.result as string;
          img.addEventListener("load", () => resolve());
        });
        reader.readAsDataURL(file);
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
          },
          "image/webp",
          quality === 1 ? 1 - Number.EPSILON : quality,
        );
      });

      const originalName = file.name.slice(0, file.name.lastIndexOf("."));
      const qualitySuffix = appendQuality
        ? `-q${Math.round(quality * 100)}`
        : "";
      const newFileName = `${originalName}${qualitySuffix}.webp`;

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = newFileName;
      link.click();
      URL.revokeObjectURL(link.href);

      setProgress(i + 1);
    }

    setConverting(false);
  };

  return (
    <main className="container mx-auto max-w-2xl px-4 pt-8 pb-4">
      <h1 className="text-ctp-text mb-6 text-2xl font-bold">WebP Converter</h1>

      <div className="flex flex-col gap-6">
        <div className="w-full">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="file:bg-ctp-surface0 file:text-ctp-text hover:file:bg-ctp-surface1 border-ctp-surface2 w-full rounded-lg border p-2 file:mr-4 file:rounded-lg file:border-0 file:px-4 file:py-2"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="flex flex-col">
              <span className="text-sm font-medium">
                Quality: {Math.round(quality * 100)}%
              </span>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={quality}
                onChange={(e) => setQuality(Number.parseFloat(e.target.value))}
                className="accent-ctp-mauve w-full"
              />
            </label>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={appendQuality}
              onChange={(e) => setAppendQuality(e.target.checked)}
              className="accent-ctp-mauve"
            />
            <span className="text-sm">Append quality to filename</span>
          </label>
        </div>

        <button
          onClick={convertToWebP}
          disabled={!files || converting}
          className="bg-ctp-mauve text-ctp-base hover:bg-ctp-pink rounded-lg px-4 py-2 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {converting
            ? `Converting... (${progress}/${totalFiles})`
            : "Convert to WebP"}
        </button>
      </div>
    </main>
  );
};

export default WebPConverter;
