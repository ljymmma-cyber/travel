import { z } from "zod";

export const aiWarningSchema = z.object({
  code: z.string(),
  message: z.string(),
  severity: z.enum(["info", "warning", "critical"]),
});

export const aiBaseOutputSchema = z.object({
  confidence: z.number().min(0).max(1),
  warnings: z.array(aiWarningSchema).default([]),
});

export type AIWarning = z.infer<typeof aiWarningSchema>;
export type AIBaseOutput = z.infer<typeof aiBaseOutputSchema>;
