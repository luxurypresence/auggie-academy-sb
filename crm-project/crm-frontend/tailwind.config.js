/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#4F7CFF",
          foreground: "#FFFFFF",
          50: "#E8EFFF",
          100: "#D1DFFF",
          500: "#4F7CFF",
          600: "#3D6AFF",
          700: "#2B58FF",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom status colors
        status: {
          new: {
            bg: "#E8EFFF",
            text: "#4F7CFF",
          },
          contacted: {
            bg: "#E0F5F5",
            text: "#00B5AD",
          },
          qualified: {
            bg: "#EDE9FF",
            text: "#5B4FFF",
          },
          proposal: {
            bg: "#FFF9E6",
            text: "#F2A600",
          },
          negotiation: {
            bg: "#FFE8D6",
            text: "#E86A33",
          },
          won: {
            bg: "#E8F5E9",
            text: "#4CAF50",
          },
          lost: {
            bg: "#FFE8E8",
            text: "#E53935",
          },
        },
      },
      backgroundColor: {
        app: "#F5F6FA",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
