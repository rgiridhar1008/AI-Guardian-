/* ─────────────────────────────────────────────────────
 * Score — Circular conic-gradient progress ring
 * ───────────────────────────────────────────────────── */

import { pct } from '../lib/utils';

interface ScoreProps {
  label: string;
  value: number;
  color: string;
}

export default function Score({ label, value, color }: ScoreProps) {
  return (
    <div className="score">
      <div
        style={{
          background: `conic-gradient(${color} ${value * 360}deg, var(--line) 0)`,
        }}
      >
        <span>{pct(value)}</span>
      </div>
      <p>{label}</p>
    </div>
  );
}
