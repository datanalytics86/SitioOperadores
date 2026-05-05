/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        faena: {
          DEFAULT: '#FF6200',
          50: '#FFF1E6',
          100: '#FFD9B8',
          200: '#FFB070',
          300: '#FF8A38',
          400: '#FF7414',
          500: '#FF6200',
          600: '#D85300',
          700: '#A43F00',
          800: '#732C00',
          900: '#421900',
        },
        ink: {
          900: '#0A0A0A',
          800: '#111111',
          700: '#1F1F1F',
          600: '#2A2A2A',
          500: '#3A3A3A',
        },
        chile: '#0033A0',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-faena': '0 10px 40px -10px rgba(255, 98, 0, 0.55)',
        card: '0 8px 30px rgba(0,0,0,0.35)',
        'card-hover': '0 20px 50px rgba(255, 98, 0, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'glow-pulse': 'glowPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(255, 98, 0, 0.7)' },
          '70%': { boxShadow: '0 0 0 10px rgba(255, 98, 0, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255, 98, 0, 0)' },
        },
      },
    },
  },
  plugins: [],
};
