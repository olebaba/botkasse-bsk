import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./komponenter/**/*.{js,ts,jsx,tsx,mdx}",
    "./ikoner/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'vipps-orange': '#ff5b24', // Vipps primary orange
        'vipps-orange-dark': '#e14d20', // Darker shade for hover effect
        'vipps-dark-blue': '#00315d', // Vipps dark blue for text
        'vipps-light-gray': '#f2f2f2', // Light gray for background buttons
        'vipps-dark-gray': '#4a4a4a', // Gray for content text
      },
      animation: {
        'spin-cool': 'spin 1s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite'
      },
    },
  },
  plugins: [],
};
export default config;
