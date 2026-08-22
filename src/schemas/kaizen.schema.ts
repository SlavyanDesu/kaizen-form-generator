import { z } from "zod";

const requiredText = z.string().trim().min(1);
const optionalText = z.string().trim().optional().default("");

function getDateParts(value: string): [number, number, number] | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return undefined;
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

const dateText = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parts = getDateParts(value);

    if (!parts) {
      return false;
    }

    const [year, month, day] = parts;
    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }, "Invalid calendar date")
  .transform((value) => {
    const parts = getDateParts(value);

    if (!parts) {
      throw new Error("Invalid date format");
    }

    const [year, month, day] = parts;

    return new Date(year, month - 1, day);
  });

export const kaizenDataSchema = z.object({
  theme: requiredText,
  unit: requiredText,
  department: requiredText,
  date: dateText,
  suggestedBy: requiredText,
  implementedBy: requiredText,
  problem: requiredText,
  whereFound: requiredText,
  whenFound: dateText,
  countermeasure: requiredText,
  whereImplement: requiredText,
  whenImplement: dateText,
  afterKaizen: requiredText,
  tangibleBenefit: optionalText,
  intangibleBenefit: optionalText,
  whereImplemented: requiredText,
  whenImplemented: dateText,
  issueDate: dateText,
});

export interface PhotoUpload {
  buffer: Buffer;
  mimetype: string;
}

export type KaizenData = z.infer<typeof kaizenDataSchema> & {
  photographBefore?: PhotoUpload;
  photographAfter?: PhotoUpload;
};
