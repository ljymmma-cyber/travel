import { describe, expect, it } from "vitest";

import { travelPlanSchema } from "@/features/ai/schemas/travel-plan.schema";

import { travelPlanFixture } from "./fixtures";

describe("travelPlanSchema", () => {
  it("accepts a valid travel plan", () => {
    expect(travelPlanSchema.safeParse(travelPlanFixture).success).toBe(true);
  });

  it("rejects day count mismatches", () => {
    const invalidPlan = {
      ...travelPlanFixture,
      durationDays: 3,
    };

    const result = travelPlanSchema.safeParse(invalidPlan);

    expect(result.success).toBe(false);
  });
});
