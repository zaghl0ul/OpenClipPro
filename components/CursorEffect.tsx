import React, { useEffect, useState, useCallback, useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

const CursorEffect: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Memoize particle creation to reduce object creation
  const createParticle = useCallback((x: number, y: number, id: number): Particle => ({
    id,
    x,
    y,
    size: Math.random() * 4 + 2,
    opacity: 1
  }), []);

  // Optimize particle updates with useCallback
  const updateParticles = useCallback(() => {
    setParticles(prev => 
      prev
        .map(p => ({ ...p, opacity: p.opacity - 0.02 }))
        .filter(p => p.opacity > 0)
    );
  }, []);

  useEffect(() => {
    let particleId = 0;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      // Create new particle with memoized function
      const newParticle = createParticle(e.clientX, e.clientY, particleId++);

      setParticles(prev => [...prev, newParticle].slice(-20)); // Keep only last 20 particles
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Use requestAnimationFrame for better performance
    const animate = () => {
      updateParticles();
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [createParticle, updateParticles]);

  // Memoize cursor styles to prevent unnecessary re-renders
  const cursorStyle = useMemo(() => ({
    left: mousePos.x - 4,
    top: mousePos.y - 4,
    width: '8px',
    height: '8px',
    background: '#d946ef',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    transition: 'transform 0.1s ease-out'
  }), [mousePos.x, mousePos.y]);

  return (
    <>
      {/* Main cursor */}
      <div
        className="cursor-dot fixed pointer-events-none z-[9999] mix-blend-screen"
        style={cursorStyle}
      />
      
      {/* Particle trail */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="fixed pointer-events-none z-[9998] mix-blend-screen"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            background: `radial-gradient(circle, rgba(217, 70, 239, ${particle.opacity}) 0%, transparent 70%)`,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: particle.opacity
          }}
        />
      ))}
    </>
  );
};

export default CursorEffect; 