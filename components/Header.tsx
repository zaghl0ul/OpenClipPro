import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LogoIcon from './icons/LogoIcon';
import UserIcon from './icons/UserIcon';
import DashboardIcon from './icons/DashboardIcon';
import HistoryIcon from './icons/HistoryIcon';
import SettingsIcon from './icons/SettingsIcon';
import BillingIcon from './icons/BillingIcon';
import LogoutIcon from './icons/LogoutIcon';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass gradient-border-bottom">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <LogoIcon className="w-8 h-8 text-primary-400 animate-pulse-glow" />
            <span className="text-xl font-bold">
              <span className="holographic">OpenClip</span> <span className="neon-text">Pro</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {!user ? (
              <>
                <Link 
                  to="/" 
                  className={`text-sm font-medium transition-colors hover:text-primary-400 ${
                    isActive('/') ? 'text-primary-400' : 'text-gray-300'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/about" 
                  className={`text-sm font-medium transition-colors hover:text-primary-400 ${
                    isActive('/about') ? 'text-primary-400' : 'text-gray-300'
                  }`}
                >
                  About
                </Link>
                <Link 
                  to="/pricing" 
                  className={`text-sm font-medium transition-colors hover:text-primary-400 ${
                    isActive('/pricing') ? 'text-primary-400' : 'text-gray-300'
                  }`}
                >
                  Pricing
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/dashboard" 
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary-400 ${
                    isActive('/dashboard') ? 'text-primary-400' : 'text-gray-300'
                  }`}
                >
                  <DashboardIcon className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link 
                  to="/history" 
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary-400 ${
                    isActive('/history') ? 'text-primary-400' : 'text-gray-300'
                  }`}
                >
                  <HistoryIcon className="w-4 h-4" />
                  History
                </Link>
                <Link 
                  to="/pricing" 
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary-400 ${
                    isActive('/pricing') ? 'text-primary-400' : 'text-gray-300'
                  }`}
                >
                  <BillingIcon className="w-4 h-4" />
                  Credits
                </Link>
                <Link 
                  to="/settings" 
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary-400 ${
                    isActive('/settings') ? 'text-primary-400' : 'text-gray-300'
                  }`}
                >
                  <SettingsIcon className="w-4 h-4" />
                  Settings
                </Link>
              </>
            )}
          </nav>

          {/* User menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{user.email}</span>
                  <span className="px-2 py-1 bg-primary-600 text-white text-xs rounded-full">
                    {user.credits} credits
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white glass-dark rounded-lg transition-all hover:bg-gray-700"
                >
                  <LogoutIcon className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/"
                  className="px-4 py-2 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/"
                  className="px-4 py-2 bg-gradient-to-r from-primary-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-primary-700 hover:to-blue-700 transition-all hover-lift"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
