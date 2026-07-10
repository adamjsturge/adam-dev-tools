import { useCallback, useEffect, useRef, useState } from "react";

export function useClipboard(timeoutMs = 2000) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const copy = useCallback(
    async (text: string, key = "default") => {
      try {
        await navigator.clipboard.writeText(text);
        clearTimeout(timeoutRef.current);
        setCopiedKey(key);
        timeoutRef.current = setTimeout(() => setCopiedKey(null), timeoutMs);
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
      }
    },
    [timeoutMs],
  );

  return { copy, copied: copiedKey !== null, copiedKey };
}
