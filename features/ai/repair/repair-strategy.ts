import type { ModelMessage } from "../prompts/prompt-template";
import type { ValidationErrorItem } from "../validator/json-validator";

export const maxRepairRetries = 2;

export type RepairInstructionInput = {
  rawOutput: string;
  validationErrors: ValidationErrorItem[];
};

export function shouldRepair(attempt: number) {
  return attempt < maxRepairRetries;
}

export function buildRepairMessages(input: RepairInstructionInput): ModelMessage[] {
  const errors = input.validationErrors
    .map((error) => `- ${error.field}: ${error.reason}. Fix: ${error.fixStrategy}`)
    .join("\n");

  return [
    {
      role: "system",
      content:
        "You repair invalid AI Travel Planner JSON. Return valid JSON only. Preserve correct itinerary decisions when possible.",
    },
    {
      role: "user",
      content: [
        "Repair the JSON object so it passes validation.",
        "",
        "Validation errors:",
        errors,
        "",
        "Invalid output:",
        input.rawOutput,
      ].join("\n"),
    },
  ];
}
