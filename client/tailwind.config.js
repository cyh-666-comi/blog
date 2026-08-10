/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#1e293b',
          dark: '#0f172a',
          light: '#334155',
          hover: '#1e3a5f',
        },
      },
      boxShadow: {
        'glow': '0 0 0 1px rgba(6,182,212,0.2), 0 4px 24px rgba(0,0,0,0.3)',
        'glow-hover': '0 0 0 1px rgba(6,182,212,0.4), 0 8px 32px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
