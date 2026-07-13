import { Component, ErrorInfo, ReactNode } from "react";
import { Link } from "wouter";
import Button from "./Button";

interface ErrorBoundaryProps {
  children: ReactNode;
  resetKey: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught a render error:", error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (
      this.state.error !== null &&
      prevProps.resetKey !== this.props.resetKey
    ) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error !== null) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="bg-ctp-surface0 rounded-md p-6 text-center">
            <h1 className="text-ctp-text text-2xl font-bold">
              Something went wrong
            </h1>
            <p className="text-ctp-subtext0 mt-2">
              This tool hit an unexpected error. Reloading the page usually
              fixes it.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button onClick={() => globalThis.location.reload()}>
                Reload page
              </Button>
              <Link
                href="/"
                className="bg-ctp-surface1 text-ctp-text hover:bg-ctp-surface2 inline-block rounded-md px-4 py-2 font-semibold transition-colors duration-100"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
