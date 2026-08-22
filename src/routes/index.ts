import type { Application } from "express";
import multer from "multer";
import { generateKaizenController } from "../controllers/kaizen.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 2, fileSize: 10 * 1024 * 1024 },
});

export const routes = (app: Application): void => {
  app.post(
    "/api/kaizen/generate",
    upload.fields([
      { name: "photographBefore", maxCount: 1 },
      { name: "photographAfter", maxCount: 1 },
    ]),
    generateKaizenController,
  );
};
