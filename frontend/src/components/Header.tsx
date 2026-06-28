/* ─────────────────────────────────────────────────────
 * Header — Top navbar with search, theme, notifications
 * ───────────────────────────────────────────────────── */

import {
  Bell,
  ChevronDown,
  Menu,
  Moon,
  Search,
  Sun,
} from 'lucide-react';

interface HeaderProps {
  page: string;
  theme: string;
  setTheme: (t: string) => void;
  open: () => void;
}

export default function Header({ page, theme, setTheme, open }: HeaderProps) {
  const u = JSON.parse(
    localStorage.getItem('ag_user') || '{"name":"Maya Chen","role":"admin"}',
  );

  return (
    <header>
      {/* Mobile hamburger */}
      <button className="mobile-menu" onClick={open}>
        <Menu />
      </button>

      {/* Breadcrumb + page title */}
      <div>
        <div className="breadcrumb">
          AI Governance <span>/</span> {page}
        </div>
        <h2>{page}</h2>
      </div>

      {/* Actions */}
      <div className="header-actions">
        {/* Global search */}
        <div className="global-search">
          <Search />
          <input placeholder="Search audits, people, models…" />
          <kbd>⌘ K</kbd>
        </div>

        {/* Theme toggle */}
        <button
          className="icon-button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
        </button>

        {/* Notifications */}
        <button className="icon-button notification">
          <Bell />
          <i />
        </button>

        {/* Profile */}
        <div className="profile">
          <div>MC</div>
          <span>
            <b>{u.name}</b>
            <small>Chief AI Auditor</small>
          </span>
          <ChevronDown />
        </div>
      </div>
    </header>
  );
}
