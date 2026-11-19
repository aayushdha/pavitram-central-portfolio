"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4 text-white">
      <div className="max-w-xl text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">
          This page didn&apos;t load
        </h1>
        <p className="mt-2 text-sm text-white/70">
          Something went wrong. Try refreshing or head back home.
        </p>
        {error?.message && (
          <div className="mt-4 p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-left overflow-auto max-h-48">
            <p className="text-xs font-mono text-red-400 font-bold">
              {error.name}: {error.message}
            </p>
            {error.stack && (
              <pre className="mt-2 text-[11px] font-mono text-red-300/80 whitespace-pre-wrap">
                {error.stack}
              </pre>
            )}
          </div>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-2.5 text-sm font-bold text-navy transition-colors hover:bg-white"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:border-gold hover:text-gold"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
