module.exports = {
  content: [
    './index.html',
    './App.tsx',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './services/**/*.{js,ts,jsx,tsx}',
    './utils/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Theme-aware colors that use CSS variables
        primary: {
          DEFAULT: 'var(--text-primary)',
          50: 'var(--text-primary)',
          100: 'var(--text-primary)',
          200: 'var(--text-secondary)',
          300: 'var(--text-tertiary)',
          400: 'var(--text-accent)',
          500: 'var(--accent-primary)',
          600: 'var(--accent-secondary)',
          700: 'var(--accent-primary)',
          800: 'var(--accent-secondary)',
          900: 'var(--accent-primary)',
        },
        secondary: {
          DEFAULT: 'var(--text-secondary)',
          50: 'var(--text-secondary)',
          100: 'var(--text-secondary)',
          200: 'var(--text-tertiary)',
          300: 'var(--text-tertiary)',
          400: 'var(--text-accent)',
          500: 'var(--accent-primary)',
          600: 'var(--accent-secondary)',
          700: 'var(--accent-primary)',
          800: 'var(--accent-secondary)',
          900: 'var(--accent-primary)',
        },
        accent: {
          DEFAULT: 'var(--accent-primary)',
          50: 'var(--accent-primary)',
          100: 'var(--accent-primary)',
          200: 'var(--accent-secondary)',
          300: 'var(--accent-secondary)',
          400: 'var(--accent-primary)',
          500: 'var(--accent-primary)',
          600: 'var(--accent-secondary)',
          700: 'var(--accent-primary)',
          800: 'var(--accent-secondary)',
          900: 'var(--accent-primary)',
        },
        // Background colors
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          card: 'var(--bg-card)',
        },
        // Border colors
        border: {
          primary: 'var(--border-primary)',
          secondary: 'var(--border-secondary)',
          accent: 'var(--border-focus)',
        },
        // Success, warning, error colors
        success: {
          DEFAULT: 'var(--accent-success)',
          50: 'var(--accent-success)',
          100: 'var(--accent-success)',
          200: 'var(--accent-success)',
          300: 'var(--accent-success)',
          400: 'var(--accent-success)',
          500: 'var(--accent-success)',
          600: 'var(--accent-success)',
          700: 'var(--accent-success)',
          800: 'var(--accent-success)',
          900: 'var(--accent-success)',
        },
        warning: {
          DEFAULT: 'var(--accent-warning)',
          50: 'var(--accent-warning)',
          100: 'var(--accent-warning)',
          200: 'var(--accent-warning)',
          300: 'var(--accent-warning)',
          400: 'var(--accent-warning)',
          500: 'var(--accent-warning)',
          600: 'var(--accent-warning)',
          700: 'var(--accent-warning)',
          800: 'var(--accent-warning)',
          900: 'var(--accent-warning)',
        },
        error: {
          DEFAULT: 'var(--accent-error)',
          50: 'var(--accent-error)',
          100: 'var(--accent-error)',
          200: 'var(--accent-error)',
          300: 'var(--accent-error)',
          400: 'var(--accent-error)',
          500: 'var(--accent-error)',
          600: 'var(--accent-error)',
          700: 'var(--accent-error)',
          800: 'var(--accent-error)',
          900: 'var(--accent-error)',
        },
      },
      backgroundColor: {
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        tertiary: 'var(--bg-tertiary)',
        card: 'var(--bg-card)',
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        tertiary: 'var(--text-tertiary)',
        accent: 'var(--text-accent)',
      },
      borderColor: {
        primary: 'var(--border-primary)',
        secondary: 'var(--border-secondary)',
        accent: 'var(--border-focus)',
      },
      boxShadow: {
        'theme-sm': 'var(--shadow-sm)',
        'theme-md': 'var(--shadow-md)',
        'theme-lg': 'var(--shadow-lg)',
        'theme-xl': 'var(--shadow-xl)',
        'glow-primary': 'var(--glow-primary)',
        'glow-accent': 'var(--glow-accent)',
      },
      borderRadius: {
        'theme-sm': 'var(--radius-sm)',
        'theme-md': 'var(--radius-md)',
        'theme-lg': 'var(--radius-lg)',
        'theme-xl': 'var(--radius-xl)',
      },
      spacing: {
        'theme-xs': 'var(--spacing-xs)',
        'theme-sm': 'var(--spacing-sm)',
        'theme-md': 'var(--spacing-md)',
        'theme-lg': 'var(--spacing-lg)',
        'theme-xl': 'var(--spacing-xl)',
        'theme-2xl': 'var(--spacing-2xl)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
      },
      transitionProperty: {
        'theme': 'var(--theme-transition)',
      },
      backdropBlur: {
        'theme': 'var(--backdrop-blur)',
        'theme-sm': 'var(--backdrop-blur-sm)',
        'theme-lg': 'var(--backdrop-blur-lg)',
      },
    },
  },
  plugins: [
    // Custom plugin to add theme-aware utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.text-primary': {
          color: 'var(--text-primary)',
        },
        '.text-secondary': {
          color: 'var(--text-secondary)',
        },
        '.text-tertiary': {
          color: 'var(--text-tertiary)',
        },
        '.text-accent': {
          color: 'var(--text-accent)',
        },
        '.bg-primary': {
          backgroundColor: 'var(--bg-primary)',
        },
        '.bg-secondary': {
          backgroundColor: 'var(--bg-secondary)',
        },
        '.bg-tertiary': {
          backgroundColor: 'var(--bg-tertiary)',
        },
        '.bg-card': {
          backgroundColor: 'var(--bg-card)',
        },
        '.border-primary': {
          borderColor: 'var(--border-primary)',
        },
        '.border-secondary': {
          borderColor: 'var(--border-secondary)',
        },
        '.border-accent': {
          borderColor: 'var(--border-focus)',
        },
        '.shadow-theme': {
          boxShadow: 'var(--shadow-md)',
        },
        '.shadow-theme-lg': {
          boxShadow: 'var(--shadow-lg)',
        },
        '.shadow-glow': {
          boxShadow: 'var(--glow-primary)',
        },
        '.backdrop-blur-theme': {
          backdropFilter: 'var(--backdrop-blur)',
        },
        '.transition-theme': {
          transition: 'var(--theme-transition)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
  // Production optimizations
  future: {
    hoverOnlyWhenSupported: true,
  },
  experimental: {
    optimizeUniversalDefaults: true,
  },
};