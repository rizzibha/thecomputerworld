import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    assetsInlineLimit: 4096,
    rollupOptions: {
      input: {
        main: "./index.html",
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
    host: true,
  },
});