import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Theme types that match the available themes in themes.css
export type ThemeType = 'elegant' | 'glassmorphism' | 'brutalism' | 'windows98' | 'cyberpunk' | 'classic';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
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
  const [theme, setTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as ThemeType) || 'elegant';
  });

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('theme', theme);
    
    // Set the theme attribute on document element for CSS targeting
    document.documentElement.setAttribute('data-theme', theme);
    
    // Also set the theme class on body for additional styling
    document.body.className = `theme-${theme}`;
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