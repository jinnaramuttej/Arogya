import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Stitch Blue
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        // Surface tokens
        surface: {
          light:  "#ffffff",
          muted:  "#f9fafb",
          border: "#e5e7eb",
          dark:   "#111827",
          "dark-card":   "#1f2937",
          "dark-border": "#374151",
        },
        // Stitch Coral/Pink Accent
        accent: {
          DEFAULT: "#f43f5e",
          light:   "#fb7185",
          lighter: "#fda4af",
        },
        danger: {
          DEFAULT: "#ef4444",
          light:   "#f87171",
        },
        success: {
          DEFAULT: "#10b981",
          light:   "#4ade80",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light:   "#fbbf24",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card:          "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)",
        "card-hover":  "0 4px 16px 0 rgba(0,0,0,0.10)",
        brand:         "0 4px 15px rgba(220,38,38,0.25)",
        "brand-hover": "0 6px 20px rgba(220,38,38,0.35)",
        danger:        "0 4px 20px rgba(239,68,68,0.4)",
      },
      animation: {
        "pulse-danger": "pulse-danger 2s infinite",
        "pop-in":       "pop-in 0.3s cubic-bezier(0.23,1,0.32,1)",
        "fade-in-up":   "fade-in-up 0.4s ease-out",
        typing:         "typing 1.2s infinite ease-in-out",
        bounce:         "bounce-scroll 2s infinite",
      },
      keyframes: {
        "pulse-danger": {
          "0%":   { boxShadow: "0 0 0 0 rgba(239,68,68,0.7)" },
          "70%":  { boxShadow: "0 0 0 30px rgba(239,68,68,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(239,68,68,0)" },
        },
        "pop-in": {
          from: { opacity: "0", transform: "scale(0.8)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        typing: {
          "0%, 100%": { opacity: "0.3", transform: "translateY(0)" },
          "50%":      { opacity: "1",   transform: "translateY(-5px)" },
        },
        "bounce-scroll": {
          "0%, 20%, 50%, 80%, 100%": { transform: "translateY(0)" },
          "40%":  { transform: "translateY(-15px)" },
          "60%":  { transform: "translateY(-5px)" },
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".card": {
          backgroundColor: "#ffffff",
          border:          "1px solid #e5e7eb",
          borderRadius:    "0.75rem",
          boxShadow:       "0 1px 3px 0 rgba(0,0,0,0.06)",
        },
        ".dark .card": {
          backgroundColor: "#1f2937",
          borderColor:     "#374151",
        },
        ".text-primary": {
          color: "#111827",
        },
        ".dark .text-primary": {
          color: "#f9fafb",
        },
        ".text-secondary": {
          color: "#6b7280",
        },
        ".dark .text-secondary": {
          color: "#9ca3af",
        },
      });
    }),
  ],
};

export default config;
