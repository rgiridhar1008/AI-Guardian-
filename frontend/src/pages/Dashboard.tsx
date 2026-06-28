/* ─────────────────────────────────────────────────────
 * Dashboard — Overview with charts and tables
 * ───────────────────────────────────────────────────── */

import { Line, Doughnut } from 'react-chartjs-2';
import {
  ArrowUpRight,
  Cpu,
  FileSearch,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

import Stat from '../components/Stat';
import Title from '../components/Title';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import { money } from '../lib/utils';
import { sharedChartOptions, donutChartOptions } from '../lib/chartConfig';
import type { Dash, PageId, RoutingEntry } from '../lib/types';

interface DashboardProps {
  d: Dash;
  setActive: (id: PageId) => void;
}

export default function Dashboard({ d, setActive }: DashboardProps) {
  /* ── Chart data ─────────────────────────────── */
  const lineData = {
    labels: d.trends.labels,
    datasets: [
      {
        data: d.trends.approvals,
        borderColor: '#8b7cf6',
        backgroundColor: 'rgba(139,124,246,.16)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const donutData = {
    labels: Object.keys(d.model_usage),
    datasets: [
      {
        data: Object.values(d.model_usage),
        backgroundColor: ['#8b7cf6', '#4fd1c5', '#f5bd65'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <>
      {/* ── Welcome bar ───────────────────────────── */}
      <section className="welcome">
        <div>
          <p>Saturday, 27 June</p>
          <h1>
            Good morning, Maya.{' '}
            <span>Your AI estate is healthy.</span>
          </h1>
        </div>
        <button className="primary" onClick={() => setActive('new')}>
          <Sparkles /> Start new audit
        </button>
      </section>

      {/* ── KPI row ───────────────────────────────── */}
      <div className="stats-grid">
        <Stat
          icon={FileSearch}
          label="Total audits"
          value={d.stats.total_audits || 0}
          delta="+12.4%"
        />
        <Stat
          icon={ShieldCheck}
          label="Success rate"
          value={`${d.stats.success_rate || 0}%`}
          delta="+3.1%"
          tone="green"
        />
        <Stat
          icon={AlertTriangle}
          label="Bias alerts"
          value={d.stats.bias_alerts || 0}
          delta="-18.2%"
          tone="amber"
        />
        <Stat
          icon={Zap}
          label="Cost saved"
          value={money(d.stats.cost_saved || 0)}
          delta="+8.7%"
          tone="purple"
        />
      </div>

      {/* ── Charts row ────────────────────────────── */}
      <div className="dashboard-grid">
        {/* Trend line */}
        <section className="panel trend-panel">
          <Title
            title="Decision volume"
            subtitle="Approval trend across monitored models"
          />
          <div className="big-number">
            78.2% <span><ArrowUpRight /> 6.4%</span>
          </div>
          <div className="chart">
            <Line data={lineData} options={sharedChartOptions} />
          </div>
        </section>

        {/* Model donut */}
        <section className="panel usage-panel">
          <Title
            title="Model distribution"
            subtitle="cascadeflow routing mix"
          />
          <div className="donut">
            <Doughnut data={donutData} options={donutChartOptions} />
            <div>
              <b>{d.routing.length}</b>
              <span>routes</span>
            </div>
          </div>
          <div className="legend">
            {Object.entries(d.model_usage).map(([k, v], i) => (
              <p key={k}>
                <i
                  style={{
                    background: ['#8b7cf6', '#4fd1c5', '#f5bd65'][i],
                  }}
                />
                {k} models <b>{String(v)}</b>
              </p>
            ))}
          </div>
        </section>
      </div>

      {/* ── Bottom row: table + routes ────────────── */}
      <div className="dashboard-grid lower">
        <DataTable rows={d.recent} />

        <section className="panel route-panel">
          <Title
            title="Runtime intelligence"
            subtitle="Live cascadeflow decisions"
          >
            <Badge tone="success">LIVE</Badge>
          </Title>

          {d.routing.slice(0, 5).map((r: RoutingEntry) => (
            <div className="route-item" key={r.id}>
              <div className={r.complexity}>
                <Cpu />
              </div>
              <span>
                <b>{r.model}</b>
                <Badge>{r.complexity}</Badge>
                <p>{r.reason.split(';')[0]}</p>
                <small>
                  {Math.round(r.latency_ms)} ms · {money(r.cost_usd)}
                </small>
              </span>
            </div>
          ))}

          <div className="route-summary">
            <Zap />
            <span>
              <b>38% lower inference cost</b>
              <small>this month with cascadeflow</small>
            </span>
          </div>
        </section>
      </div>
    </>
  );
}
