/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Manrope", "system-ui", "sans-serif"],
      },
      colors: {
        ewc: {
          // Dark theme palette — matches the EWC logo (black/white/blue)
          bg: "#0A0A0B",        // deepest background (page)
          surface: "#141518",   // panels and cards
          elevated: "#1C1E22",  // hover/elevated surfaces
          border: "#2A2D33",    // subtle borders
          text: "#F5F5F4",      // primary text (warm white)
          muted: "#9CA0A8",     // secondary text
          dim: "#6B6F76",       // tertiary text
          blue: "#2B8FE0",      // EWC brand blue (from logo ring)
          blueLight: "#4FA8F0", // lighter blue for hover
          accent: "#E5B568",    // warm gold for highlights
          positive: "#5DB87A",  // green for positive cash flow
          negative: "#E07B5C",  // soft red/orange for negative
        },
      },
    },
  },
  plugins: [],
};

