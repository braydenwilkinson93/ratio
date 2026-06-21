import { z } from "zod";

export const authSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(5)
    .refine(
      (value) =>
        z.string().email().safeParse(value).success ||
        /^\+?[1-9]\d{7,14}$/.test(value.replace(/[\s()-]/g, "")),
      "Enter a valid email address or phone number"
    ),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const registerSchema = authSchema.extend({
  displayName: z.string().trim().min(2).max(60)
});

export const pollSchema = z.object({
  question: z.string().trim().min(10).max(240),
  description: z.string().trim().min(20).max(2000),
  category: z.string().trim().min(2).max(80),
  optionA: z.string().trim().min(1).max(120),
  optionB: z.string().trim().min(1).max(120),
  closesAt: z.string().trim().optional()
}).superRefine((data, context) => {
  if (data.optionA.toLowerCase() === data.optionB.toLowerCase()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["optionB"],
      message: "Poll options must be different"
    });
  }

  if (data.closesAt) {
    const closesAt = new Date(data.closesAt);
    if (Number.isNaN(closesAt.getTime())) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["closesAt"],
        message: "Enter a valid close date"
      });
    } else if (closesAt <= new Date()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["closesAt"],
        message: "Close date must be in the future"
      });
    }
  }
});

export const voteSchema = z.object({
  pollId: z.string().cuid(),
  optionId: z.string().cuid(),
  confidence: z.coerce.number().int().min(1).max(5)
});

export const argumentSchema = z.object({
  pollId: z.string().cuid(),
  side: z.enum(["FOR", "AGAINST"]),
  title: z.string().trim().min(5).max(140),
  summary: z.string().trim().min(20).max(500)
});

export const rebuttalSchema = z.object({
  argumentId: z.string().cuid(),
  body: z.string().trim().min(10).max(500)
});
