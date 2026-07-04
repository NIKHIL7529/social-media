import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#0f766e",
          deep: "#0b5f59",
          soft: "#e4f3f1",
        },
        ink: {
          DEFAULT: "#172221",
          muted: "#62706e",
        },
        line: "#d9e2e1",
        page: "#f4f7f6",
      },
      boxShadow: {
        card: "0 12px 30px rgba(23, 34, 33, 0.09)",
        soft: "0 10px 28px rgba(23, 34, 33, 0.07)",
      },
      maxWidth: {
        feed: "720px",
      },
    },
  },
  plugins: [],
};

export default config;
