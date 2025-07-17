import React from 'react';
import { useTheme } from './ThemeProvider';

const UITest: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'elegant', name: 'Elegant', description: 'Clean and professional' },
    { id: 'glassmorphism', name: 'Glassmorphism', description: 'Modern glass effect' },
    { id: 'brutalism', name: 'Neo Brutalist', description: 'Bold, raw, and unapologetic' },
    { id: 'windows98', name: 'Windows 98', description: 'Retro computing nostalgia' },
  ] as const;

  return (
    <div className="min-h-screen bg-primary p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">UI Test Page</h1>
        
        {/* Theme Switcher */}
        <div className="card p-6 mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">Theme System Test</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {themes.map((themeOption) => (
              <button
                key={themeOption.id}
                onClick={() => setTheme(themeOption.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  theme === themeOption.id
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-primary hover:border-accent hover:bg-accent/5'
                }`}
              >
                <div className="font-medium">{themeOption.name}</div>
                <div className="text-sm text-secondary">{themeOption.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Component Tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Card Test */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-primary mb-4">Card Component</h3>
            <p className="text-secondary mb-4">This is a test card with proper styling.</p>
            <div className="flex gap-2">
              <button className="btn-primary">Primary Button</button>
              <button className="btn-secondary">Secondary Button</button>
            </div>
          </div>

          {/* Stats Test */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-primary mb-4">Stats Display</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">42</div>
                <div className="text-sm text-secondary">Total Clips</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">89%</div>
                <div className="text-sm text-secondary">Viral Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Color System Test */}
        <div className="card p-6 mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">Color System Test</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary rounded-lg">
              <div className="text-sm text-secondary mb-2">Primary Background</div>
              <div className="text-primary">Primary Text</div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-sm text-secondary mb-2">Secondary Background</div>
              <div className="text-primary">Secondary Text</div>
            </div>
            <div className="text-center p-4 bg-tertiary rounded-lg">
              <div className="text-sm text-secondary mb-2">Tertiary Background</div>
              <div className="text-primary">Tertiary Text</div>
            </div>
            <div className="text-center p-4 bg-card rounded-lg border border-primary">
              <div className="text-sm text-secondary mb-2">Card Background</div>
              <div className="text-primary">Card Text</div>
            </div>
          </div>
        </div>

        {/* Current Theme Info */}
        <div className="card p-6">
          <h2 className="text-2xl font-semibold text-primary mb-4">Current Theme Info</h2>
          <div className="bg-secondary p-4 rounded-lg">
            <p className="text-secondary">
              <strong>Current Theme:</strong> {theme}
            </p>
            <p className="text-secondary">
              <strong>CSS Variables:</strong> All theme variables should be properly applied
            </p>
            <p className="text-secondary">
              <strong>Status:</strong> {theme === 'elegant' ? '✅ Default theme loaded' : '✅ Theme switched successfully'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UITest;