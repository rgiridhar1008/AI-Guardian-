/* ─────────────────────────────────────────────────────
 * DataTable — Reusable data table with recent decisions
 * ───────────────────────────────────────────────────── */

import Badge from './Badge';
import Title from './Title';
import { pct } from '../lib/utils';
import type { Audit } from '../lib/types';

interface DataTableProps {
  rows: Audit[];
}

export default function DataTable({ rows }: DataTableProps) {
  return (
    <section className="panel table-panel">
      <Title
        title="Recent decisions"
        subtitle="Latest organization activity"
      />
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>REFERENCE</th>
              <th>SUBJECT</th>
              <th>DECISION</th>
              <th>RISK</th>
              <th>CONF.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a: Audit) => (
              <tr key={a.id}>
                <td>
                  <b>{a.reference}</b>
                  <small>{a.decision_type}</small>
                </td>
                <td>{a.subject_name}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
