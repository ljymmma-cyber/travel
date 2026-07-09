import { describe, expect, it } from "vitest";

import { validateTravelPlanOutput } from "@/features/ai/validator/json-validator";

import { travelPlanFixture } from "./fixtures";

describe("validateTravelPlanOutput", () => {
  it("validates JSON output against the travel plan schema", () => {
    const result = validateTravelPlanOutput(JSON.stringify(travelPlanFixture));

    expect(result.ok).toBe(true);
  });

  it("returns structured errors for invalid JSON", () => {
    const result = validateTravelPlanOutput("not json");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.code).toBe("JSON_ERROR");
      expect(result.errors[0]?.field).toBe("$");
    }
  });
});
