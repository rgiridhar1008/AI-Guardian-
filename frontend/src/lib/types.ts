/* ─────────────────────────────────────────────────────
 * AI Guardian — Shared TypeScript types
 * ───────────────────────────────────────────────────── */

/** A single audited decision record */
export interface Audit {
  id: number;
  reference: string;
  subject_name: string;
  decision_type: string;
  decision: string;
  explanation: string;
  technical_explanation: string;
  recommendations: string[];
  confidence: number;
  risk_score: number;
  status: string;
  created_at: string;
}

/** Trend data returned by the dashboard endpoint */
export interface TrendData {
  labels: string[];
  approvals: number[];
  cost: number[];
  latency: number[];
}

/** Routing entry from cascadeflow */
export interface RoutingEntry {
  id: number;
  model: string;
  provider: string;
  complexity: 'small' | 'medium' | 'large';
  reason: string;
  tokens: number;
  latency_ms: number;
  cost_usd: number;
  tier: string;
}

/** Full dashboard payload */
export interface Dash {
  stats: Record<string, number>;
  trends: TrendData;
  model_usage: Record<string, number>;
  recent: Audit[];
  routing: RoutingEntry[];
}

/** Auth response from /login or /register */
export interface AuthResponse {
  access_token: string;
  user: {
    name: string;
    role: string;
    email: string;
  };
}

/** Memory search result row */
export interface MemoryResult {
  reference: string;
  similarity: number;
  source: string;
  outcome: string;
  explanation: string;
  recommendations: string[] | null;
}

/** Audit analysis result after running an audit */
export interface AuditResult {
  reference: string;
  decision: string;
  subject_name: string;
  decision_type: string;
  explanation: string;
  technical_explanation: string;
  confidence: number;
  risk_score: number;
  recommendations: string[];
  memory_provider: string;
  routing: {
    model: string;
    latency_ms: number;
    cost_usd: number;
    tokens: number;
    tier: string;
  };
}

/** Bias/Fairness finding from /bias endpoint */
export interface FairnessFinding {
  attribute: string;
  score: number;
  severity: 'low' | 'medium' | 'high';
}

/** Fairness report returned by /bias endpoint */
export interface FairnessReport {
  fairness_score: number;
  findings: FairnessFinding[];
}

/** Drift version entry */
export interface DriftVersion {
  version: string;
  approval_rate: number;
}

/** Drift report returned by /drift endpoint */
export interface DriftReport {
  max_drift: number;
  recommendation: string;
  versions: DriftVersion[];
}

/** Upload response from /upload endpoint */
export interface UploadResult {
  rows: number;
  filename: string;
}

/** New audit form data */
export interface AuditFormData {
  subject_name: string;
  decision_type: string;
  decision: string;
  credit_score: number;
  income: number;
  debt_ratio: number;
  region: string;
}

/** Navigation item definition */
export type NavItem = readonly [
  label: string,
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>,
  id: string,
];

/** Active page identifiers */
export type PageId =
  | 'dashboard'
  | 'new'
  | 'history'
  | 'memory'
  | 'fairness'
  | 'drift'
  | 'routing'
  | 'analytics'
  | 'reports'
  | 'settings';
