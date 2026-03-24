import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#001a29",
          800: "#003b5c",
        },
        accent: {
          DEFAULT: "#007aff",
          light: "#00b4d8",
          lighter: "#90e0ef",
        },
        danger: {
          DEFAULT: "#ef4444",
          light: "#f87171",
        },
        success: {
          DEFAULT: "#10b981",
          light: "#4ade80",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fbbf24",
        },
        glass: {
          white: "rgba(255,255,255,0.15)",
          border: "rgba(255,255,255,0.20)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backdropBlur: {
        glass: "15px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        "glass-hover": "0 8px 40px 0 rgba(0, 122, 255, 0.4)",
        accent: "0 4px 15px rgba(0, 122, 255, 0.3)",
        "accent-hover": "0 6px 20px rgba(0, 122, 255, 0.5)",
        danger: "0 4px 20px rgba(239, 68, 68, 0.5)",
      },
      animation: {
        "pulse-danger": "pulse-danger 2s infinite",
        "pop-in": "pop-in 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
        "fade-in-up": "fade-in-up 0.4s ease-out",
        typing: "typing 1.2s infinite ease-in-out",
        bounce: "bounce-scroll 2s infinite",
      },
      keyframes: {
        "pulse-danger": {
          "0%": { boxShadow: "0 0 0 0 rgba(239, 68, 68, 0.7)" },
          "70%": { boxShadow: "0 0 0 30px rgba(239, 68, 68, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(239, 68, 68, 0)" },
        },
        "pop-in": {
          from: { opacity: "0", transform: "scale(0.8)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        typing: {
          "0%, 100%": { opacity: "0.3", transform: "translateY(0)" },
          "50%": { opacity: "1", transform: "translateY(-5px)" },
        },
        "bounce-scroll": {
          "0%, 20%, 50%, 80%, 100%": { transform: "translateY(0)" },
          "40%": { transform: "translateY(-15px)" },
          "60%": { transform: "translateY(-5px)" },
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".glass": {
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
          backgroundColor: "rgba(255,255,255,0.15)",
          border: "1px solid rgba(255,255,255,0.20)",
          borderRadius: "1.25rem",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        },
        ".glass-hover": {
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.25)",
            borderColor: "rgba(255,255,255,0.30)",
            transform: "translateY(-4px)",
            boxShadow: "0 8px 40px 0 rgba(0, 122, 255, 0.4)",
          },
        },
        ".text-primary": {
          color: "#ffffff",
        },
        ".text-secondary": {
          color: "rgba(255,255,255,0.80)",
        },
      });
    }),
  ],
};

export default config;
