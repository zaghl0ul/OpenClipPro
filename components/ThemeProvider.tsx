import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Move type definition inline to fix fast refresh issues
interface ThemeContextType {
  theme: 'cyberpunk' | 'brutalism' | 'windows98' | 'classic';
  setTheme: (theme: 'cyberpunk' | 'brutalism' | 'windows98' | 'classic') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeContextType['theme']>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as ThemeContextType['theme']) || 'elegant';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};