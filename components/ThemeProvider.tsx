import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'cyberpunk' | 'classic' | 'dark' | 'contrast' | 'win98';

export interface ThemeInfo {
  id: Theme;
  name: string;
  description: string;
  icon: string;
  category: 'modern' | 'professional' | 'accessible';
  features: string[];
}

export const AVAILABLE_THEMES: ThemeInfo[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Futuristic dark theme with neon accents and glowing effects',
    icon: '⚡',
    category: 'modern',
    features: ['Neon Effects', 'Backdrop Blur', 'Animated Glows', 'Purple Gradients']
  },
  {
    id: 'classic',
    name: 'Minimalist Classic',
    description: 'Clean, professional light theme with excellent readability',
    icon: '✨',
    category: 'professional',
    features: ['High Readability', 'Professional', 'Clean Design', 'Light Mode']
  },
  {
    id: 'dark',
    name: 'Dark Professional',
    description: 'Modern dark theme optimized for long coding sessions',
    icon: '🌙',
    category: 'professional',
    features: ['Eye Comfort', 'Professional', 'Subtle Effects', 'Blue Accents']
  },
  {
    id: 'contrast',
    name: 'High Contrast',
    description: 'Maximum accessibility theme with high contrast ratios',
    icon: '♿',
    category: 'accessible',
    features: ['WCAG AAA', 'High Contrast', 'Accessibility', 'Bold Text']
  },
  {
    id: 'win98',
    name: 'Windows 98 Retro',
    description: 'Authentic nostalgic Windows 98 interface with classic 3D effects',
    icon: '🖥️',
    category: 'modern',
    features: ['Retro Design', '3D Effects', 'Classic Fonts', 'Authentic Feel']
  }
];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themeInfo: ThemeInfo;
  availableThemes: ThemeInfo[];
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
  const [theme, setTheme] = useState<Theme>(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('openclip-theme');
    if (savedTheme && AVAILABLE_THEMES.some(t => t.id === savedTheme)) {
      return savedTheme as Theme;
    }

    // Check for system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    // Default to cyberpunk
    return 'cyberpunk';
  });

  const themeInfo = AVAILABLE_THEMES.find(t => t.id === theme) || AVAILABLE_THEMES[0];

  // Apply theme to document
  useEffect(() => {
    localStorage.setItem('openclip-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    // Add theme class to body for additional styling if needed
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme}`);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const themeColors = {
        cyberpunk: '#0a0a0f',
        classic: '#ffffff',
        dark: '#1a1a1a',
        contrast: '#000000',
        win98: '#c0c0c0'
      };
      metaThemeColor.setAttribute('content', themeColors[theme]);
    }
    
    // Announce theme change to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Theme changed to ${themeInfo.name}`;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, [theme, themeInfo.name]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually set a theme
      const hasManualTheme = localStorage.getItem('openclip-theme-manual');
      if (!hasManualTheme) {
        setTheme(e.matches ? 'dark' : 'classic');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    // Mark as manually set
    localStorage.setItem('openclip-theme-manual', 'true');
  };

  const value = {
    theme,
    setTheme: handleSetTheme,
    themeInfo,
    availableThemes: AVAILABLE_THEMES,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};