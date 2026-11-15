import { spawn } from "node:child_process";
import net from "node:net";
import { fileURLToPath } from "node:url";

const port = 5173;
const viteBin = fileURLToPath(new URL("../node_modules/vite/bin/vite.js", import.meta.url));

function portFree(target) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(target, "0.0.0.0");
  });
}

if (!(await portFree(port))) {
  console.log(`InsideOut is already running at http://localhost:${port}`);
  process.exit(0);
}

const child = spawn(
  process.execPath,
  [viteBin, "--host", "0.0.0.0", "--port", String(port), "--strictPort"],
  { stdio: "inherit" },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
