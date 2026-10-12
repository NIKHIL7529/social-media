"use client";

import Link from "next/link";
import { useEffect } from "react";

export function ErrorScreen({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return <section role="alert" className="mx-auto my-6 max-w-xl rounded-2xl border border-danger/30 bg-surface p-6 text-ink">
    <h1 className="text-xl font-extrabold">This page could not be displayed</h1>
    <p className="mt-3 break-words text-danger">{error.message || "An unexpected error occurred."}</p>
    {error.digest && <p className="mt-2 break-words text-sm text-ink-muted">Error reference: {error.digest}</p>}
    <div className="mt-5 flex flex-wrap gap-3"><button onClick={reset} className="action-primary">Try again</button><Link href="/posts" className="action-secondary">Go to home</Link></div>
  </section>;
}
