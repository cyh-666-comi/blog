/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#FFF8F0',
          100: '#FFF0E0',
          200: '#FFE4CC',
          300: '#FFD1B8',
          400: '#FFAB76',
          500: '#FF8A65',
        },
        coral: {
          50: '#FFF5F2',
          100: '#FFE8E0',
          200: '#FFD1C8',
          300: '#FFB5A7',
          400: '#FF8A75',
          500: '#FF7F50',
        },
        brown: {
          100: '#EFEBE9',
          200: '#D7CCC8',
          400: '#A1887F',
          500: '#8D6E63',
          700: '#5D4037',
          800: '#4E342E',
          900: '#3E2723',
        },
      },
      fontFamily: {
        cute: ['"KaiTi"', '"STKaiti"', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 16px rgba(255,127,80,0.08)',
        'soft-lg': '0 8px 32px rgba(255,127,80,0.12)',
        'card': '0 2px 12px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
        'card-hover': '0 6px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
