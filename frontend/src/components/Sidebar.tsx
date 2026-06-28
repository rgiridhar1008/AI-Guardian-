/* ─────────────────────────────────────────────────────
 * Sidebar — Collapsible navigation with workspace info
 * ───────────────────────────────────────────────────── */

import {
  Activity,
  BrainCircuit,
  ChevronDown,
  FileCheck2,
  GitCompareArrows,
  History,
  LayoutDashboard,
  PanelLeftClose,
  Route,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import Logo from './Logo';
import type { PageId } from '../lib/types';

/* ── Navigation definition ────────────────────────── */

export const nav = [
  ['Overview', LayoutDashboard, 'dashboard'],
  ['New audit', Sparkles, 'new'],
  ['Audit history', History, 'history'],
  ['Memory search', BrainCircuit, 'memory'],
  ['Fairness lab', ShieldCheck, 'fairness'],
  ['Model drift', GitCompareArrows, 'drift'],
  ['Runtime routing', Route, 'routing'],
  ['Analytics', Activity, 'analytics'],
  ['Reports', FileCheck2, 'reports'],
  ['Settings', Settings, 'settings'],
] as const;

/* ── Props ────────────────────────────────────────── */

interface SidebarProps {
  active: PageId;
  setActive: (id: PageId) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobile: boolean;
  setMobile: (v: boolean) => void;
}

/* ── Component ────────────────────────────────────── */

export default function Sidebar({
  active,
  setActive,
  collapsed,
  setCollapsed,
  mobile,
  setMobile,
}: SidebarProps) {
  return (
    <aside className={`${collapsed ? 'collapsed' : ''} ${mobile ? 'mobile-open' : ''}`}>
      {/* ── Brand ──────────────────────────────── */}
      <div className="side-brand">
        <Logo />
        <b>AI Guardian</b>
        <button onClick={() => setCollapsed(!collapsed)}>
          <PanelLeftClose />
        </button>
        <button className="close-nav" onClick={() => setMobile(false)}>
          <X />
        </button>
      </div>

      {/* ── Workspace selector ─────────────────── */}
      <div className="workspace">
        <div>NX</div>
        <span>
          <b>Nexus Financial</b>
          <small>Enterprise workspace</small>
        </span>
        <ChevronDown />
      </div>

      {/* ── Navigation links ───────────────────── */}
      <nav>
        {nav.map(([label, Icon, id], i) => (
          <div key={id}>
            {[0, 3, 7].includes(i) && (
              <small>
                {i === 0
                  ? 'CONTROL CENTER'
                  : i === 3
                    ? 'INTELLIGENCE'
                    : 'OPERATIONS'}
              </small>
            )}
            <button
              className={active === id ? 'active' : ''}
              onClick={() => {
                setActive(id as PageId);
                setMobile(false);
              }}
            >
              <Icon />
              <span>{label}</span>
              {id === 'fairness' && <em>2</em>}
            </button>
          </div>
        ))}
      </nav>

      {/* ── Footer ─────────────────────────────── */}
      <div className="side-foot">
        <div className="system">
          <span />
          <div>
            <b>All systems operational</b>
            <small>Hindsight + cascadeflow</small>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.clear();
            location.reload();
          }}
        >
          <Users />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
