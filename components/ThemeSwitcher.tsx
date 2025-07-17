import React from 'react';
import { useTheme } from './ThemeProvider';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'elegant', name: 'Elegant', icon: '🎨' },
    { id: 'glassmorphism', name: 'Glass', icon: '💎' },
    { id: 'brutalism', name: 'Brutal', icon: '⚡' },
    { id: 'windows98', name: 'Win98', icon: '🖥️' },
  ] as const;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-secondary">Theme:</span>
      <div className="flex gap-1">
        {themes.map((themeOption) => (
          <button
            key={themeOption.id}
            onClick={() => setTheme(themeOption.id)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              theme === themeOption.id
                ? 'bg-accent-primary text-white shadow-glow'
                : 'bg-secondary text-secondary hover:text-primary hover:bg-tertiary'
            }`}
            title={themeOption.name}
          >
            <span className="text-lg">{themeOption.icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSwitcher;