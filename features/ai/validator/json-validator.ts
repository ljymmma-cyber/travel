import { z } from "zod";

import { travelPlanSchema, type TravelPlan } from "../schemas/travel-plan.schema";
import type { AIEngineErrorCode } from "../types/engine.types";

export type ValidationErrorType = "JSON_PARSE" | "SCHEMA" | "BUSINESS_RULE";

export type ValidationErrorItem = {
  errorType: ValidationErrorType;
  code: AIEngineErrorCode;
  field: string;
  reason: string;
  fixStrategy: string;
};

export type ValidationSuccess = {
  ok: true;
  data: TravelPlan;
};

export type ValidationFailure = {
  ok: false;
  raw: string;
  errors: ValidationErrorItem[];
};

export type ValidationResult = ValidationSuccess | ValidationFailure;

export function validateTravelPlanOutput(rawOutput: string): ValidationResult {
  const parsed = parseJsonObject(rawOutput);

  if (!parsed.ok) {
    return {
      ok: false,
      raw: rawOutput,
      errors: [
        {
          errorType: "JSON_PARSE",
          code: "JSON_ERROR",
          field: "$",
          reason: parsed.reason,
          fixStrategy: "Return a single valid JSON object without Markdown fences or prose.",
        },
      ],
    };
  }

  const result = travelPlanSchema.safeParse(parsed.value);

  if (!result.success) {
    return {
      ok: false,
      raw: rawOutput,
      errors: result.error.issues.map(mapZodIssue),
    };
  }

  return {
    ok: true,
    data: result.data,
  };
}

export function parseJsonObject(
  rawOutput: string,
): { ok: true; value: unknown } | { ok: false; reason: string } {
  const normalized = stripMarkdownFence(rawOutput.trim());

  try {
    const value = JSON.parse(normalized);

    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return { ok: false, reason: "Output must be a JSON object." };
    }

    return { ok: true, value };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Unable to parse JSON.",
    };
  }
}

function stripMarkdownFence(value: string) {
  return value
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function mapZodIssue(issue: z.core.$ZodIssue): ValidationErrorItem {
  return {
    errorType: issue.code === "custom" ? "BUSINESS_RULE" : "SCHEMA",
    code: "VALIDATION_ERROR",
    field: issue.path.length > 0 ? issue.path.join(".") : "$",
    reason: issue.message,
    fixStrategy: inferFixStrategy(issue),
  };
}

function inferFixStrategy(issue: z.core.$ZodIssue) {
  if (issue.code === "invalid_type") {
    return "Use the required field type and avoid null unless the schema allows null.";
  }

  if (issue.code === "too_small") {
    return "Add the missing required data or increase the value to the schema minimum.";
  }

  if (issue.code === "too_big") {
    return "Reduce the value or array size to the schema maximum.";
  }

  return "Regenerate only the invalid field while preserving valid itinerary content.";
}
