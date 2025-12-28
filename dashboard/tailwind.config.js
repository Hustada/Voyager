/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ember: {
          primary: '#f59e0b',
          'primary-foreground': '#1a0a00',
          background: '#0f0906',
          card: '#1a0f09',
          'card-border': '#2d1810',
          text: '#fef3c7',
          'text-muted': '#a8a29e',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
