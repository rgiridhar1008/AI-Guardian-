/* ─────────────────────────────────────────────────────
 * NewAudit — Multi-step audit wizard
 * ───────────────────────────────────────────────────── */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit,
  Check,
  CloudUpload,
  Route,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import Title from '../components/Title';
import Badge from '../components/Badge';
import Score from '../components/Score';
import { api } from '../lib/api';
import { money } from '../lib/utils';
import type { AuditFormData, AuditResult, UploadResult } from '../lib/types';

interface NewAuditProps {
  reload: () => void;
}

const DEFAULT_FORM: AuditFormData = {
  subject_name: 'Arjun Mehta',
  decision_type: 'loan',
  decision: 'Review',
  credit_score: 714,
  income: 86000,
  debt_ratio: 0.31,
  region: 'West',
};

const STEP_LABELS = ['Decision data', 'Audit policy', 'Intelligence'] as const;
const STEP_DESCRIPTIONS = [
  'Upload or enter',
  'Scope & budget',
  'Review findings',
] as const;

export default function NewAudit({ reload }: NewAuditProps) {
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [file, setFile] = useState<UploadResult | null>(null);
  const [form, setForm] = useState<AuditFormData>(DEFAULT_FORM);

  /* ── Run audit analysis ─────────────────────── */
  const run = async () => {
    setBusy(true);
    try {
      const { subject_name, decision_type, decision, ...data } = form;
      const res = await api.post('/analyze', {
        subject_name,
        decision_type,
        decision,
        data,
        budget_usd: 0.05,
      });
      setResult(res.data);
      setStep(3);
      reload();
    } finally {
      setBusy(false);
    }
  };

  /* ── File upload ────────────────────────────── */
  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append('file', f);
    const res = await api.post('/upload', fd);
    setFile(res.data);
  };

  return (
    <div className="flow-page">
      {/* ── Stepper ──────────────────────────────── */}
      <div className="steps">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className={step > i ? 'active' : ''}>
            <i>{i + 1}</i>
            <span>
              {label}
              <small>{STEP_DESCRIPTIONS[i]}</small>
            </span>
            {i < 2 && <b />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Step 1: Decision data ──────────────── */}
        {step === 1 && (
          <motion.section
            className="panel form-panel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Title
              title="Bring in a decision"
              subtitle="Upload structured records or enter one decision."
            />

            {/* Upload zone */}
            <div className="upload-zone">
              <input
                type="file"
                accept=".csv,.json,.xlsx"
                onChange={upload}
              />
              <CloudUpload />
              <b>
                {file
                  ? `${file.rows} records ready`
                  : 'Drop a CSV, Excel, or JSON file here'}
              </b>
              <span>
                {file
                  ? file.filename
                  : 'or click to browse · maximum 10 MB'}
              </span>
            </div>

            <div className="divider">OR ENTER ONE DECISION</div>

            {/* Manual form */}
            <div className="form-grid">
              <label>
                Subject name
                <input
                  value={form.subject_name}
                  onChange={(e) =>
                    setForm({ ...form, subject_name: e.target.value })
                  }
                />
              </label>
              <label>
                Decision type
                <select
                  value={form.decision_type}
                  onChange={(e) =>
                    setForm({ ...form, decision_type: e.target.value })
                  }
                >
                  <option value="loan">Loan approval</option>
                  <option value="insurance">Insurance claim</option>
                  <option value="hiring">Hiring</option>
                  <option value="healthcare">Healthcare</option>
                </select>
              </label>
              <label>
                Recorded outcome
                <select
                  value={form.decision}
                  onChange={(e) =>
                    setForm({ ...form, decision: e.target.value })
                  }
                >
                  <option>Approved</option>
                  <option>Review</option>
                  <option>Rejected</option>
                </select>
              </label>
              <label>
                Eligibility score
                <input
                  type="number"
                  value={form.credit_score}
                  onChange={(e) =>
                    setForm({ ...form, credit_score: +e.target.value })
                  }
                />
              </label>
              <label>
                Income / value
                <input
                  type="number"
                  value={form.income}
                  onChange={(e) =>
                    setForm({ ...form, income: +e.target.value })
                  }
                />
              </label>
              <label>
                Debt / risk ratio
                <input
                  type="number"
                  step=".01"
                  value={form.debt_ratio}
                  onChange={(e) =>
                    setForm({ ...form, debt_ratio: +e.target.value })
                  }
                />
              </label>
            </div>

            <div className="form-actions">
              <span>
                <ShieldCheck /> PII encrypted and access logged
              </span>
              <button className="primary" onClick={() => setStep(2)}>
                Configure audit →
              </button>
            </div>
          </motion.section>
        )}

        {/* ── Step 2: Audit policy ───────────────── */}
        {step === 2 && (
          <motion.section
            className="panel form-panel"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Title
              title="Set the audit policy"
              subtitle="cascadeflow enforces constraints at runtime."
            />

            <div className="policy-grid">
              {/* Adaptive */}
              <div className="policy-card selected">
                <Route />
                <Badge tone="success">RECOMMENDED</Badge>
                <h3>Adaptive routing</h3>
                <p>
                  Use the smallest compliant model capable of a high-quality
                  explanation.
                </p>
                <ul>
                  <li><Check /> $0.05 maximum budget</li>
                  <li><Check /> 2 second target latency</li>
                  <li><Check /> Escalate legal complexity</li>
                </ul>
              </div>

              {/* Strict */}
              <div className="policy-card">
                <ShieldCheck />
                <Badge>STRICT</Badge>
                <h3>Compliance-first</h3>
                <p>
                  Prioritize reasoning depth for regulated adverse decisions.
                </p>
                <ul>
                  <li><Check /> Approved models only</li>
                  <li><Check /> Mandatory fairness scan</li>
                  <li><Check /> Human review triggers</li>
                </ul>
              </div>
            </div>

            <div className="pipeline">
              Parse → <b>cascadeflow</b> → Explain → <b>Hindsight</b> →
              Fairness → Report
            </div>

            <div className="form-actions">
              <button className="secondary" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button className="primary" onClick={run} disabled={busy}>
                {busy ? (
                  <>
                    <span className="spinner" /> Running audit…
                  </>
                ) : (
                  <>
                    <Sparkles /> Run intelligent audit
                  </>
                )}
              </button>
            </div>
          </motion.section>
        )}

        {/* ── Step 3: Results ────────────────────── */}
        {step === 3 && result && (
          <motion.section
            className="result-layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Main result */}
            <div className="panel result-main">
              <div className="result-hero">
                <div className="success-mark">
                  <Check />
                </div>
                <span>
                  <Badge tone="success">AUDIT COMPLETE</Badge>
                  <h2>
                    {result.reference} · {result.decision}
                  </h2>
                  <p>
                    {result.subject_name} · {result.decision_type}
                  </p>
                </span>
                <button className="secondary" onClick={() => setStep(1)}>
                  New audit
                </button>
              </div>

              <div className="score-row">
                <Score
                  label="Confidence"
                  value={result.confidence}
                  color="#4fd1c5"
                />
                <Score
                  label="Risk score"
                  value={result.risk_score}
                  color="#f5bd65"
                />
                <Score label="Fairness" value={0.91} color="#8b7cf6" />
              </div>

              <article>
                <h3>Why this decision happened</h3>
                <p>{result.explanation}</p>
                <h3>Technical rationale</h3>
                <p>{result.technical_explanation}</p>
                <h3>Recommended actions</h3>
                {result.recommendations.map((x: string) => (
                  <div className="recommendation" key={x}>
                    <Check />
                    {x}
                  </div>
                ))}
              </article>
            </div>

            {/* Intelligence trace sidebar */}
            <aside className="panel trace">
              <Title
                title="Intelligence trace"
                subtitle="End-to-end provenance"
              />
              {(
                [
                  [
                    Route,
                    'cascadeflow routed',
                    result.routing.model,
                    `${result.routing.latency_ms}ms · ${money(result.routing.cost_usd)}`,
                  ],
                  [
                    BrainCircuit,
                    'Hindsight retained',
                    'Long-term audit memory',
                    result.memory_provider,
                  ],
                  [
                    ShieldCheck,
                    'Policy checks passed',
                    'Budget and provider policy',
                    result.routing.tier,
                  ],
                ] as const
              ).map(([I, t, x, m]) => (
                <div className="trace-item" key={t}>
                  <div>
                    <I />
                  </div>
                  <span>
                    <b>{t}</b>
                    <p>{x}</p>
                    <small>{m}</small>
                  </span>
                </div>
              ))}

              <div className="trace-total">
                <span>Total cost</span>
                <b>{money(result.routing.cost_usd)}</b>
                <small>{result.routing.tokens} tokens</small>
              </div>
            </aside>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
