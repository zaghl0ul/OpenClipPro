import React from 'react';

interface GeminiIconProps {
  className?: string;
  size?: number;
}

const GeminiIcon: React.FC<GeminiIconProps> = ({ className = '', size = 24 }) => {
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
        <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="25%" stopColor="#34A853" />
          <stop offset="50%" stopColor="#FBBC05" />
          <stop offset="75%" stopColor="#EA4335" />
          <stop offset="100%" stopColor="#9C27B0" />
        </linearGradient>
      </defs>
      <path
        d="M12 2L3 7v10l9 5 9-5V7l-9-5z"
        fill="url(#gemini-gradient)"
        stroke="currentColor"
        strokeWidth="0.5"
      />
      <circle cx="12" cy="12" r="4" fill="white" opacity="0.9" />
      <path
        d="M12 8.5l2.5 2.5L12 13.5 9.5 11z"
        fill="url(#gemini-gradient)"
      />
    </svg>
  );
};

export default GeminiIcon; 