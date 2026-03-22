import { Link, NavLink } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

const userLinks = [
  { to: '/', label: 'Agents' },
  { to: '/notifications', label: 'Notification Agent' },
];

const adminLinks = [
  { to: '/admin', label: 'Admin Panel' },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const links = user?.is_admin ? [...userLinks, ...adminLinks] : userLinks;

  return (
    <aside className="flex h-screen w-72 flex-col bg-slate-950 px-5 py-6 text-slate-100">
      <Link to="/" className="mb-8 text-xl font-semibold">
        AI Agent Platform
      </Link>
      <nav className="flex-1 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-900'}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-800 pt-4 text-sm text-slate-400">
        <p className="font-medium text-slate-200">{user?.full_name}</p>
        <p className="mb-4">{user?.email}</p>
        <button onClick={logout} className="rounded-lg border border-slate-700 px-3 py-2 hover:bg-slate-800">
          Logout
        </button>
      </div>
    </aside>
  );
}
