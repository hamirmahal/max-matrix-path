/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    includeSource: ["app/**/*.{js,ts,jsx,tsx}"],
  },
});
