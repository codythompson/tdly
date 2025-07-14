import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@typed": path.resolve(__dirname, "./src/typed"),
    },
  },
});
