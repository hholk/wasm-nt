import { defineConfig } from "vite";
import legacy from "@vitejs/plugin-legacy";

export default defineConfig({
  base: "/wasm-nt/",
  plugins: [legacy({
    targets: ["defaults", "not IE 11"],
  })],
  build: {
    sourcemap: true
  }
});
