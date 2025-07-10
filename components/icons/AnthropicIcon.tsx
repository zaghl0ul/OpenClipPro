import React from 'react';

interface AnthropicIconProps {
  className?: string;
  size?: number;
}

const AnthropicIcon: React.FC<AnthropicIconProps> = ({ className = '', size = 24 }) => {
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
        <linearGradient id="anthropic-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E07B39" />
          <stop offset="100%" stopColor="#D65F3F" />
        </linearGradient>
      </defs>
      <path
        d="M8.85 3h2.4L17 21h-2.7l-1.2-3.6H7.6L6.4 21H3.7L8.85 3zm0.95 5.4L7.9 14.4h3.8L9.8 8.4z"
        fill="url(#anthropic-gradient)"
      />
      <path
        d="M14.85 3h2.4L21 21h-2.7l-1.2-3.6H12.6L11.4 21H8.7L14.85 3zm0.95 5.4L13.9 14.4h3.8L15.8 8.4z"
        fill="url(#anthropic-gradient)"
        opacity="0.7"
      />
    </svg>
  );
};

export default AnthropicIcon; 