import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#1E2A2F", soft: "#3B4A50", mute: "#66757B" },
        paper: { DEFAULT: "#FBF8F3", deep: "#F3EEE5", line: "#E4DCCD" },
        teal: { 50: "#ECF5F4", 100: "#D2E8E6", 500: "#2A817C", 600: "#1F6F6B", 700: "#185A57", 900: "#0E3634" },
        clay: { 50: "#FBF0EB", 100: "#F5DCD0", 500: "#C0623F", 600: "#A44F31" },
        gold: { 50: "#FBF5E6", 500: "#B8892B" },
      },
      fontFamily: {
        display: ["Iowan Old Style", "Palatino Linotype", "Palatino", "Georgia", "serif"],
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      maxWidth: { wrap: "68rem" },
    },
  },
  plugins: [],
};

export default config;
