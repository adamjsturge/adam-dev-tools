import { useState } from "react";
import Button from "../../components/Button";
import PageShell from "../../components/PageShell";
import { useUrlBooleanState, useUrlState } from "../../utils/useUrlState";

const WebPConverter = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [qualityPercent, setQualityPercent] = useUrlState("q", 100);
  const [appendQuality, setAppendQuality] = useUrlBooleanState("append", false);
  const quality = qualityPercent / 100;
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
    <PageShell
      title="WebP Converter"
      subtitle="Batch-convert images to WebP at any quality"
    >
      <div className="flex flex-col gap-6">
        <div className="w-full">
          <input
            type="file"
            accept="image/*"
            multiple
            aria-label="Choose images to convert to WebP"
            onChange={(e) => setFiles(e.target.files)}
            className="file:bg-ctp-surface0 file:text-ctp-text hover:file:bg-ctp-surface1 border-ctp-surface2 w-full rounded-md border p-2 file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="flex flex-col">
              <span className="text-sm font-medium">
                Quality: {qualityPercent}%
              </span>
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                aria-label="Quality"
                value={qualityPercent}
                onChange={(e) =>
                  setQualityPercent(Number.parseInt(e.target.value, 10))
                }
                className="accent-ctp-blue w-full"
              />
            </label>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              aria-label="Append quality to filename"
              checked={appendQuality}
              onChange={(e) => setAppendQuality(e.target.checked)}
              className="accent-ctp-blue"
            />
            <span className="text-sm">Append quality to filename</span>
          </label>
        </div>

        <Button onClick={convertToWebP} disabled={!files || converting}>
          {converting
            ? `Converting... (${progress}/${totalFiles})`
            : "Convert to WebP"}
        </Button>
      </div>
    </PageShell>
  );
};

export default WebPConverter;
