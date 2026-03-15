/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#0A2540",
        secondary: "#6A11CB",
        gold: "#D4AF37",
        background: "#060D1A",
        card: "#0F1E30",
        "card-border": "#1A3050",
        "text-primary": "#FFFFFF",
        "text-secondary": "#94A3B8",
      },
      fontFamily: {
        outfit: ["Outfit_400Regular"],
        "outfit-medium": ["Outfit_500Medium"],
        "outfit-bold": ["Outfit_700Bold"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      }
    },
  },
  plugins: [],
}

