import ExcelJS from "exceljs";
import { randomUUID } from "node:crypto";
import path from "node:path";

import type { KaizenData } from "../schemas/kaizen.schema.js";
import sharp from "sharp";

const templatePath = path.resolve(
  import.meta.dirname,
  "../../templates/template.xlsx",
);

const fields = {
  theme: "E6",
  unit: "S7",
  department: "T7",
  date: "U7",
  suggestedBy: "E11",
  implementedBy: "E12",
  problem: "B15",
  whereFound: "J15",
  whenFound: "J18",
  countermeasure: "L15",
  whereImplement: "T15",
  whenImplement: "T18",
  afterKaizen: "B31",
  tangibleBenefit: "L31",
  intangibleBenefit: "P31",
  whereImplemented: "T31",
  whenImplemented: "T34",
  issueDate: "R51",
} as const;

// 1-indexed Excel coordinates; ExcelJS positions are 0-indexed → subtract 1 below.
const photoAreas = {
  before: { columnStart: 2, columnEnd: 11, rowStart: 21, rowEnd: 29 },
  after: { columnStart: 12, columnEnd: 21, rowStart: 21, rowEnd: 29 },
} as const;

async function addPhoto(
  workbook: ExcelJS.Workbook,
  worksheet: ExcelJS.Worksheet,
  photo: NonNullable<KaizenData["photographBefore"]>,
  area: (typeof photoAreas)[keyof typeof photoAreas],
): Promise<void> {
  const resized = await sharp(photo.buffer)
    .resize({
      width: 620,
      height: 170,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85 })
    .toBuffer({ resolveWithObject: true });
  const imageId = workbook.addImage({
    base64: resized.data.toString("base64"),
    extension: "jpeg",
  });

  worksheet.addImage(imageId, {
    tl: { col: area.columnStart - 1, row: area.rowStart - 1 },
    ext: { width: resized.info.width, height: resized.info.height },
    editAs: "oneCell",
  });
}

export async function generateKaizen(data: KaizenData) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(templatePath);
  const worksheet = workbook.getWorksheet("SOP-0811-F01");

  if (!worksheet) {
    throw new Error("Worksheet not found.");
  }

  for (const key of Object.keys(fields) as (keyof typeof fields)[]) {
    worksheet.getCell(fields[key]).value = data[key];
  }

  if (data.photographBefore) {
    await addPhoto(
      workbook,
      worksheet,
      data.photographBefore,
      photoAreas.before,
    );
  }

  if (data.photographAfter) {
    await addPhoto(workbook, worksheet, data.photographAfter, photoAreas.after);
  }

  const filename = `kaizen-${randomUUID()}.xlsx`;
  const buffer = await workbook.xlsx.writeBuffer();

  return {
    filename,
    buffer,
  };
}
