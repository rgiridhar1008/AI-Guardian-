/* ─────────────────────────────────────────────────────
 * Badge — Status pill with colour tone variants
 * ───────────────────────────────────────────────────── */

import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'purple';
}

export default function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return (
    <span className={`badge ${tone}`}>
      <i />
      {children}
    </span>
  );
}
