import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { navy: "#14213D", cream: "#F4EDE0", sun: "#FFC845" },
      fontFamily: { display: ["var(--font-fredoka)", "system-ui", "sans-serif"], body: ["var(--font-nunito)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
