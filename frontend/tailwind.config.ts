import type { Config } from "tailwindcss";

export default {
  content: [],
  theme: {
    extend: {
      colors: {
        bg: "#F5F5F5",
        surface: "#FFFFFF",
        surface2: "#FAFAFA",
        line: "#E0E0E0",
        line2: "#D0D0D0",
        tx: "#1A1A1A",
        "tx-mid": "#5A5A5A",
        "tx-soft": "#9A9A9A",
        green: {
          DEFAULT: "#166534",
          bg: "#F0FDF4",
        },
        amber: {
          DEFAULT: "#92400E",
          bg: "#FFFBEB",
        },
        red: {
          DEFAULT: "#991B1B",
          bg: "#FEF2F2",
        },
        blue: {
          DEFAULT: "#1E40AF",
          bg: "#EFF6FF",
          dim: "#DBEAFE",
        },
      },
    },
  },
} satisfies Config;
