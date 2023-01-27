/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-jost)", ...defaultTheme.fontFamily.sans],
        body: ["var(--font-open-sans)", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
