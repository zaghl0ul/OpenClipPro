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
  sidebar: 'bg-[#1a1333]', // dark purple
  header: 'bg-[#23243a]', // fuscous grey
  accent: 'bg-gradient-to-r from-[#3a2e7b] to-[#1e3a8a]', // purple to blue
  navActive: 'bg-gradient-to-r from-[#3a2e7b] to-[#1e3a8a] text-white',
  navInactive: 'text-gray-300 hover:bg-[#23243a] hover:text-blue-300',
};

const NavLink = ({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
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

  // Public layout for non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <main>
          {children}
        </main>
      </div>
    );
  }

  // Dashboard layout for authenticated users
  return (
    <div className="flex h-screen text-gray-100 font-sans">
      {/* Sidebar (desktop) */}
      <aside className={`hidden lg:flex flex-col justify-between w-64 p-6 border-r border-[#23243a] shadow-2xl ${colors.sidebar}`}>
        <div>
          <div className="flex items-center mb-12">
            <span className="inline-flex items-center justify-center w-10 h-10">
              <LogoIcon className="w-10 h-10 text-blue-400" />
            </span>
            <span className="text-xl font-bold ml-3 tracking-wide">OpenClip Pro</span>
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
          >
            <span className="inline-flex items-center justify-center w-6 h-6">
              <LogoutIcon className="w-6 h-6" />
            </span>
            <span className="ml-4">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#18192a]">
        {/* Header */}
        <header className={`flex justify-between items-center px-4 py-3 border-b border-[#23243a] shadow-md ${colors.header} lg:justify-end`}>
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right">
              <p className="font-semibold text-white text-sm">{user?.email}</p>
              <p className="text-xs text-blue-300 font-bold">{user?.credits} Credits</p>
            </div>
            <span className="inline-flex items-center justify-center w-8 h-8 p-2 bg-[#23243a] rounded-full">
              <UserIcon className="w-6 h-6 text-gray-300" />
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 flex justify-around py-2 border-t border-[#23243a] shadow-2xl z-50 ${colors.header}`}>
        <NavLink to="/dashboard" icon={<DashboardIcon className="w-5 h-5" />}>Dashboard</NavLink>
        <NavLink to="/history" icon={<HistoryIcon className="w-5 h-5" />}>History</NavLink>
        <NavLink to="/pricing" icon={<BillingIcon className="w-5 h-5" />}>Pricing</NavLink>
        <NavLink to="/settings" icon={<SettingsIcon className="w-5 h-5" />}>Settings</NavLink>
      </nav>
    </div>
  );
};

export default Layout;