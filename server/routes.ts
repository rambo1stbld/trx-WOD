import type { Express } from "express";
import type { Server } from "http";

export async function registerRoutes(server: Server, app: Express) {
  // No backend routes needed for this frontend-only workout app
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });
}
