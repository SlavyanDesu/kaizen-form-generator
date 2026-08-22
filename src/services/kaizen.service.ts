import ExcelJS from "exceljs";
import { randomUUID } from "node:crypto";
import path from "node:path";

import { fields } from "../configs/kaizen-fields.js";
import type { KaizenData } from "../schemas/kaizen.schema.js";
import sharp from "sharp";

const templatePath = path.resolve("templates/template.xlsx");

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
    throw new Error("Worksheet not found in the template.");
  }

  worksheet.getCell(fields.theme).value = data.theme;
  worksheet.getCell(fields.unit).value = data.unit;
  worksheet.getCell(fields.department).value = data.department;
  worksheet.getCell(fields.date).value = data.date;
  worksheet.getCell(fields.suggestedBy).value = data.suggestedBy;
  worksheet.getCell(fields.implementedBy).value = data.implementedBy;
  worksheet.getCell(fields.problem).value = data.problem;
  worksheet.getCell(fields.whereFound).value = data.whereFound;
  worksheet.getCell(fields.whenFound).value = data.whenFound;
  worksheet.getCell(fields.countermeasure).value = data.countermeasure;
  worksheet.getCell(fields.whereImplement).value = data.whereImplement;
  worksheet.getCell(fields.whenImplement).value = data.whenImplement;
  worksheet.getCell(fields.afterKaizen).value = data.afterKaizen;
  worksheet.getCell(fields.tangibleBenefit).value = data.tangibleBenefit;
  worksheet.getCell(fields.intangibleBenefit).value = data.intangibleBenefit;
  worksheet.getCell(fields.whereImplemented).value = data.whereImplemented;
  worksheet.getCell(fields.whenImplemented).value = data.whenImplemented;
  worksheet.getCell(fields.issueDate).value = data.issueDate;

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
