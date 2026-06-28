/* ─────────────────────────────────────────────────────
 * EmptyState — Placeholder when no data exists
 * ───────────────────────────────────────────────────── */

import { FileSearch } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

interface EmptyStateProps {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  title?: string;
  message?: string;
}

export default function EmptyState({
  icon: Icon = FileSearch,
  title = 'No data yet',
  message = 'Records will appear here once created.',
}: EmptyStateProps) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: 'var(--muted)',
      }}
    >
      <Icon style={{ width: 32, height: 32, marginBottom: 12 }} />
      <h3 style={{ fontSize: 14, margin: '0 0 6px' }}>{title}</h3>
      <p style={{ fontSize: 11 }}>{message}</p>
    </div>
  );
}
