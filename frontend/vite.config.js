import { cpSync, createReadStream, existsSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const root = path.dirname(fileURLToPath(import.meta.url));

function propertyMediaPlugin() {
  const mediaRoot = path.resolve(root, "../property_media");
  return {
    name: "property-media-plugin",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith("/property_media/")) {
          return next();
        }
        const relPath = decodeURIComponent(req.url.replace(/^\/property_media\//, "").split("?")[0]);
        const filePath = path.resolve(mediaRoot, relPath);
        if (existsSync(filePath) && statSync(filePath).isFile()) {
          const ext = path.extname(filePath).toLowerCase();
          const mimeTypes = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
            ".json": "application/json",
          };
          res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
          createReadStream(filePath).pipe(res);
          return;
        }
        next();
      });
    },
    closeBundle() {
      const dest = path.resolve(root, "dist/property_media");
      rmSync(dest, { recursive: true, force: true });
      cpSync(mediaRoot, dest, {
        recursive: true,
        dereference: true,
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), propertyMediaPlugin()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": { target: "http://127.0.0.1:5001", changeOrigin: true },
    },
  },
});
