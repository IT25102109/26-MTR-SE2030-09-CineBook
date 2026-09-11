/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#08080a',
          900: '#0d0d10',
          850: '#121216',
          800: '#18181d',
          750: '#1f1f25',
          700: '#26262d',
          600: '#2e2e36',
          500: '#3a3a44',
          400: '#52525c',
          300: '#71717b',
          200: '#a1a1aa',
          100: '#d4d4d8',
        },
        accent: {
          DEFAULT: '#E50914',
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        gold: {
          DEFAULT: '#F5C518',
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
        },
        success: {
          DEFAULT: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          DEFAULT: '#f59e0b',
          600: '#d97706',
        },
        error: {
          DEFAULT: '#ef4444',
          600: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        glow: '0 0 24px -4px rgba(229, 9, 20, 0.45)',
        'glow-gold': '0 0 24px -4px rgba(245, 197, 24, 0.4)',
        card: '0 8px 30px -12px rgba(0, 0, 0, 0.6)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-fast': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out both',
        'fade-in-fast': 'fade-in-fast 0.3s ease-out both',
        'scale-in': 'scale-in 0.25s ease-out both',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
