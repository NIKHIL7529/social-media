import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          deep: "rgb(var(--color-accent) / <alpha-value>)",
          soft: "rgb(var(--color-accent-soft) / <alpha-value>)",
          contrast: "rgb(var(--color-accent-contrast) / <alpha-value>)",
          hover: "rgb(var(--color-accent-hover) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--color-ink) / <alpha-value>)",
          muted: "rgb(var(--color-ink-muted) / <alpha-value>)",
        },
        line: "rgb(var(--color-line) / <alpha-value>)",
        page: "rgb(var(--color-page) / <alpha-value>)",
        surface: { DEFAULT: "rgb(var(--color-surface) / <alpha-value>)", raised: "rgb(var(--color-surface-raised) / <alpha-value>)" },
        danger: { DEFAULT: "rgb(var(--color-danger) / <alpha-value>)", soft: "rgb(var(--color-danger-soft) / <alpha-value>)" },
      },
      boxShadow: {
        card: "var(--shadow-card)",
        soft: "var(--shadow-soft)",
      },
      maxWidth: {
        feed: "720px",
      },
    },
  },
  plugins: [],
};

export default config;
