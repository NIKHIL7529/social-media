import { RefreshCw } from "lucide-react";

export function QueryError({ error, onRetry, retrying = false }: { error: Error | null; onRetry?: () => void; retrying?: boolean }) {
  if (!error) return null;
  return <div role="alert" className="surface-card mb-5 p-5">
    <p className="break-words text-danger">{error.message}</p>
    {onRetry && <button type="button" onClick={onRetry} disabled={retrying} className="action-secondary mt-3 disabled:opacity-60"><RefreshCw size={16} aria-hidden="true" />Try again</button>}
  </div>;
}
