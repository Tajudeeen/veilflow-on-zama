import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        veil: {
          black: "#070609",
          panel: "#111016",
          line: "#24212d",
          purple: "#8b5cf6",
          violet: "#6d45d8",
          yellow: "#f4c84a",
          ink: "#f7f3ff",
          muted: "#9e98ad"
        }
      },
      boxShadow: {
        quiet: "0 24px 70px rgba(0,0,0,0.32)"
      }
    }
  },
  plugins: []
};

export default config;
