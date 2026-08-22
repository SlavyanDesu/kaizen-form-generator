import ExcelJS from "exceljs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import fs from "node:fs/promises";

import { fields } from "../config/kaizen-fields.js";
import type { KaizenData } from "../types/kaizen.js";

const TEMPLATE_PATH = path.resolve("templates/template.xlsx");
const TMP_DIR = path.resolve("tmp");

export async function generateKaizen(data: KaizenData) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(TEMPLATE_PATH);
  const worksheet = workbook.getWorksheet("SOP-0811-F01");

  if (!worksheet) {
    throw new Error("Worksheet not found in the template.");
  }

  worksheet.getCell(fields.theme).value = data.theme;

  await fs.mkdir(TMP_DIR, { recursive: true });

  const filename = `kaizen-${randomUUID()}.xlsx`;
  const outputPath = path.join(TMP_DIR, filename);

  await workbook.xlsx.writeFile(outputPath);

  return {
    filename,
    path: outputPath,
  };
}
