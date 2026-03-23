import { Outlet, NavLink } from 'react-router-dom';
import { useAuth, isAdmin } from '../hooks/useAuth';

// TODO: update service display name and icon
const SERVICE_DISPLAY_NAME = 'My Service';
const SERVICE_ICON = '🔧';

export default function Layout() {
  const user = useAuth()!;

  return (
    <div className="shell">
      <header className="shell-header">
        <span className="shell-brand">{SERVICE_ICON} {SERVICE_DISPLAY_NAME}</span>
        <div className="shell-user">
          <span className="shell-user-name">{user.displayName}</span>
          <span className="shell-user-role">{user.role}</span>
          <a href="/dashboard" className="back-link">← Dashboard</a>
        </div>
      </header>

      <div className="shell-body">
        <nav className="sidebar">
          {/* TODO: add sidebar links for your pages */}
          <NavLink
            to="/"
            end
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-icon">🏠</span> Home
          </NavLink>

          {isAdmin(user.role) && (
            <NavLink
              to="/users"
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <span className="sidebar-icon">👤</span> Users
            </NavLink>
          )}
        </nav>

        <main className="shell-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
