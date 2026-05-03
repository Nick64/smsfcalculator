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
          forest: "#1F4232",
          sand: "#F7F4EE",
          gold: "#B8924A",
          rust: "#A04830",
          ink: "#1A1F1B",
        },
      },
    },
  },
  plugins: [],
};
