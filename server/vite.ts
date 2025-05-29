import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../client/vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const rootDir = path.resolve(import.meta.dirname, "..");
  const clientDir = path.join(rootDir, "client");

  const serverOptions = {
    middlewareMode: true as const,
    hmr: { 
      server,
      port: 5000,
      protocol: 'http',
      host: 'localhost'
    },
    allowedHosts: ['localhost', '127.0.0.1'],
  };

  const vite = await createViteServer({
    ...viteConfig,
    root: rootDir,
    base: '/',
    configFile: false,
    server: serverOptions,
    publicDir: path.join(clientDir, 'public'),
    resolve: {
      alias: {
        '@': path.join(clientDir, 'src'),
        '@shared': path.join(rootDir, 'shared'),
      },
    },
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const indexTemplate = path.join(rootDir, "index.html");
      
      // always reload the index.html file from disk in case it changes
      let template = await fs.promises.readFile(indexTemplate, "utf-8");
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const rootDir = path.resolve(import.meta.dirname, "..");
  const distPath = path.join(rootDir, "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve static files from the dist directory
  app.use(express.static(distPath));
  app.use(express.static(rootDir));

  // Handle all other routes by serving index.html from root directory
  app.get('*', (_req, res) => {
    res.sendFile(path.join(rootDir, 'index.html'));
  });
}
