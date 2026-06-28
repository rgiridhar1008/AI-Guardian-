/* ─────────────────────────────────────────────────────
 * AI Guardian — Custom hooks
 * ───────────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from 'react';
import { fetchDashboard, fetchHistory, fetchRouting } from './api';
import type { Dash, Audit, RoutingEntry } from './types';

/* ── Constants ────────────────────────────────────── */

const EMPTY_DASH: Dash = {
  stats: {},
  trends: { labels: [], approvals: [], cost: [], latency: [] },
  model_usage: {},
  recent: [],
  routing: [],
};

/* ── useAuth ──────────────────────────────────────── */

export function useAuth() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('ag_token'));

  const signIn = useCallback(() => setAuthed(true), []);

  const signOut = useCallback(() => {
    localStorage.clear();
    location.reload();
  }, []);

  return { authed, signIn, signOut };
}

/* ── useTheme ─────────────────────────────────────── */

export function useTheme() {
  const [theme, setTheme] = useState(
    localStorage.getItem('ag_theme') || 'dark',
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('ag_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, setTheme, toggleTheme };
}

/* ── useDashboard ─────────────────────────────────── */

export function useDashboard(authed: boolean) {
  const [d, setD] = useState<Dash>(EMPTY_DASH);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [routes, setRoutes] = useState<RoutingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, histRes, routeRes] = await Promise.all([
        fetchDashboard(),
        fetchHistory(),
        fetchRouting(),
      ]);
      setD(dashRes);
      setAudits(histRes);
      setRoutes(routeRes);
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } };
      if (err.response?.status === 401) {
        localStorage.removeItem('ag_token');
        location.reload();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  return { d, audits, routes, loading, reload: load };
}
