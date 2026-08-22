import type { Application } from "express";
import { generateKaizenController } from "../controllers/kaizen.controller.js";

export const routes = (app: Application): void => {
  app.get("/", (req, res) => {
    res.render("index");
  });

  app.post("/api/kaizen/generate", generateKaizenController);
};
