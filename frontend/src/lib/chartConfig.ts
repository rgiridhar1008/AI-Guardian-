/* ─────────────────────────────────────────────────────
 * AI Guardian — Chart.js registration & shared options
 * ───────────────────────────────────────────────────── */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Filler,
} from 'chart.js';

/* Register chart plugins once at module level */
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Filler,
);

/** Shared line/bar chart options — axes styled for the dashboard theme */
export const sharedChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#7f8da6' },
    },
    y: {
      grid: { color: 'rgba(122,143,180,.09)' },
      ticks: { color: '#7f8da6' },
    },
  },
} as const;

/** Donut chart options for model distribution */
export const donutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '76%',
  plugins: {
    legend: { display: false },
  },
} as const;

export { ChartJS };
