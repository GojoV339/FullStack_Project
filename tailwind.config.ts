import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        feast: {
          primary: '#b50346',
          'primary-dark': '#8a0235',
          'primary-light': '#d45c7e',
          bg: '#eeeeee',
          surface: '#eeeeee',
          'surface-dim': '#e0e0e0',
        },
        primary: {
          DEFAULT: '#b50346',
          dark: '#8a0235',
          light: '#d45c7e',
        },
        secondary: {
          DEFAULT: '#2D2D2D',
          light: '#8A8A8A',
        },
        surface: {
          DEFAULT: '#eeeeee',
          warm: '#eeeeee',
          dim: '#e0e0e0',
          muted: '#d6d6d6',
        },
        snack: {
          badge: '#FFF4E6',
          text: '#B86B2B',
        },
        cook: {
          badge: '#EAF4F4',
          text: '#2F6F73',
        },
        combo: {
          badge: '#F3EDF7',
          text: '#6B4FA3',
        },
        muted: '#8A8A8A',
        success: '#6BAF92',
        warning: '#E6A23C',
        error: '#D96C6C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.6875rem', { lineHeight: '1rem' }],
        'sm': ['0.8125rem', { lineHeight: '1.25rem' }],
        'base': ['0.9375rem', { lineHeight: '1.5rem' }],
        'lg': ['1.0625rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        'display': ['2rem', { lineHeight: '2.5rem' }],
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(181, 3, 70, 0.10)',
        'elevated': '0 8px 32px rgba(181, 3, 70, 0.15)',
        'primary': '0 4px 14px rgba(181, 3, 70, 0.30)',
        'glow': '0 0 32px rgba(181, 3, 70, 0.25)',
        'warm': '0 4px 20px rgba(181, 3, 70, 0.15)',
      },
      animation: {
        'scan-line': 'scan-line 2s ease-in-out infinite',
        'pulse-bracket': 'pulse-bracket 1.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'bounce-in': 'bounce-in 0.5s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'counter': 'counter 1s ease-out',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
      },
      keyframes: {
        'scan-line': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(160px)' },
        },
        'pulse-bracket': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
