import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10120F",
        panel: "#191C18",
        raised: "#222620",
        line: "#2E332C",
        lime: { DEFAULT: "#C6FF4D", dim: "#9FCC3C" },
        mute: "#9AA294",
      },
      fontFamily: { sans: ["var(--font-manrope)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
