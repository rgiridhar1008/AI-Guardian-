/* ─────────────────────────────────────────────────────
 * History — Searchable audit register with PDF export
 * ───────────────────────────────────────────────────── */

import { useState } from 'react';
import { Download, Search } from 'lucide-react';

import Title from '../components/Title';
import Badge from '../components/Badge';
import { api } from '../lib/api';
import { pct, fmtDate } from '../lib/utils';
import type { Audit } from '../lib/types';

interface HistoryProps {
  audits: Audit[];
}

export default function History({ audits }: HistoryProps) {
  const [q, setQ] = useState('');

  const rows = audits.filter((a) =>
    JSON.stringify(a).toLowerCase().includes(q.toLowerCase()),
  );

  /* ── PDF download ───────────────────────────── */
  const pdf = async (a: Audit) => {
    const r = await api.post('/report', { audit_id: a.id }, { responseType: 'blob' });
    const u = URL.createObjectURL(r.data as Blob);
    const x = document.createElement('a');
    x.href = u;
    x.download = `${a.reference}-report.pdf`;
    x.click();
  };

  return (
    <section className="panel full-table">
      <Title
        title="Decision audit register"
        subtitle="Immutable record of every analyzed outcome"
      >
        <div className="table-search">
          <Search />
          <input
            placeholder="Search register…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </Title>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>REFERENCE</th>
              <th>SUBJECT</th>
              <th>DOMAIN</th>
              <th>OUTCOME</th>
              <th>RISK</th>
              <th>CONFIDENCE</th>
              <th>CREATED</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((a: Audit) => (
              <tr key={a.id}>
                <td>
                  <b>{a.reference}</b>
                </td>
                <td>{a.subject_name}</td>
                <td>{a.decision_type}</td>
                <td>
                  <Badge
                    tone={
                      a.decision === 'Approved'
                        ? 'success'
                        : a.decision === 'Rejected'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {a.decision}
                  </Badge>
                </td>
                <td>{pct(a.risk_score)}</td>
                <td>{pct(a.confidence)}</td>
                <td>{fmtDate(a.created_at)}</td>
                <td>
                  <button className="icon-button" onClick={() => pdf(a)}>
                    <Download />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        Showing {rows.length} verified records{' '}
        <span>Page 1 of 1</span>
      </div>
    </section>
  );
}
