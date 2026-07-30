"use client";

import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="bg-ivory min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-red-400 text-2xl">!</span>
        </div>
        <h1 className="text-xl font-light text-charcoal mb-2">Something went wrong</h1>
        <p className="text-sm text-mink mb-8">{error.message || "An unexpected error occurred."}</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="text-xs tracking-widest uppercase bg-charcoal text-ivory px-6 py-3 hover:bg-charcoal-deep transition-colors">Try Again</button>
          <Link href="/" className="text-xs tracking-widest uppercase border border-charcoal text-charcoal px-6 py-3 hover:bg-charcoal hover:text-ivory transition-colors">Go Home</Link>
        </div>
      </div>
    </div>
  );
}
