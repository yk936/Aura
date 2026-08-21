import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { executeAuraPipeline } from "./lib/core/pipeline.js";

// Local dev server middleware to handle /api/chat during npm run dev / preview
const apiChatPlugin = () => ({
  name: "api-chat-plugin",
  configureServer(server) {
    server.middlewares.use("/api/chat", async (req, res) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.end(JSON.stringify({ error: "Method not allowed. Use POST." }));
        return;
      }

      let bodyStr = "";
      req.on("data", (chunk) => {
        bodyStr += chunk;
      });

      req.on("end", async () => {
        try {
          const body = JSON.parse(bodyStr || "{}");
          const result = await executeAuraPipeline(body);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(result));
        } catch (err) {
          res.statusCode = err?.isHandledAuraError ? 500 : 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: err?.message || "An unexpected error occurred." }));
        }
      });
    });
  },
});

export default defineConfig({
  plugins: [react(), apiChatPlugin()],
  server: {
    port: 3000,
  },
});
