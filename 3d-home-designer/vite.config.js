import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function localAI() {
  const routes = new Set([
    "status",
    "classify-image",
    "parse-floorplan",
    "scene-command",
  ]);
  return {
    name: "homer-local-ai",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, "http://localhost");
        if (!url.pathname.startsWith("/api/")) return next();
        const route = url.pathname.slice(5);
        res.setHeader("Content-Type", "application/json");
        if (!routes.has(route)) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ message: "Unknown API route" }));
        }
        try {
          const { default: handler } = await import(
            `${server.config.root}/api/${route}.js`
          );
          const init = { method: req.method, headers: req.headers };
          if (!["GET", "HEAD"].includes(req.method)) {
            init.body = req;
            init.duplex = "half";
          }
          const response = await handler(new Request(url, init));
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch {
          res.statusCode = 500;
          res.end(
            JSON.stringify({
              message:
                "The local AI route failed. Check the server configuration.",
            }),
          );
        }
      });
    },
  };
}
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  if (env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;
  if (process.env.HOMER_AI_KEY)
    process.env.OPENAI_API_KEY = process.env.HOMER_AI_KEY;
  return { plugins: [react(), localAI()] };
});
