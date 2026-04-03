import safeParser from "postcss-safe-parser";

export default {
  parser: safeParser,
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};