/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4169E1',      // Royal blue
        secondary: '#9370DB',    // Medium purple
        accent: '#7B68EE',       // Medium slate blue
        background: '#F0F4FF',   // Very light blue
        surface: '#ffffff',      // White cards
        text: '#1a1a1a',         // Near black
        textMuted: '#6b7280',    // Grey text
        success: '#10b981',      // Green status
        error: '#ef4444',        // Red errors
        userBubble: '#E6E6FA',   // Lavender for user
        beriBubble: '#ffffff',   // White for BERI
        gradient: {
          start: '#4169E1',      // Royal blue
          middle: '#7B68EE',     // Medium slate blue
          end: '#9370DB'         // Medium purple
        }
      },
      fontFamily: {
        sans: ['"Inter"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        mono: ['"Fira Code"', '"Consolas"', 'monospace']
      }
    },
  },
  plugins: [],
}
