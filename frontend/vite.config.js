import { cpSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const root = path.dirname(fileURLToPath(import.meta.url));

function copyPropertyMedia() {
  return {
    name: "copy-property-media",
    closeBundle() {
      cpSync(path.resolve(root, "../property_media"), path.resolve(root, "dist/property_media"), {
        recursive: true,
        dereference: true,
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), copyPropertyMedia()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": { target: "http://127.0.0.1:5001", changeOrigin: true },
    },
  },
});
