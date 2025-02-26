/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      xs: "320px",
      sc: "1100px",
      ...defaultTheme.screens,
    },
    extend: {
      fontFamily: {
        display: ["var(--font-jost)", ...defaultTheme.fontFamily.sans],
        body: ["var(--font-open-sans)", ...defaultTheme.fontFamily.sans],
      },
      animation: {
        "bg-fade-in": "bg-fade-in 0.333s ease-in-out forwards",
        "bg-fade-out": "bg-fade-out 0.333s ease-in-out forwards",
      },
      keyframes: {
        "bg-fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 0.95 },
        },
        "bg-fade-out": {
          "0%": { opacity: 0.95 },
          "100%": { opacity: 0 },
        },
      },
      backgroundImage: {
        navbar: "url('/images/hero-header.png')",
        about: "url('/images/about.png')",
        pm: "url('/images/pm-frame.png')",
        aboutstars: "url('/images/aboutstars.png')",
        partners: "url('/images/partners.png')",
        user: "url('/images/user-button.png')",
        platinum: "url('/images/bg-platinum.png')",
        gold: "url('/images/bg-gold.png')",
        silver: "url('/images/bg-silver.png')",
        bronze: "url('/images/bg-bronze.png')",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
