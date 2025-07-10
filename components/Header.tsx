import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check if Windows 98 theme is active
  const isWindows98Theme = document.documentElement.getAttribute('data-theme') === 'windows98';

  return (
    <header className={`sticky top-0 z-50 ${isWindows98Theme ? 'bg-[var(--color-bg-secondary)] border-b-2 border-[var(--color-border)]' : 'glass gradient-border-bottom'}`} style={{
      borderStyle: isWindows98Theme ? 'outset' : undefined,
      fontFamily: isWindows98Theme ? '"MS Sans Serif", "Microsoft Sans Serif", sans-serif' : undefined,
      fontSize: isWindows98Theme ? '12px' : undefined,
      background: isWindows98Theme ? 'var(--color-bg-secondary)' : undefined,
      boxShadow: isWindows98Theme ? 'none' : undefined,
      borderRadius: isWindows98Theme ? '0' : undefined
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className={`flex items-center gap-3 ${isWindows98Theme ? 'start-button' : 'transition-opacity hover:opacity-80'}`} style={{
            padding: isWindows98Theme ? '6px 12px' : undefined,
            borderRadius: isWindows98Theme ? '0' : undefined,
            background: isWindows98Theme ? 'var(--color-bg-secondary)' : undefined,
            border: isWindows98Theme ? '2px outset var(--color-border)' : undefined,
            textDecoration: 'none',
            fontFamily: isWindows98Theme ? 'var(--font-system)' : undefined,
            fontSize: isWindows98Theme ? 'var(--font-size-normal)' : undefined,
            fontWeight: isWindows98Theme ? 'bold' : undefined,
            cursor: isWindows98Theme ? 'default' : undefined
          }}>
            {isWindows98Theme ? (
              <>
                <span className="text-lg">🏁</span>
                <span className="font-bold" style={{
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-system)',
                  fontSize: 'var(--font-size-normal)'
                }}>
                  OpenClip Pro v1.0
                </span>
              </>
            ) : (
              <>
                <LogoIcon className="w-8 h-8 text-primary-400 animate-pulse-glow" />
                <span className="text-xl font-bold">
                  <span className="holographic">OpenClip</span> <span className="neon-text">Pro</span>
                </span>
              </>
            )}
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {!user ? (
              <>
                <Link 
                  to="/" 
                  className={`text-sm font-medium ${isWindows98Theme ? '' : 'transition-colors'}`}
                  style={isWindows98Theme ? {
                    background: isActive('/') ? '#316ac5' : 'var(--color-bg-secondary)',
                    border: isActive('/') ? '1px inset var(--color-border)' : '1px outset var(--color-border)',
                    borderRadius: 0,
                    color: isActive('/') ? 'var(--color-text-white)' : 'var(--color-text-primary)',
                    padding: '4px 8px',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-system)',
                    fontSize: 'var(--font-size-normal)',
                    cursor: 'default'
                  } : {
                    color: isActive('/') ? '#d946ef' : '#d1d5db'
                  }}
                >
                  {isWindows98Theme ? '🏠 ' : ''}Home
                </Link>
                <Link 
                  to="/about" 
                  className={`text-sm font-medium ${isWindows98Theme ? '' : 'transition-colors'}`}
                  style={isWindows98Theme ? {
                    background: isActive('/about') ? '#316ac5' : 'var(--color-bg-secondary)',
                    border: isActive('/about') ? '1px inset var(--color-border)' : '1px outset var(--color-border)',
                    borderRadius: 0,
                    color: isActive('/about') ? 'var(--color-text-white)' : 'var(--color-text-primary)',
                    padding: '4px 8px',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-system)',
                    fontSize: 'var(--font-size-normal)',
                    cursor: 'default'
                  } : {
                    color: isActive('/about') ? '#d946ef' : '#d1d5db'
                  }}
                >
                  {isWindows98Theme ? 'ℹ️ ' : ''}About
                </Link>
                <Link 
                  to="/pricing" 
                  className={`text-sm font-medium ${isWindows98Theme ? '' : 'transition-colors'}`}
                  style={isWindows98Theme ? {
                    background: isActive('/pricing') ? '#316ac5' : 'var(--color-bg-secondary)',
                    border: isActive('/pricing') ? '1px inset var(--color-border)' : '1px outset var(--color-border)',
                    borderRadius: 0,
                    color: isActive('/pricing') ? 'var(--color-text-white)' : 'var(--color-text-primary)',
                    padding: '4px 8px',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-system)',
                    fontSize: 'var(--font-size-normal)',
                    cursor: 'default'
                  } : {
                    color: isActive('/pricing') ? '#d946ef' : '#d1d5db'
                  }}
                >
                  {isWindows98Theme ? '💰 ' : ''}Pricing
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/dashboard" 
                  className={`flex items-center gap-2 text-sm font-medium ${isWindows98Theme ? '' : 'transition-colors'}`}
                  style={isWindows98Theme ? {
                    background: isActive('/dashboard') ? '#316ac5' : 'var(--color-bg-secondary)',
                    border: isActive('/dashboard') ? '1px inset var(--color-border)' : '1px outset var(--color-border)',
                    borderRadius: 0,
                    color: isActive('/dashboard') ? 'var(--color-text-white)' : 'var(--color-text-primary)',
                    padding: '4px 8px',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-system)',
                    fontSize: 'var(--font-size-normal)',
                    cursor: 'default'
                  } : {
                    color: isActive('/dashboard') ? '#d946ef' : '#d1d5db'
                  }}
                >
                  {isWindows98Theme ? '📊' : <DashboardIcon className="w-4 h-4" />}
                  <span className="ml-1">Dashboard</span>
                </Link>
                <Link 
                  to="/history" 
                  className={`flex items-center gap-2 text-sm font-medium ${isWindows98Theme ? '' : 'transition-colors'}`}
                  style={isWindows98Theme ? {
                    background: isActive('/history') ? '#316ac5' : 'var(--color-bg-secondary)',
                    border: isActive('/history') ? '1px inset var(--color-border)' : '1px outset var(--color-border)',
                    borderRadius: 0,
                    color: isActive('/history') ? 'var(--color-text-white)' : 'var(--color-text-primary)',
                    padding: '4px 8px',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-system)',
                    fontSize: 'var(--font-size-normal)',
                    cursor: 'default'
                  } : {
                    color: isActive('/history') ? '#d946ef' : '#d1d5db'
                  }}
                >
                  {isWindows98Theme ? '📁' : <HistoryIcon className="w-4 h-4" />}
                  <span className="ml-1">History</span>
                </Link>
                <Link 
                  to="/pricing" 
                  className={`flex items-center gap-2 text-sm font-medium ${isWindows98Theme ? '' : 'transition-colors'}`}
                  style={isWindows98Theme ? {
                    background: isActive('/pricing') ? '#316ac5' : 'var(--color-bg-secondary)',
                    border: isActive('/pricing') ? '1px inset var(--color-border)' : '1px outset var(--color-border)',
                    borderRadius: 0,
                    color: isActive('/pricing') ? 'var(--color-text-white)' : 'var(--color-text-primary)',
                    padding: '4px 8px',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-system)',
                    fontSize: 'var(--font-size-normal)',
                    cursor: 'default'
                  } : {
                    color: isActive('/pricing') ? '#d946ef' : '#d1d5db'
                  }}
                >
                  {isWindows98Theme ? '💳' : <BillingIcon className="w-4 h-4" />}
                  <span className="ml-1">Credits</span>
                </Link>
                
                <Link 
                  to="/settings" 
                  className={`flex items-center gap-2 text-sm font-medium ${isWindows98Theme ? '' : 'transition-colors'}`}
                  style={isWindows98Theme ? {
                    background: isActive('/settings') ? '#316ac5' : 'var(--color-bg-secondary)',
                    border: isActive('/settings') ? '1px inset var(--color-border)' : '1px outset var(--color-border)',
                    borderRadius: 0,
                    color: isActive('/settings') ? 'var(--color-text-white)' : 'var(--color-text-primary)',
                    padding: '4px 8px',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-system)',
                    fontSize: 'var(--font-size-normal)',
                    cursor: 'default'
                  } : {
                    color: isActive('/settings') ? '#d946ef' : '#d1d5db'
                  }}
                >
                  {isWindows98Theme ? '⚙️' : <SettingsIcon className="w-4 h-4" />}
                  <span className="ml-1">Settings</span>
                </Link>
              </>
            )}
          </nav>

          {/* User menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 text-sm ${isWindows98Theme ? 'bg-[var(--color-bg-tertiary)] p-2 border border-[var(--color-border)]' : ''}`} style={{
                  borderStyle: isWindows98Theme ? 'inset' : undefined,
                  fontFamily: isWindows98Theme ? '"MS Sans Serif", "Microsoft Sans Serif", sans-serif' : undefined,
                }}>
                  {isWindows98Theme ? '👤' : <UserIcon className="w-4 h-4 text-gray-400" />}
                  <span className={isWindows98Theme ? 'text-black' : 'text-gray-300'}>{user.email}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${isWindows98Theme ? 'bg-blue-600 text-white border border-[var(--color-border)]' : 'bg-primary-600 text-white'}`} style={{
                    borderRadius: isWindows98Theme ? '0' : undefined,
                    borderStyle: isWindows98Theme ? 'outset' : undefined,
                  }}>
                    {user.credits} credits
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-all ${isWindows98Theme ? 'btn-primary' : 'text-gray-300 hover:text-white glass-dark rounded-lg hover:bg-gray-700'}`}
                >
                  {isWindows98Theme ? '🚪' : <LogoutIcon className="w-4 h-4" />}
                  <span className="ml-1">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/?auth=login')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${isWindows98Theme ? 'btn-primary' : 'text-primary-400 hover:text-primary-300'}`}
                >
                  {isWindows98Theme ? '🔐 ' : ''}Sign In
                </button>
                <button
                  onClick={() => navigate('/?auth=signup')}
                  className={`px-4 py-2 text-sm font-medium transition-all ${isWindows98Theme ? 'btn-primary' : 'bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-lg hover:from-primary-700 hover:to-blue-700 hover-lift'}`}
                >
                  {isWindows98Theme ? '🚀 ' : ''}Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
