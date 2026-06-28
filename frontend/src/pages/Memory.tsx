/* ─────────────────────────────────────────────────────
 * Memory — Hindsight semantic memory search
 * ───────────────────────────────────────────────────── */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, BrainCircuit, Filter, Search } from 'lucide-react';

import Badge from '../components/Badge';
import { api } from '../lib/api';
import type { MemoryResult } from '../lib/types';

export default function Memory() {
  const [q, setQ] = useState(
    'loan applicants with moderate debt and stable income',
  );
  const [rows, setRows] = useState<MemoryResult[]>([]);
  const [busy, setBusy] = useState(false);

  const search = async () => {
    setBusy(true);
    try {
      const res = await api.post('/similar', { query: q, limit: 5 });
      setRows(res.data.results);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* ── Hero ──────────────────────────────────── */}
      <section className="memory-hero">
        <div>
          <BrainCircuit />
          <span>HINDSIGHT MEMORY</span>
          <h1>
            Your organization remembers
            <br />
            <em>every consequential decision.</em>
          </h1>
          <p>
            TEMPR retrieval combines semantic, keyword, graph, and temporal
            signals.
          </p>
        </div>
        <div className="memory-count">
          <b>104</b>
          <span>durable memories</span>
          <small>● Synced moments ago</small>
        </div>
      </section>

      {/* ── Search bar ────────────────────────────── */}
      <section className="panel search-panel">
        <div className="memory-search">
          <Search />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
          />
          <button className="primary" onClick={search}>
            {busy ? 'Recalling…' : 'Search memory'}
          </button>
        </div>
        <div className="filter-row">
          <Filter /> Search all memory types{' '}
          <Badge>experience</Badge>
          <Badge>observations</Badge>
        </div>
      </section>

      {/* ── Results ───────────────────────────────── */}
      <div className="memory-results">
        <h3>
          {rows.length} relevant cases{' '}
          <span>ranked by Hindsight similarity</span>
        </h3>
        {rows.map((r, i) => (
          <motion.div
            className="panel memory-card"
            key={r.reference + i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="similarity">
              <b>{r.similarity}%</b>
              <span>match</span>
            </div>
            <div>
              <div className="memory-meta">
                <Badge tone="purple">{r.source}</Badge>
                <b>{r.reference}</b>
                <span>{r.outcome} outcome</span>
              </div>
              <p>{r.explanation}</p>
              {r.recommendations && (
                <small>
                  Prior recommendation: {r.recommendations[0]}
                </small>
              )}
            </div>
            <ArrowUpRight />
          </motion.div>
        ))}
      </div>
    </>
  );
}
