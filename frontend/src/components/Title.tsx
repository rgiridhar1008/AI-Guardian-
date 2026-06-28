/* ─────────────────────────────────────────────────────
 * Title — Panel header with subtitle and action slot
 * ───────────────────────────────────────────────────── */

import type { ReactNode } from 'react';

interface TitleProps {
  title: string;
  subtitle: string;
  children?: ReactNode;
}

export default function Title({ title, subtitle, children }: TitleProps) {
  return (
    <div className="panel-title">
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
