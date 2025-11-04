import { useEffect, useMemo } from "react";
import TextArea from "../../components/TextArea";
import { useReactPersist } from "../../utils/Storage";

interface DecodedJWT {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  isValid: boolean;
  error?: string;
}

const decodeJWT = (token: string): DecodedJWT | null => {
  if (!token.trim()) {
    return null;
  }

  try {
    const parts = token.trim().split(".");

    if (parts.length !== 3) {
      return {
        header: {},
        payload: {},
        signature: "",
        isValid: false,
        error: "Invalid JWT format. JWT must have 3 parts separated by dots.",
      };
    }

    const [headerB64, payloadB64, signature] = parts;

    const base64UrlDecode = (str: string): string => {
      let base64 = str.replaceAll("-", "+").replaceAll("_", "/");
      while (base64.length % 4) {
        base64 += "=";
      }
      return atob(base64);
    };

    try {
      const header = JSON.parse(base64UrlDecode(headerB64));
      const payload = JSON.parse(base64UrlDecode(payloadB64));

      return {
        header,
        payload,
        signature,
        isValid: true,
      };
    } catch {
      return {
        header: {},
        payload: {},
        signature: "",
        isValid: false,
        error: "Failed to decode JWT. Invalid base64 or JSON format.",
      };
    }
  } catch (error) {
    return {
      header: {},
      payload: {},
      signature: "",
      isValid: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

const getCurrentTimestamp = () => Date.now() / 1000;

const JWTDebugger = () => {
  const [token, setToken] = useReactPersist("jwt-token", "");

  const decoded = useMemo(() => decodeJWT(token), [token]);
  const currentTime = getCurrentTimestamp();

  useEffect(() => {
    document.title = decoded?.isValid
      ? "JWT Debugger - Valid Token"
      : "JWT Debugger";
  }, [decoded]);

  const renderValue = (key: string, value: unknown) => {
    if (
      (key === "exp" || key === "iat" || key === "nbf") &&
      typeof value === "number"
    ) {
      const isExpired = key === "exp" && value < currentTime;
      const isNotYetValid = key === "nbf" && value > currentTime;

      return (
        <div>
          <div className="text-ctp-text font-mono text-sm">{value}</div>
          <div
            className={`text-xs ${
              isExpired || isNotYetValid ? "text-ctp-red" : "text-ctp-subtext0"
            }`}
          >
            {formatTimestamp(value)}
            {isExpired && " (Expired)"}
            {isNotYetValid && " (Not yet valid)"}
          </div>
        </div>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <pre className="text-ctp-text font-mono text-xs whitespace-pre-wrap">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }

    return (
      <span className="text-ctp-text font-mono text-sm">{String(value)}</span>
    );
  };

  return (
    <main className="container mx-auto min-h-[calc(100vh-4rem)] max-w-[1600px] px-4 pt-8 pb-4">
      <div className="mb-6">
        <h1 className="text-ctp-text mb-2 text-3xl font-bold">JWT Debugger</h1>
        <p className="text-ctp-subtext0">
          Decode and inspect JSON Web Tokens in real-time
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col">
          <div className="bg-ctp-surface0 flex h-full flex-col rounded-xl p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-ctp-text text-lg font-semibold">
                Encoded JWT
              </h2>
              {token && (
                <button
                  onClick={() => setToken("")}
                  className="text-ctp-subtext0 hover:text-ctp-red text-sm transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <TextArea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your JWT token here...&#10;&#10;Example:&#10;eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
              customClass="flex-1 min-h-[400px] font-mono text-sm"
            />
            {decoded?.isValid && (
              <div className="border-ctp-green/20 bg-ctp-green/10 mt-4 flex items-center gap-2 rounded-lg border px-3 py-2">
                <svg
                  className="text-ctp-green h-5 w-5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-ctp-green text-sm font-medium">
                  Valid JWT format
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {!decoded && (
            <div className="bg-ctp-surface0 flex h-full items-center justify-center rounded-xl p-12 text-center shadow-lg">
              <div>
                <svg
                  className="text-ctp-overlay0 mx-auto mb-4 h-16 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
                <p className="text-ctp-subtext0 text-lg">
                  Paste a JWT token to decode it
                </p>
              </div>
            </div>
          )}

          {decoded?.error && (
            <div className="bg-ctp-surface0 rounded-xl p-6 shadow-lg">
              <div className="flex items-start gap-3">
                <svg
                  className="text-ctp-red h-6 w-6 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="text-ctp-red mb-1 font-semibold">
                    Decoding Error
                  </h3>
                  <p className="text-ctp-subtext0 text-sm">{decoded.error}</p>
                </div>
              </div>
            </div>
          )}

          {decoded?.isValid && (
            <>
              <div className="bg-ctp-surface0 rounded-xl p-6 shadow-lg">
                <h2 className="text-ctp-mauve mb-4 flex items-center gap-2 text-lg font-bold">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Header
                </h2>
                <div className="space-y-3">
                  {Object.entries(decoded.header).map(([key, value]) => (
                    <div
                      key={key}
                      className="border-ctp-surface2 border-l-2 pl-3"
                    >
                      <div className="text-ctp-blue mb-1 text-xs font-semibold tracking-wide uppercase">
                        {key}
                      </div>
                      {renderValue(key, value)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-ctp-surface0 rounded-xl p-6 shadow-lg">
                <h2 className="text-ctp-green mb-4 flex items-center gap-2 text-lg font-bold">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Payload
                </h2>
                <div className="space-y-3">
                  {Object.entries(decoded.payload).map(([key, value]) => (
                    <div
                      key={key}
                      className="border-ctp-surface2 border-l-2 pl-3"
                    >
                      <div className="text-ctp-blue mb-1 text-xs font-semibold tracking-wide uppercase">
                        {key}
                      </div>
                      {renderValue(key, value)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-ctp-surface0 rounded-xl p-6 shadow-lg">
                <h2 className="text-ctp-peach mb-4 flex items-center gap-2 text-lg font-bold">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Signature
                </h2>
                <div className="bg-ctp-mantle text-ctp-text rounded-lg p-3 font-mono text-xs break-all">
                  {decoded.signature}
                </div>
                <p className="text-ctp-subtext0 mt-3 text-xs leading-relaxed">
                  To verify this signature, you need the secret key or public
                  key (for asymmetric algorithms) along with the algorithm
                  specified in the header.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default JWTDebugger;
