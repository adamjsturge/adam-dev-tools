import { Link } from "wouter";

const NotFound = () => (
  <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
    <div className="text-center">
      <h1 className="text-ctp-text text-9xl font-bold">404</h1>
      <p className="text-ctp-text mt-4 text-2xl font-semibold">
        Page Not Found
      </p>
      <p className="text-ctp-subtext0 mt-2">
        The page you're looking for doesn't exist.
      </p>
      <Link
        href="/"
        className="bg-ctp-blue text-ctp-base hover:bg-ctp-sapphire mt-6 inline-block rounded-lg px-6 py-3 transition-colors"
      >
        Go Home
      </Link>
    </div>
  </div>
);

export default NotFound;
