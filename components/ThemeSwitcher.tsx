import React from 'react';
import { useTheme } from './ThemeProvider';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'cyberpunk', name: 'Cyberpunk', description: 'Current neon aesthetic' },
    { id: 'brutalism', name: 'Brutalism', description: 'Bold, raw, and unapologetic' },
    { id: 'windows98', name: 'Windows 98', description: 'Retro computing nostalgia' },
    { id: 'classic', name: 'Classic', description: 'Timeless and elegant' },
  ] as const;

  return (
    <div className="theme-switcher">
      <h3 className="text-lg font-semibold mb-4">Choose Theme</h3>
      <div className="grid grid-cols-2 gap-3">
        {themes.map((themeOption) => (
          <button
            key={themeOption.id}
            onClick={() => setTheme(themeOption.id)}
            className={`theme-option p-4 rounded-lg border-2 transition-all duration-300 ${
              theme === themeOption.id
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                : 'border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5'
            }`}
          >
            <div className="font-medium">{themeOption.name}</div>
            <div className="text-sm opacity-75">{themeOption.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSwitcher;