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
          primary: '#FF6B35',
          'primary-dark': '#C0410F',
          warm: '#FFB347',
          bg: '#FFF8F4',
          'surface-dim': '#FFF0E8',
        },
        primary: {
          DEFAULT: '#FF6B35',
          dark: '#C0410F',
          light: '#FFB347',
        },
        secondary: {
          DEFAULT: '#1A1A2E',
          light: '#4B5563',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          warm: '#FFF8F4',
          dim: '#FFF0E8',
        },
        snack: {
          badge: '#FEF3C7',
          text: '#92400E',
        },
        cook: {
          badge: '#DBEAFE',
          text: '#1E40AF',
        },
        combo: {
          badge: '#F3E8FF',
          text: '#6B21A8',
        },
        muted: '#6B7280',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
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
        'card': '0 2px 12px rgba(255,107,53,0.08)',
        'elevated': '0 8px 32px rgba(255,107,53,0.12)',
        'primary': '0 4px 14px rgba(255,107,53,0.35)',
        'glow': '0 0 32px rgba(255,107,53,0.3)',
        'warm': '0 4px 20px rgba(255,107,53,0.15)',
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
