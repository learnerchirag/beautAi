/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
    "./store/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Core brand
        teal: "#008080",
        "core-black": "#000000",
        "core-white": "#ffffff",
        "deep-crimson": "#a20021",
        // Greyscale
        "grey-50": "#fafafa",
        "grey-100": "#f5f5f5",
        "grey-200": "#eeeeee",
        "grey-400": "#bdbdbd",
        "grey-600": "#757575",
        // Extended palette
        "crimson-50": "#f6e5e9",
        "creamy-vanilla": "#fff1d0",
        "semantic-green": "#53d86a",
      },
      fontFamily: {
        josefin: ["JosefinSans_600SemiBold", "sans-serif"],
        "josefin-bold": ["JosefinSans_700Bold", "sans-serif"],
        "josefin-regular": ["JosefinSans_400Regular", "sans-serif"],
      },
      borderRadius: {
        xs: "8px",
        sm: "16px",
        md: "24px",
        lg: "32px",
        pill: "9999px",
      },

      boxShadow: {
        card: "0px 12px 12px 0px rgba(0,0,0,0.04), 0px 24px 24px 0px rgba(0,0,0,0.08), 0px 32px 32px 0px rgba(0,0,0,0.04), 0px 64px 64px 0px rgba(0,0,0,0.12)",
      },
      fontSize: {
        "body-sm": ["12px", { lineHeight: "1.3", letterSpacing: "-0.3px" }],
        "body-md": ["14px", { lineHeight: "1.3", letterSpacing: "-0.35px" }],
        "body-lg": ["16px", { lineHeight: "1.3", letterSpacing: "-0.4px" }],
        "display-md": ["21px", { lineHeight: "1.3", letterSpacing: "-0.63px" }],
        "display-xl": ["40px", { lineHeight: "1.1", letterSpacing: "-1.6px" }],
      },
    },
  },
  plugins: [],
};
