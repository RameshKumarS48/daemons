/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Major Mono Display"', 'monospace'],
        body: ['"Azeret Mono"', 'monospace'],
        ui: ['"DM Mono"', 'monospace'],
      },
      colors: {
        void: '#060812',
        surface: '#0c0e1a',
        elevated: '#121628',
        border: '#1e2235',
        dim: '#2a3050',
        primary: '#e2e8f0',
        muted: '#4a5568',
        faint: '#2d3748',
      },
      animation: {
        'glitch-in': 'glitch-in 0.35s ease-out',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'blink': 'blink 1s step-end infinite',
        'fade-up': 'fade-up 0.4s ease-out',
      },
      keyframes: {
        'glitch-in': {
          '0%':   { opacity: '0', clipPath: 'inset(50% 0 50% 0)', transform: 'translateX(-3px)' },
          '25%':  { clipPath: 'inset(15% 0 70% 0)', transform: 'translateX(3px)' },
          '50%':  { clipPath: 'inset(65% 0 15% 0)', transform: 'translateX(-1px)' },
          '75%':  { clipPath: 'inset(0 0 85% 0)', opacity: '1' },
          '100%': { opacity: '1', clipPath: 'inset(0 0 0 0)', transform: 'translateX(0)' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
