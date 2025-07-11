import React, { useState, useEffect } from 'react';

const SimpleThemeSwitcher = () => {
  const themes = [
    { id: 'cyberpunk', name: 'Cyberpunk', description: 'Current neon aesthetic', icon: '🌆' },
    { id: 'brutalism', name: 'Brutalism', description: 'Bold, raw, and unapologetic', icon: '🧱' },
    { 
      id: 'win98', 
      name: 'Windows 98', 
      description: 'It is now safe to turn off your computer 💾', 
      icon: '🖥️',
      subtitle: 'Welcome to the Information Superhighway!'
    },
    { id: 'classic', name: 'Classic', description: 'Timeless and elegant', icon: '✨' },
  ];

  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('openclip-theme') || 'cyberpunk';
  });

  const [showWin98Easter, setShowWin98Easter] = useState(false);

  const setTheme = (themeId: string) => {
    localStorage.setItem('openclip-theme', themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    setCurrentTheme(themeId);
    
    // Show Windows 98 easter egg
    if (themeId === 'win98') {
      setShowWin98Easter(true);
      setTimeout(() => setShowWin98Easter(false), 3000);
    }
  };

  // Initialize theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('openclip-theme') || 'cyberpunk';
    document.documentElement.setAttribute('data-theme', savedTheme);
    setCurrentTheme(savedTheme);
  }, []);

  return (
    <div className="theme-switcher">
      <h3 className="text-lg font-semibold mb-4">Choose Theme</h3>
      
      {/* Windows 98 Easter Egg */}
      {showWin98Easter && (
        <div className="mb-4 p-3 bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] text-center" style={{ 
          borderStyle: currentTheme === 'win98' ? 'outset' : 'solid',
          fontFamily: currentTheme === 'win98' ? '"MS Sans Serif", "Microsoft Sans Serif", sans-serif' : 'inherit',
          fontSize: currentTheme === 'win98' ? '12px' : 'inherit'
        }}>
          <div>🎵 *Windows 98 startup sound* 🎵</div>
          <div className="text-sm mt-1">Where do you want to go today?</div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-3">
        {themes.map((themeOption) => (
          <button
            key={themeOption.id}
            onClick={() => setTheme(themeOption.id)}
            className={`theme-option p-4 rounded-lg border-2 transition-all duration-300 ${
              currentTheme === themeOption.id
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                : 'border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5'
            }`}
            style={{
              fontFamily: themeOption.id === 'win98' && currentTheme === 'win98' 
                ? '"MS Sans Serif", "Microsoft Sans Serif", sans-serif' 
                : 'inherit'
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">{themeOption.icon}</span>
              <div className="font-medium">{themeOption.name}</div>
              <div className="text-sm opacity-75 text-center">
                {themeOption.description}
                {themeOption.subtitle && themeOption.id === 'win98' && currentTheme === 'win98' && (
                  <div className="text-xs mt-1 italic">{themeOption.subtitle}</div>
                )}
              </div>
              {themeOption.id === 'win98' && currentTheme === 'win98' && (
                <div className="text-xs text-center mt-1">
                  <div>💾 Insert floppy disk</div>
                  <div>📼 Grab your Tamagotchi</div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {/* Windows 98 Current Time Display */}
      {currentTheme === 'win98' && (
        <div className="mt-4 p-2 bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)]" style={{ 
          borderStyle: 'inset',
          fontFamily: '"MS Sans Serif", "Microsoft Sans Serif", sans-serif',
          fontSize: '11px'
        }}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span>🏁</span>
              <span>Start</span>
            </div>
            <div>
              {new Date().toLocaleTimeString('en-US', { 
                hour12: true, 
                hour: 'numeric', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleThemeSwitcher;