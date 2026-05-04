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
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        lg: "2.5rem",
      },
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",

        surface: {
          DEFAULT:  "hsl(var(--surface))",
          elevated: "hsl(var(--surface-elevated))",
        },

        hairline:  "hsl(var(--hairline))",
        "ink-soft":  "hsl(var(--ink-soft))",
        "ink-muted": "hsl(var(--ink-muted))",

        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        // Sidebar tokens
        sidebar: {
          DEFAULT:            "hsl(var(--surface))",
          foreground:         "hsl(var(--foreground))",
          primary:            "hsl(var(--primary))",
          "primary-foreground": "hsl(var(--primary-foreground))",
          accent:             "hsl(var(--accent))",
          "accent-foreground": "hsl(var(--accent-foreground))",
          border:             "hsl(var(--border))",
          ring:               "hsl(var(--ring))",
        },
      },

      borderRadius: {
        sm:   "calc(var(--radius) - 2px)",  // 0.125rem
        DEFAULT: "var(--radius)",            // 0.25rem
        md:   "calc(var(--radius) - 1px)",  // 0.1875rem
        lg:   "var(--radius)",              // 0.25rem
        xl:   "calc(var(--radius) + 4px)",  // 0.5rem
      },

      fontFamily: {
        sans:    ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Cormorant Garamond"', '"Times New Roman"', "ui-serif", "Georgia", "serif"],
      },

      letterSpacing: {
        luxury:    "0.32em",
        editorial: "0.18em",
      },

      boxShadow: {
        soft: "0 1px 2px hsl(145 31% 15% / 0.04), 0 8px 24px -12px hsl(145 31% 15% / 0.10)",
        lift: "0 2px 6px hsl(145 31% 15% / 0.06), 0 24px 48px -20px hsl(145 31% 15% / 0.18)",
      },

      transitionTimingFunction: {
        luxury: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },

      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "ken-burns": {
          "0%":   { transform: "scale(1.05)" },
          "100%": { transform: "scale(1.15)" },
        },
        shimmer: {
          "0%":   { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },

      animation: {
        "fade-in":   "fade-in 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "ken-burns": "ken-burns 20s ease-out both",
        shimmer:     "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;