import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        argus: {
          orange: "#FF6600",
          "orange-hover": "#E65C00",
          "orange-light": "#FFF3EC",
          charcoal: "#293033",
          "charcoal-dark": "#1F2426",
          "charcoal-light": "#394347",
          "gray-bg": "#F8F9FA",
          "gray-card": "#FFFFFF",
          "gray-border": "#E5E7EB",
          "gray-subtle": "#F3F4F6",
        },
      },
    },
  },
  plugins: [],
};

export default config;
