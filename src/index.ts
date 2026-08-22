import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { routes } from "./routes/index.js";

const app = express();
const publicDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../public",
);

app.use(express.static(publicDirectory));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.sendFile(path.join(publicDirectory, "index.html"));
});

routes(app);

if (!process.env.VERCEL) {
  app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
}

export default app;
