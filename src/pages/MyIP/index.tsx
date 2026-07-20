import { useCallback, useEffect, useRef, useState } from "react";
import Button from "../../components/Button";
import CopyButton from "../../components/CopyButton";
import PageShell from "../../components/PageShell";

// Served by Cloudflare on our own domain, so no third-party lookup.
// The dev server proxies this path to the deployed site (vite.config.ts).
const TRACE_URL = "/cdn-cgi/trace";

const DETAILS: { key: string; label: string }[] = [
  { key: "loc", label: "Country" },
  { key: "colo", label: "Cloudflare data center" },
  { key: "http", label: "HTTP version" },
  { key: "tls", label: "TLS version" },
  { key: "warp", label: "Cloudflare WARP" },
  { key: "uag", label: "User agent" },
];

type Lookup =
  | { status: "loading" }
  | { status: "error" }
  | { status: "done"; trace: Record<string, string> };

const parseTrace = (text: string): Record<string, string> => {
  const trace: Record<string, string> = {};
  for (const line of text.trim().split("\n")) {
    const separator = line.indexOf("=");
    if (separator > 0) {
      trace[line.slice(0, separator)] = line.slice(separator + 1);
    }
  }
  return trace;
};

const MyIP = () => {
  const [lookup, setLookup] = useState<Lookup>({ status: "loading" });
  const requestId = useRef(0);

  const runLookup = useCallback(() => {
    const id = ++requestId.current;
    void (async () => {
      let result: Lookup;
      try {
        const response = await fetch(TRACE_URL, {
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const trace = parseTrace(await response.text());
        if (!trace.ip) throw new Error("No ip field in trace");
        result = { status: "done", trace };
      } catch {
        result = { status: "error" };
      }
      if (requestId.current === id) {
        setLookup(result);
      }
    })();
  }, []);

  const refresh = () => {
    setLookup({ status: "loading" });
    runLookup();
  };

  useEffect(() => {
    runLookup();
  }, [runLookup]);

  return (
    <PageShell
      title="My IP"
      subtitle="See the public IP address your requests come from"
      actions={<Button onClick={refresh}>Refresh</Button>}
    >
      {lookup.status === "loading" && (
        <div className="bg-ctp-surface0 rounded-md p-6">
          <p className="text-ctp-subtext0">Detecting...</p>
        </div>
      )}

      {lookup.status === "error" && (
        <div className="bg-ctp-surface0 rounded-md p-6">
          <p className="text-ctp-red">
            Couldn&apos;t look up your IP. This tool relies on the site being
            served through Cloudflare.
          </p>
        </div>
      )}

      {lookup.status === "done" && (
        <>
          <div className="bg-ctp-surface0 mb-4 flex items-center gap-3 rounded-md p-6">
            <code className="text-ctp-text flex-1 font-mono text-2xl break-all">
              {lookup.trace.ip}
            </code>
            <CopyButton text={lookup.trace.ip} />
          </div>
          <div className="bg-ctp-surface0 divide-ctp-surface1 divide-y rounded-md">
            {DETAILS.map(({ key, label }) =>
              lookup.trace[key] ? (
                <div key={key} className="flex items-baseline gap-3 px-4 py-2">
                  <span className="text-ctp-subtext0 w-48 shrink-0 text-sm">
                    {label}
                  </span>
                  <code className="text-ctp-text font-mono text-sm break-all">
                    {lookup.trace[key]}
                  </code>
                </div>
              ) : null,
            )}
          </div>
        </>
      )}

      <p className="text-ctp-subtext0 mt-4 text-xs">
        Answered by Cloudflare on this domain (
        <code className="font-mono">/cdn-cgi/trace</code>) — no third-party
        services. The address shown is the one your browser used to connect, so
        you&apos;ll see IPv6 when your network prefers it.
      </p>
    </PageShell>
  );
};

export default MyIP;
