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
          DEFAULT: 'var(--color-text-primary)',
          50: 'var(--color-text-primary)',
          100: 'var(--color-text-primary)',
          200: 'var(--color-text-secondary)',
          300: 'var(--color-text-tertiary)',
          400: 'var(--color-text-accent)',
          500: 'var(--color-accent)',
          600: 'var(--color-accent-hover)',
          700: 'var(--color-accent)',
          800: 'var(--color-accent-hover)',
          900: 'var(--color-accent)',
        },
        secondary: {
          DEFAULT: 'var(--color-text-secondary)',
          50: 'var(--color-text-secondary)',
          100: 'var(--color-text-secondary)',
          200: 'var(--color-text-tertiary)',
          300: 'var(--color-text-tertiary)',
          400: 'var(--color-text-accent)',
          500: 'var(--color-accent)',
          600: 'var(--color-accent-hover)',
          700: 'var(--color-accent)',
          800: 'var(--color-accent-hover)',
          900: 'var(--color-accent)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          50: 'var(--color-accent)',
          100: 'var(--color-accent)',
          200: 'var(--color-accent-hover)',
          300: 'var(--color-accent-hover)',
          400: 'var(--color-accent)',
          500: 'var(--color-accent)',
          600: 'var(--color-accent-hover)',
          700: 'var(--color-accent)',
          800: 'var(--color-accent-hover)',
          900: 'var(--color-accent)',
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
          DEFAULT: 'var(--color-success)',
          50: 'var(--color-success)',
          100: 'var(--color-success)',
          200: 'var(--color-success)',
          300: 'var(--color-success)',
          400: 'var(--color-success)',
          500: 'var(--color-success)',
          600: 'var(--color-success)',
          700: 'var(--color-success)',
          800: 'var(--color-success)',
          900: 'var(--color-success)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          50: 'var(--color-warning)',
          100: 'var(--color-warning)',
          200: 'var(--color-warning)',
          300: 'var(--color-warning)',
          400: 'var(--color-warning)',
          500: 'var(--color-warning)',
          600: 'var(--color-warning)',
          700: 'var(--color-warning)',
          800: 'var(--color-warning)',
          900: 'var(--color-warning)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          50: 'var(--color-error)',
          100: 'var(--color-error)',
          200: 'var(--color-error)',
          300: 'var(--color-error)',
          400: 'var(--color-error)',
          500: 'var(--color-error)',
          600: 'var(--color-error)',
          700: 'var(--color-error)',
          800: 'var(--color-error)',
          900: 'var(--color-error)',
        },
      },
      backgroundColor: {
        primary: 'var(--color-bg-primary)',
        secondary: 'var(--color-bg-secondary)',
        tertiary: 'var(--color-bg-tertiary)',
        card: 'var(--color-bg-card)',
      },
      textColor: {
        primary: 'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
        tertiary: 'var(--color-text-tertiary)',
        accent: 'var(--color-text-accent)',
      },
      borderColor: {
        primary: 'var(--color-border)',
        secondary: 'var(--color-border-subtle)',
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
        'theme-xs': 'var(--spacing-1)',
        'theme-sm': 'var(--spacing-2)',
        'theme-md': 'var(--spacing-4)',
        'theme-lg': 'var(--spacing-6)',
        'theme-xl': 'var(--spacing-8)',
        'theme-2xl': 'var(--spacing-8)',
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