/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'military-green': '#00ff41',
        'military-dark': '#0a0d0f',
        'military-panel': '#1a1f2a',
        'military-border': '#2a3f5a',
        'threat-low': '#00ff00',
        'threat-medium': '#ffff00',
        'threat-high': '#ff6b35',
        'threat-critical': '#ff0000',
        'classified-open': '#00ff00',
        'classified-restricted': '#ffff00',
        'classified-confidential': '#ff6b35',
        'classified-secret': '#ff0000',
        'classified-top-secret': '#ff00ff',
      },
      fontFamily: {
        mono: ['Courier New', 'monospace'],
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ticker-scroll': 'ticker-scroll 40s linear infinite',
        'radar-sweep': 'radar-sweep 4s linear infinite',
      },
      keyframes: {
        'ticker-scroll': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}
