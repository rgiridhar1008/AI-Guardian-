/* ─────────────────────────────────────────────────────
 * Auth — Login / Signup / Forgot-password split-screen
 * ───────────────────────────────────────────────────── */

import { useState } from 'react';
import { AlertTriangle, Fingerprint, ShieldCheck, Zap } from 'lucide-react';
import Logo from '../components/Logo';
import { api } from '../lib/api';

interface AuthProps {
  done: () => void;
}

export default function Auth({ done }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  /* ── Form submit ──────────────────────────────── */
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const f = new FormData(e.currentTarget);

    try {
      if (mode === 'forgot') {
        await api.post('/forgot-password', { email: f.get('email') });
        setMode('login');
        return;
      }

      const url = mode === 'signup' ? '/register' : '/login';
      const payload =
        mode === 'signup'
          ? {
              email: f.get('email'),
              full_name: f.get('name'),
              password: f.get('password'),
            }
          : { email: f.get('email'), password: f.get('password') };

      const { data } = await api.post(url, payload);
      localStorage.setItem('ag_token', data.access_token);
      localStorage.setItem('ag_user', JSON.stringify(data.user));
      done();
    } catch (x: unknown) {
      const err = x as { response?: { data?: { detail?: string } } };
      setError(err.response?.data?.detail || 'Unable to connect to AI Guardian');
    } finally {
      setBusy(false);
    }
  };

  /* ── Demo login ───────────────────────────────── */
  const demo = async () => {
    setBusy(true);
    try {
      const { data } = await api.post('/login', {
        email: 'auditor@aiguardian.dev',
        password: 'Guardian123!',
      });
      localStorage.setItem('ag_token', data.access_token);
      localStorage.setItem('ag_user', JSON.stringify(data.user));
      done();
    } catch {
      setError('Start the API server to enter the demo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* ── Left art panel ───────────────────────── */}
      <div className="auth-art">
        <div className="brand">
          <Logo /> AI Guardian
        </div>

        <div className="auth-copy">
          <div className="eyebrow">
            <span /> GOVERNANCE, WITHOUT THE GUESSWORK
          </div>
          <h1>
            Every AI decision
            <br />
            <em>accountable.</em>
          </h1>
          <p>
            One control plane for explainability, fairness, model routing, and
            institutional memory.
          </p>
          <div className="proof-grid">
            <div>
              <strong>100%</strong>
              <span>Traceable decisions</span>
            </div>
            <div>
              <strong>38%</strong>
              <span>Inference cost saved</span>
            </div>
            <div>
              <strong>&lt; 1ms</strong>
              <span>Routing overhead</span>
            </div>
          </div>
        </div>

        {/* Orbit decoration */}
        <div className="auth-orbit">
          <div className="orbit-core">
            <Fingerprint />
          </div>
          <span />
          <span />
          <span />
        </div>

        <div className="trusted">
          BUILT FOR HIGH-STAKES AI · FINANCE · HEALTHCARE · INSURANCE
        </div>
      </div>

      {/* ── Right form panel ─────────────────────── */}
      <div className="auth-panel">
        <form className="auth-card" onSubmit={submit}>
          <span className="secure-pill">
            <ShieldCheck /> Enterprise secure
          </span>

          <h2>
            {mode === 'signup'
              ? 'Create your workspace'
              : mode === 'forgot'
                ? 'Reset access'
                : 'Welcome back'}
          </h2>

          <p>
            {mode === 'login'
              ? 'Sign in to your governance command center.'
              : 'Responsible AI starts here.'}
          </p>

          {mode === 'signup' && (
            <label>
              Full name
              <input name="name" required />
            </label>
          )}

          <label>
            Work email
            <input
              name="email"
              type="email"
              required
              defaultValue={mode === 'login' ? 'auditor@aiguardian.dev' : ''}
            />
          </label>

          {mode !== 'forgot' && (
            <label>
              Password
              <input
                name="password"
                type="password"
                required
                defaultValue={mode === 'login' ? 'Guardian123!' : ''}
              />
            </label>
          )}

          {error && (
            <div className="form-error">
              <AlertTriangle />
              {error}
            </div>
          )}

          <button className="primary wide" disabled={busy}>
            {busy ? (
              <span className="spinner" />
            ) : mode === 'login' ? (
              'Sign in securely'
            ) : mode === 'signup' ? (
              'Create workspace'
            ) : (
              'Send reset link'
            )}
          </button>

          {mode === 'login' && (
            <>
              <button type="button" className="demo-button" onClick={demo}>
                <Zap /> Enter live demo
              </button>
              <div className="auth-links">
                <button type="button" onClick={() => setMode('signup')}>
                  Create account
                </button>
                <button type="button" onClick={() => setMode('forgot')}>
                  Forgot password?
                </button>
              </div>
            </>
          )}

          {mode !== 'login' && (
            <button
              type="button"
              className="text-button"
              onClick={() => setMode('login')}
            >
              ← Back to sign in
            </button>
          )}

          <div className="security-note">
            <ShieldCheck /> SSO-ready · AES-256 at rest · Audit logged
          </div>
        </form>
      </div>
    </div>
  );
}
