import JSZip from "jszip";
import { useState } from "react";
import Button from "../../components/Button";
import PageShell from "../../components/PageShell";

interface ExtractedFile {
  name: string;
  content: Blob;
}

const Unzip = () => {
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File | null) => {
    if (!file) return;

    try {
      setIsProcessing(true);
      setError("");

      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      const extracted: ExtractedFile[] = [];

      for (const [filename, zipFile] of Object.entries(contents.files)) {
        if (!zipFile.dir) {
          const blob = await zipFile.async("blob");
          extracted.push({ name: filename, content: blob });
        }
      }

      setExtractedFiles(extracted);
    } catch (error_) {
      setError(
        "Failed to process zip file: " +
          (error_ instanceof Error ? error_.message : String(error_)),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    handleFile(file);
  };

  const downloadFile = (filename: string, content: Blob) => {
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const downloadAll = async () => {
    try {
      if (!("showDirectoryPicker" in globalThis)) {
        alert(
          "Your browser doesn't support folder downloads. Files will download individually.",
        );
        for (const file of extractedFiles) {
          downloadFile(file.name, file.content);
        }
        return;
      }

      const rootHandle = await (
        globalThis as unknown as Window & {
          showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
        }
      ).showDirectoryPicker();
      const processedFolders = new Map<string, FileSystemDirectoryHandle>();

      for (const file of extractedFiles) {
        const pathParts = file.name.split("/");
        const fileName = pathParts.pop();
        let currentHandle = rootHandle;

        for (const folder of pathParts) {
          if (!folder) continue;

          const folderPath = pathParts
            .slice(0, pathParts.indexOf(folder) + 1)
            .join("/");
          const cachedHandle = processedFolders.get(folderPath);
          if (cachedHandle) {
            currentHandle = cachedHandle;
          } else {
            currentHandle = await currentHandle.getDirectoryHandle(folder, {
              create: true,
            });
            processedFolders.set(folderPath, currentHandle);
          }
        }

        if (fileName) {
          const fileHandle = await currentHandle.getFileHandle(fileName, {
            create: true,
          });
          const writable = await fileHandle.createWritable();
          await writable.write(file.content);
          await writable.close();
        }
      }

      alert("Files downloaded successfully!");
    } catch (error_) {
      console.error("Error downloading files:", error_);
      if (error_ instanceof Error && error_.name === "AbortError") {
        return;
      }
      alert("Failed to download files. Please try again.");
    }
  };

  return (
    <PageShell
      title="Unzip Files"
      subtitle="Extract ZIP archives right in your browser"
    >
      <section aria-labelledby="upload-section">
        <h2 className="sr-only" id="upload-section">
          File Upload Section
        </h2>
        <div
          className="border-ctp-surface2 hover:border-ctp-overlay0 bg-ctp-surface0 cursor-pointer rounded-md border-2 border-dashed p-8 text-center transition-colors duration-100"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              document.getElementById("file-input")?.click();
            }
          }}
          aria-label="File upload drop zone"
          data-testid="file-drop-zone"
          aria-describedby={error ? "error-message" : undefined}
        >
          <input
            type="file"
            accept=".zip"
            className="hidden"
            id="file-input"
            onChange={handleFileChange}
            aria-label="Choose zip file"
          />

          <label
            htmlFor="file-input"
            className="block h-full w-full cursor-pointer"
            aria-live="polite"
          >
            {isProcessing ? (
              <p className="text-ctp-subtext0" role="status">
                <span className="sr-only">Status:</span>
                Processing your file...
              </p>
            ) : (
              <p className="text-ctp-subtext0">
                <span className="sr-only">Instructions:</span>
                Drop a ZIP file here or click to select
              </p>
            )}
          </label>

          {error && (
            <p className="text-ctp-red mt-2" role="alert" id="error-message">
              {error}
            </p>
          )}
        </div>
      </section>

      {extractedFiles.length > 0 && (
        <section aria-labelledby="extracted-files-title" className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2
              className="text-ctp-text text-xl font-semibold"
              id="extracted-files-title"
            >
              Extracted Files ({extractedFiles.length})
            </h2>
            <Button onClick={downloadAll} aria-label="Download all files">
              Download All
            </Button>
          </div>
          <div className="grid gap-4" role="list">
            {extractedFiles.map((file) => (
              <div
                key={file.name}
                className="bg-ctp-surface0 flex items-center justify-between rounded-md p-4"
                role="listitem"
              >
                <span className="text-ctp-text truncate" title={file.name}>
                  {file.name}
                </span>
                <Button
                  variant="secondary"
                  onClick={() => downloadFile(file.name, file.content)}
                  aria-label={`Download ${file.name}`}
                >
                  Download
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
};

export default Unzip;
