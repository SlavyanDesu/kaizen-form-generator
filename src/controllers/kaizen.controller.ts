import type { Request, Response } from "express";
import { generateKaizen } from "../services/kaizen.service.js";
import type { KaizenData } from "../types/kaizen.js";

export async function generateKaizenController(req: Request, res: Response) {
  try {
    const data = req.body as KaizenData;

    const result = await generateKaizen(data);

    return res.download(result.path, result.filename, (error) => {
      if (error) {
        console.error("Download error:", error);
      }
    });
  } catch (error) {
    console.error("Failed to generate Kaizen:", error);

    return res.status(500).send("Failed to generate Kaizen file.");
  }
}
