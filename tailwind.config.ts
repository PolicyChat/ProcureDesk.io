import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0C2136",
          soft: "#16324D",
        },
        navy: {
          50: "#F2F6FA",
          100: "#DFE9F2",
          700: "#16324D",
          800: "#0F2A43",
          900: "#0C2136",
        },
        moss: {
          50: "#EDF7F2",
          100: "#D3EEE1",
          500: "#0E9F6E",
          600: "#0B8A5F",
          700: "#097550",
        },
        sand: {
          50: "#FAF8F4",
          100: "#F3EFE7",
          200: "#E8E1D3",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        wrap: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;
