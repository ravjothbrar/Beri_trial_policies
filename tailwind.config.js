/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e3a5f',      // Deep navy (Habs blue)
        secondary: '#c9a227',    // Gold accent
        background: '#f8f9fa',   // Light grey
        surface: '#ffffff',      // White cards
        text: '#1a1a1a',         // Near black
        textMuted: '#6b7280',    // Grey text
        success: '#10b981',      // Green status
        error: '#ef4444',        // Red errors
        userBubble: '#e8f4fc',   // Light blue for user
        beriBubble: '#ffffff'    // White for BERI
      },
      fontFamily: {
        sans: ['"Inter"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        mono: ['"Fira Code"', '"Consolas"', 'monospace']
      }
    },
  },
  plugins: [],
}
