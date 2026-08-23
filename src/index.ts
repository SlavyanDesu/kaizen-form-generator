import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { routes } from "./routes/generate.js";

const app = express();
const publicDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../public",
);

app.use(express.static(publicDir));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

routes(app);

// --- Vercel stuff ---
if (!process.env.VERCEL) {
  app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
}

// Keep this code below if you want to deploy to Vercel, it won't work without it
export default app;
