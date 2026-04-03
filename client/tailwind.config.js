/** @type {import('tailwindcss').Config} */
const withAlpha = (variable, fallback) =>
  `color-mix(in oklab, var(${variable}, ${fallback}) calc(<alpha-value> * 100%), transparent)`;

module.exports = {
   darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: withAlpha("--color-border", "var(--border)"),
        input: "var(--input)",
        ring: withAlpha("--color-ring", "var(--ring)"),
        background: withAlpha("--color-background", "var(--background)"),
        foreground: withAlpha("--color-foreground", "var(--foreground)"),

        primary: {
          DEFAULT: withAlpha("--color-primary", "var(--primary)"),
          foreground: withAlpha("--color-primary-foreground", "var(--primary-foreground)"),
        },
        secondary: {
          DEFAULT: withAlpha("--color-secondary", "var(--secondary)"),
          foreground: withAlpha("--color-secondary-foreground", "var(--secondary-foreground)"),
        },
        destructive: {
          DEFAULT: withAlpha("--color-destructive", "var(--destructive)"),
          foreground: withAlpha("--color-destructive-foreground", "var(--destructive-foreground)"),
        },
        muted: {
          DEFAULT: withAlpha("--color-muted", "var(--muted)"),
          foreground: withAlpha("--color-muted-foreground", "var(--muted-foreground)"),
        },
        accent: {
          DEFAULT: withAlpha("--color-accent", "var(--accent)"),
          foreground: withAlpha("--color-accent-foreground", "var(--accent-foreground)"),
        },
        popover: {
          DEFAULT: withAlpha("--color-popover", "var(--popover)"),
          foreground: withAlpha("--color-popover-foreground", "var(--popover-foreground)"),
        },
        card: {
          DEFAULT: withAlpha("--color-card", "var(--card)"),
          foreground: withAlpha("--color-card-foreground", "var(--card-foreground)"),
        },
        success: {
          DEFAULT: withAlpha("--color-success", "var(--success)"),
          foreground: withAlpha("--color-success-foreground", "var(--success-foreground)"),
        },
        warning: {
          DEFAULT: withAlpha("--color-warning", "var(--warning)"),
          foreground: withAlpha("--color-warning-foreground", "var(--warning-foreground)"),
        },
        sidebar: {
          DEFAULT: withAlpha("--color-sidebar", "var(--sidebar)"),
          foreground: withAlpha("--color-sidebar-foreground", "var(--sidebar-foreground)"),
          primary: withAlpha("--color-sidebar-primary", "var(--sidebar-primary)"),
          "primary-foreground": withAlpha("--color-sidebar-primary-foreground", "var(--sidebar-primary-foreground)"),
          accent: withAlpha("--color-sidebar-accent", "var(--sidebar-accent)"),
          "accent-foreground": withAlpha("--color-sidebar-accent-foreground", "var(--sidebar-accent-foreground)"),
          border: withAlpha("--color-sidebar-border", "var(--sidebar-border)"),
          ring: withAlpha("--color-sidebar-ring", "var(--sidebar-ring)"),
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
