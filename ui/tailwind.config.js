/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Sincronizado con docs/design/color-tokens.json
        'military-green': '#00ff41',
        'military-dark': '#0a0d0f',
        'military-panel': '#1a2332', // canónico (antes #1a1f2a)
        'military-border': 'rgba(0,255,65,0.2)', // canónico
        'threat-low': '#00ff41',
        'threat-medium': '#ffd700', // canónico (antes #ffff00)
        'threat-high': '#ff6b35',
        'threat-critical': '#ff0000',
        'classified-open': '#00ff41',
        'classified-restricted': '#ffd700',
        'classified-confidential': '#ff6b35',
        'classified-secret': '#ff0000',
        'classified-top-secret': '#9400d3', // canónico (antes #ff00ff)
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
        sans: ['Roboto Condensed', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ticker-scroll': 'ticker-scroll 40s linear infinite',
        'radar-sweep': 'radar-sweep 4s linear infinite',
        'pulse-alert': 'pulse-alert 0.5s ease-in-out infinite',
        'glow-green': 'glow-green 2s ease-in-out infinite',
        'thinking-dots': 'thinking-dots 1.4s ease-in-out infinite',
        'degraded-blink': 'degraded-blink 2s ease-in-out infinite',
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
        'pulse-alert': {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'glow-green': {
          '0%,100%': { boxShadow: '0 0 4px #00ff41' },
          '50%': { boxShadow: '0 0 16px #00ff41' },
        },
        'thinking-dots': {
          '0%,100%': { opacity: '0.2' },
          '50%': { opacity: '1' },
        },
        'degraded-blink': {
          '0%,100%': { backgroundColor: '#ff6b35' },
          '50%': { backgroundColor: 'transparent' },
        },
      },
    },
  },
  plugins: [],
}
