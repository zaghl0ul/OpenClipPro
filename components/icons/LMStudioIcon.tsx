import React from 'react';

interface LMStudioIconProps {
  className?: string;
  size?: number;
}

const LMStudioIcon: React.FC<LMStudioIconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="lmstudio-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      {/* Monitor frame */}
      <rect
        x="2"
        y="4"
        width="20"
        height="13"
        rx="2"
        fill="url(#lmstudio-gradient)"
        stroke="currentColor"
        strokeWidth="0.5"
      />
      {/* Screen */}
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="10"
        rx="1"
        fill="black"
        opacity="0.8"
      />
      {/* Code lines */}
      <rect x="5" y="7" width="6" height="1" fill="#4ADE80" rx="0.5" />
      <rect x="5" y="9" width="8" height="1" fill="#60A5FA" rx="0.5" />
      <rect x="5" y="11" width="5" height="1" fill="#F59E0B" rx="0.5" />
      <rect x="5" y="13" width="7" height="1" fill="#EC4899" rx="0.5" />
      
      {/* CPU/Processing indicator */}
      <circle cx="17" cy="10" r="2" fill="url(#lmstudio-gradient)" opacity="0.3" />
      <circle cx="17" cy="10" r="1" fill="white" />
      
      {/* Stand */}
      <rect x="10" y="17" width="4" height="2" fill="url(#lmstudio-gradient)" rx="1" />
      <rect x="8" y="19" width="8" height="1" fill="url(#lmstudio-gradient)" rx="0.5" />
    </svg>
  );
};

export default LMStudioIcon; 