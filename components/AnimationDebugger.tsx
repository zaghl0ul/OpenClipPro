import React, { useState, useEffect } from 'react';

const AnimationDebugger: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [hasReducedMotion, setHasReducedMotion] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setHasReducedMotion(mediaQuery.matches);
    
    // Check if animations are force-enabled
    setAnimationsEnabled(document.documentElement.classList.contains('force-animations'));
    
    // Listen for media query changes
    const handleChange = (e: MediaQueryListEvent) => {
      setHasReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleAnimations = () => {
    const html = document.documentElement;
    
    if (animationsEnabled) {
      // Disable animations
      html.classList.remove('force-animations');
      html.classList.add('disable-all-animations');
      
      // Add style to disable all animations
      const style = document.createElement('style');
      style.id = 'animation-disabler';
      style.textContent = `
        .disable-all-animations * {
          animation: none !important;
          transition: none !important;
        }
      `;
      document.head.appendChild(style);
    } else {
      // Enable animations
      html.classList.add('force-animations');
      html.classList.remove('disable-all-animations');
      
      // Remove disabling style
      const existingStyle = document.getElementById('animation-disabler');
      if (existingStyle) {
        existingStyle.remove();
      }
    }
    
    setAnimationsEnabled(!animationsEnabled);
  };

  const testAnimations = () => {
    // Create a test element with animation
    const testEl = document.createElement('div');
    testEl.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      width: 50px;
      height: 50px;
      background: linear-gradient(45deg, #d946ef, #3b82f6);
      border-radius: 50%;
      transform: translate(-50%, -50%) scale(0);
      animation: test-animation 1s ease-out forwards;
      z-index: 10000;
      pointer-events: none;
    `;
    
    // Add keyframes for test animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes test-animation {
        0% { transform: translate(-50%, -50%) scale(0) rotate(0deg); }
        50% { transform: translate(-50%, -50%) scale(1.2) rotate(180deg); }
        100% { transform: translate(-50%, -50%) scale(1) rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(testEl);
    
    // Remove after animation
    setTimeout(() => {
      document.body.removeChild(testEl);
      document.head.removeChild(style);
    }, 1000);
  };

  // Only show in development or if explicitly enabled
  if (process.env.NODE_ENV === 'production' && !window.location.search.includes('debug-animations')) {
    return null;
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        title="Animation Debug Tools"
      >
        🎬
      </button>

      {/* Debug panel */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 z-50 bg-gray-900 border border-gray-600 rounded-lg p-4 shadow-2xl animate-in slide-in-from-top-2 duration-200 max-w-xs">
          <h3 className="text-white font-bold mb-3">🎨 Animation Debug</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Reduced Motion:</span>
              <span className={hasReducedMotion ? 'text-yellow-400' : 'text-green-400'}>
                {hasReducedMotion ? 'ON' : 'OFF'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Force Animations:</span>
              <span className={animationsEnabled ? 'text-green-400' : 'text-red-400'}>
                {animationsEnabled ? 'ON' : 'OFF'}
              </span>
            </div>
            
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={toggleAnimations}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs transition-colors"
              >
                {animationsEnabled ? 'Disable' : 'Enable'} Animations
              </button>
              
              <button
                onClick={testAnimations}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-xs transition-colors"
              >
                Test Animations
              </button>
            </div>
            
            <div className="text-xs text-gray-400 pt-2 border-t border-gray-700">
              URL param: ?debug-animations to show this in production
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnimationDebugger; 