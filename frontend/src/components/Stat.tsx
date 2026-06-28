/* ─────────────────────────────────────────────────────
 * Stat — Animated metric card with icon and delta
 * ───────────────────────────────────────────────────── */

import { motion } from 'framer-motion';
import { ArrowUpRight, MoreHorizontal } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

interface StatProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string | number;
  delta: string;
  tone?: 'blue' | 'green' | 'amber' | 'purple';
}

export default function Stat({
  icon: Icon,
  label,
  value,
  delta,
  tone = 'blue',
}: StatProps) {
  return (
    <motion.div whileHover={{ y: -3 }} className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon />
      </div>
      <span>
        {label}
        <MoreHorizontal />
      </span>
      <strong>{value}</strong>
      <small>
        <ArrowUpRight /> {delta} <i>vs last month</i>
      </small>
    </motion.div>
  );
}
