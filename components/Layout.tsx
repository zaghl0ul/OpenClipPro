import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';
import Header from './Header';
import LogoIcon from './icons/LogoIcon';
import DashboardIcon from './icons/DashboardIcon';
import HistoryIcon from './icons/HistoryIcon';
import BillingIcon from './icons/BillingIcon';
import SettingsIcon from './icons/SettingsIcon';
import LogoutIcon from './icons/LogoutIcon';
import UserIcon from './icons/UserIcon';

const colors = {
  sidebar: 'bg-[var(--color-bg-tertiary)]',
  header: 'bg-[var(--color-bg-header)]',
  accent: 'bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)]',
  navActive: 'bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] text-white',
  navInactive: 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-header)] hover:text-[var(--color-accent)]',
};

const NavLink = ({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  // Check if Windows 98 theme is active
  const isWindows98Theme = document.documentElement.getAttribute('data-theme') === 'windows98';
  
  if (isWindows98Theme) {
    return (
      <Link
        to={to}
        className="flex items-center px-3 py-2 text-sm transition-none font-normal"
        style={{
          background: isActive ? '#316ac5' : 'var(--color-bg-secondary)',
          border: isActive ? '1px inset var(--color-border)' : '1px outset var(--color-border)',
          borderRadius: 0,
          color: isActive ? 'var(--color-text-white)' : 'var(--color-text-primary)',
          fontFamily: 'var(--font-system)',
          fontSize: 'var(--font-size-normal)',
          cursor: 'default',
          textDecoration: 'none'
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = '#d4d0c8';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'var(--color-bg-secondary)';
          }
        }}
      >
        <span className="inline-flex items-center justify-center w-4 h-4">{icon}</span>
        <span className="ml-2">{children}</span>
      </Link>
    );
  }
  
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 text-lg rounded-lg transition-colors font-medium ${isActive ? colors.navActive + ' shadow-lg' : colors.navInactive}`}
    >
      <span className="inline-flex items-center justify-center w-6 h-6">{icon}</span>
      <span className="ml-4">{children}</span>
    </Link>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();

  // Check if Windows 98 theme is active
  const isWindows98Theme = document.documentElement.getAttribute('data-theme') === 'windows98';

  // Public layout for non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)]">
        <Header />
        <main>
          <div className="page-transition">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Dashboard layout for authenticated users
  return (
    <div className="flex h-screen text-gray-100 font-sans" style={{
      fontFamily: isWindows98Theme ? 'var(--font-system)' : undefined,
      fontSize: isWindows98Theme ? 'var(--font-size-normal)' : undefined
    }}>
      {/* Sidebar (desktop) */}
      <aside className={`hidden lg:flex flex-col justify-between w-64 p-6 border-r border-[var(--color-border)] shadow-2xl ${colors.sidebar}`} style={{
        background: isWindows98Theme ? 'var(--color-bg-secondary)' : undefined,
        border: isWindows98Theme ? '2px outset var(--color-border)' : undefined,
        borderRadius: isWindows98Theme ? '0' : undefined,
        boxShadow: isWindows98Theme ? 'none' : undefined,
        fontFamily: isWindows98Theme ? 'var(--font-system)' : undefined,
        fontSize: isWindows98Theme ? 'var(--font-size-normal)' : undefined
      }}>
        <div>
          <div className="flex items-center mb-12" style={{
            background: isWindows98Theme ? 'var(--color-bg-secondary)' : undefined,
            padding: isWindows98Theme ? '8px' : undefined,
            border: isWindows98Theme ? '2px outset var(--color-border)' : undefined,
            borderRadius: isWindows98Theme ? '0' : undefined
          }}>
            {isWindows98Theme ? (
              <>
                <span className="text-lg">💻</span>
                <span className="font-bold ml-3 tracking-wide" style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: 'var(--font-size-large)',
                  color: 'var(--color-text-primary)'
                }}>
                  OpenClip Pro v1.0
                </span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center justify-center w-10 h-10">
                  <LogoIcon className="w-10 h-10 text-blue-400" />
                </span>
                <span className="text-xl font-bold ml-3 tracking-wide">OpenClip Pro</span>
              </>
            )}
          </div>
          <nav className="space-y-2 mt-8">
            <NavLink to="/dashboard" icon={<DashboardIcon className="w-6 h-6" />}>Dashboard</NavLink>
            <NavLink to="/history" icon={<HistoryIcon className="w-6 h-6" />}>History</NavLink>
            <NavLink to="/pricing" icon={<BillingIcon className="w-6 h-6" />}>Pricing</NavLink>
            <NavLink to="/settings" icon={<SettingsIcon className="w-6 h-6" />}>Settings</NavLink>
          </nav>
        </div>
        <div className="space-y-2">
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-3 text-lg rounded-lg text-gray-300 hover:bg-blue-700 hover:text-white transition-colors"
            style={isWindows98Theme ? {
              background: 'var(--color-bg-secondary)',
              border: '1px outset var(--color-border)',
              borderRadius: 0,
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-normal)',
              fontFamily: 'var(--font-system)',
              cursor: 'default',
              transition: 'none'
            } : undefined}
            onMouseEnter={isWindows98Theme ? (e) => {
              e.currentTarget.style.background = '#d4d0c8';
            } : undefined}
            onMouseLeave={isWindows98Theme ? (e) => {
              e.currentTarget.style.background = 'var(--color-bg-secondary)';
            } : undefined}
          >
            <span className="inline-flex items-center justify-center w-6 h-6">
              <LogoutIcon className="w-6 h-6" />
            </span>
            <span className="ml-4">{isWindows98Theme ? '🚪 Exit' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--color-bg-secondary)]">
        {/* Header */}
        <header className={`flex justify-between items-center px-4 py-3 border-b border-[var(--color-border)] shadow-md ${colors.header} lg:justify-end`}>
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right">
              <p className="font-semibold text-white text-sm">{user?.email}</p>
              <p className="text-xs text-blue-300 font-bold">{user?.credits} Credits</p>
            </div>
            <span className="inline-flex items-center justify-center w-8 h-8 p-2 bg-[var(--color-bg-header)] rounded-full">
              <UserIcon className="w-6 h-6 text-[var(--color-text-secondary)]" />
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
          <div className="page-transition">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 flex justify-around py-2 border-t border-[var(--color-border)] shadow-2xl z-50 ${colors.header}`}>
        <NavLink to="/dashboard" icon={<DashboardIcon className="w-5 h-5" />}>Dashboard</NavLink>
        <NavLink to="/history" icon={<HistoryIcon className="w-5 h-5" />}>History</NavLink>
        <NavLink to="/pricing" icon={<BillingIcon className="w-5 h-5" />}>Pricing</NavLink>
        <NavLink to="/settings" icon={<SettingsIcon className="w-5 h-5" />}>Settings</NavLink>
      </nav>
    </div>
  );
};

export default Layout;