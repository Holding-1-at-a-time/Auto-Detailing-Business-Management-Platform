import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00ae98",
          50: "#e6fff9",
          100: "#b3ffef",
          200: "#80ffe6",
          300: "#4dffdc",
          400: "#1affd3",
          500: "#00e6c9",
          600: "#00ae98",
          700: "#007a6b",
          800: "#00463d",
          900: "#00130f",
        },
        secondary: {
          DEFAULT: "#707070",
          50: "#f2f2f2",
          100: "#e6e6e6",
          200: "#cccccc",
          300: "#b3b3b3",
          400: "#999999",
          500: "#808080",
          600: "#707070",
          700: "#595959",
          800: "#404040",
          900: "#262626",
        },
        background: "#121212",
        foreground: "#ffffff",
        card: "#1a1a1a",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
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
      boxShadow: {
        neon: "0 0 5px rgba(0, 174, 152, 0.5), 0 0 10px rgba(0, 174, 152, 0.3), 0 0 15px rgba(0, 174, 152, 0.2)",
        "neon-lg": "0 0 10px rgba(0, 174, 152, 0.5), 0 0 20px rgba(0, 174, 152, 0.3), 0 0 30px rgba(0, 174, 152, 0.2)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
