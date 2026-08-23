import type { Request, Response } from "express";
import { kaizenDataSchema, type KaizenData } from "../schemas/kaizen.schema.js";
import { generateKaizen } from "../services/kaizenGenerator.js";

interface UploadFiles {
  photographBefore?: Express.Multer.File[];
  photographAfter?: Express.Multer.File[];
}

export async function generateKaizenController(req: Request, res: Response) {
  try {
    const result = kaizenDataSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid Kaizen form data.",
        issues: result.error.issues,
      });
    }

    const files = (req.files as UploadFiles | undefined) ?? {};
    const data: KaizenData = {
      ...result.data,
      ...(files.photographBefore?.[0]
        ? { photographBefore: files.photographBefore[0] }
        : {}),
      ...(files.photographAfter?.[0]
        ? { photographAfter: files.photographAfter[0] }
        : {}),
    };

    const file = await generateKaizen(data);

    return res.attachment(file.filename).send(file.buffer);
  } catch (err) {
    console.error("Failed to generate Kaizen:", err);

    return res.status(500).send("Failed to generate Kaizen file.");
  }
}
