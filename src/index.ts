import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { routes } from "./routes/index.js";

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

routes(app);

if (!process.env.VERCEL) {
  app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
}

export default app;
