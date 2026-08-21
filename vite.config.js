import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import chatHandler from "./api/chat.js";

function apiChatPlugin() {
  const handleApi = (req, res, next) => {
    const url = req.url || "";
    if (url === "/api/chat" || url.startsWith("/api/chat?")) {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", async () => {
        try {
          req.body = body ? JSON.parse(body) : {};
        } catch (e) {
          req.body = {};
        }

        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
        res.json = (data) => {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(data));
        };

        try {
          await chatHandler(req, res);
        } catch (err) {
          console.error("Error in plugin chat handler:", err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: err.message }));
          }
        }
      });
    } else {
      next();
    }
  };

  return {
    name: "api-chat-plugin",
    configureServer(server) {
      server.middlewares.use(handleApi);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleApi);
    },
  };
}

export default defineConfig({
  plugins: [react(), apiChatPlugin()],

  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },

  preview: {
    host: true,
    port: 4173,
    strictPort: true,
  },

  build: {
    target: "es2020",
    sourcemap: true,
  },
});
