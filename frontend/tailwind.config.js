/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cinema: {
          base: '#0A0A0C',
          card: '#141417',
          elevated: '#1C1C21',
          border: '#1E1E24',
        },
        accent: {
          primary: '#F5C518',
          'primary-hover': '#E6B40F',
          'primary-dim': '#8A6D0A',
          destructive: '#E50914',
          'destructive-hover': '#C70812',
        },
        text: {
          primary: '#F2F2F0',
          secondary: '#8A8A94',
          muted: '#5A5A64',
        },
      },
      fontFamily: {
        display: ['"Clash Display"', '"Cabinet Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        hero: ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        display: ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      boxShadow: {
        'glow-amber': '0 0 30px rgba(245, 197, 24, 0.25)',
        'glow-red': '0 0 30px rgba(229, 9, 20, 0.25)',
        'soft-lg': '0 8px 40px rgba(0, 0, 0, 0.4)',
        'soft-xl': '0 16px 60px rgba(0, 0, 0, 0.5)',
        'lift': '0 12px 40px rgba(0, 0, 0, 0.5)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'slide-right': 'slideRight 0.4s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(245, 197, 24, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(245, 197, 24, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
