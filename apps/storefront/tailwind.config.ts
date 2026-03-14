import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        accent: "#f97316",
        ink: "#0f172a",
        steel: "#334155"
      }
    }
  },
  plugins: []
};

export default config;
