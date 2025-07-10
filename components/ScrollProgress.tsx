import React, { useEffect, useState } from 'react';

const ScrollProgress: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = (window.pageYOffset / totalScroll) * 100;
      setScrollProgress(currentProgress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[1000] bg-gray-900/20">
      <div
        className="h-full bg-gradient-to-r from-primary-400 via-primary-600 to-blue-500 transition-all duration-300 ease-out"
        style={{ 
          width: `${scrollProgress}%`,
          boxShadow: '0 0 10px rgba(217, 70, 239, 0.8), 0 0 20px rgba(217, 70, 239, 0.4)'
        }}
      >
        <div className="h-full w-full animate-gradient-x opacity-50"></div>
      </div>
    </div>
  );
};

export default ScrollProgress; 