/* ─────────────────────────────────────────────────────
 * ErrorState — Display an error with retry option
 * ───────────────────────────────────────────────────── */

import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: 'var(--red)',
      }}
    >
      <AlertTriangle style={{ width: 32, height: 32, marginBottom: 12 }} />
      <h3 style={{ fontSize: 14, margin: '0 0 6px' }}>Error</h3>
      <p style={{ fontSize: 11, color: 'var(--muted)' }}>{message}</p>
      {onRetry && (
        <button
          className="secondary"
          style={{ marginTop: 16 }}
          onClick={onRetry}
        >
          Retry
        </button>
      )}
    </div>
  );
}
