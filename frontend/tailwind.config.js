/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff5ed",
          100: "#ffe8d5",
          200: "#ffcda9",
          300: "#ffab72",
          400: "#ff7f3a",
          500: "#fd5812", // primary
          600: "#ee3d08",
          700: "#c52c09",
          800: "#9c250f",
          900: "#7e2210",
        },
        ink: {
          900: "#0f1115",
          800: "#181b21",
          700: "#22262e",
          600: "#2d323c",
        },
      },
      fontFamily: {
        display: ["Poppins", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        premium: "0 10px 40px -10px rgba(253, 88, 18, 0.25)",
        card: "0 2px 16px rgba(15, 17, 21, 0.06)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%,100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.4s ease-out both",
        pulseSoft: "pulseSoft 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
