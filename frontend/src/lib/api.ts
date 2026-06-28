/* ─────────────────────────────────────────────────────
 * AI Guardian — API client (Axios)
 * ───────────────────────────────────────────────────── */

import axios from 'axios';
import type {
  AuthResponse,
  AuditResult,
  Dash,
  Audit,
  RoutingEntry,
  MemoryResult,
  FairnessReport,
  DriftReport,
  UploadResult,
} from './types';

/** Configured Axios instance — base URL comes from env or falls back to localhost */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

/* ── Auth interceptor ─────────────────────────────── */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ag_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ── Typed API helpers ────────────────────────────── */

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/login', { email, password });
  return data;
}

export async function register(
  email: string,
  full_name: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/register', {
    email,
    full_name,
    password,
  });
  return data;
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/forgot-password', { email });
}

export async function fetchDashboard(): Promise<Dash> {
  const { data } = await api.get<Dash>('/dashboard');
  return data;
}

export async function fetchHistory(): Promise<Audit[]> {
  const { data } = await api.get<Audit[]>('/history');
  return data;
}

export async function fetchRouting(): Promise<RoutingEntry[]> {
  const { data } = await api.get<RoutingEntry[]>('/routing');
  return data;
}

export async function analyzeAudit(payload: {
  subject_name: string;
  decision_type: string;
  decision: string;
  data: Record<string, unknown>;
  budget_usd: number;
}): Promise<AuditResult> {
  const { data } = await api.post<AuditResult>('/analyze', payload);
  return data;
}

export async function uploadFile(file: File): Promise<UploadResult> {
  const fd = new FormData();
  fd.append('file', file);
  const { data } = await api.post<UploadResult>('/upload', fd);
  return data;
}

export async function searchMemory(
  query: string,
  limit: number = 5,
): Promise<{ results: MemoryResult[] }> {
  const { data } = await api.post<{ results: MemoryResult[] }>('/similar', {
    query,
    limit,
  });
  return data;
}

export async function runBiasReport(
  audit_id: number,
  protected_attributes: string[],
): Promise<FairnessReport> {
  const { data } = await api.post<FairnessReport>('/bias', {
    audit_id,
    protected_attributes,
  });
  return data;
}

export async function runDriftReport(
  versions: { version: string; approval_rate: number }[],
): Promise<DriftReport> {
  const { data } = await api.post<DriftReport>('/drift', { versions });
  return data;
}

export async function downloadReport(audit_id: number): Promise<Blob> {
  const { data } = await api.post('/report', { audit_id }, { responseType: 'blob' });
  return data as Blob;
}

export default api;
