import type { Request, Response } from "express";
import path from "node:path";
import fs from "node:fs/promises";

const OUTPUT_DIR = path.resolve("tmp");

export async function downloadKaizenController(
  req: Request<{ filename: string }>,
  res: Response,
) {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: "Filename is required.",
      });
    }

    if (
      filename.includes("/") ||
      filename.includes("\\") ||
      filename.includes("..")
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid filename.",
      });
    }

    const filePath = path.join(OUTPUT_DIR, filename);

    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: "File not found.",
      });
    }

    return res.download(filePath, filename);
  } catch (error) {
    console.error("Failed to download Kaizen:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to download file.",
    });
  }
}
