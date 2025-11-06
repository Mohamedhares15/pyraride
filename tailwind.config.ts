import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "#E0E0E0",
        input: "#E0E0E0",
        ring: "#2D4A6E",
        background: "#FCFBF8",
        foreground: "#1E1E1E",

        primary: {
          DEFAULT: "#2D4A6E",
          foreground: "#FCFBF8",
        },
        secondary: {
          DEFAULT: "#F5F5F5",
          foreground: "#2D4A6E",
        },

        muted: {
          DEFAULT: "#F5F5F5",
          foreground: "#808080",
        },

        accent: {
          DEFAULT: "#D4AF37",
          foreground: "#1E1E1E",
        },

        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FCFBF8",
        },

        card: {
          DEFAULT: "#FCFBF8",
          foreground: "#1E1E1E",
        },

        popover: {
          DEFAULT: "#FCFBF8",
          foreground: "#1E1E1E",
        },

        "nile-blue": "#2D4A6E",
        "papyrus-white": "#FCFBF8",
        obsidian: "#1E1E1E",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "4xl": "2.5rem",
        "5xl": "3rem",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "Poppins", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
