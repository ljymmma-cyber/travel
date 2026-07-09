import { describe, expect, it } from "vitest";

import { parseRequirements } from "@/features/ai/parser/requirement-parser";

import { plannerInputFixture } from "./fixtures";

describe("parseRequirements", () => {
  it("normalizes planner input into hard constraints and preferences", () => {
    const result = parseRequirements(plannerInputFixture, "en");

    expect(result.normalizedInput.destination).toBe("Tokyo");
    expect(result.hardConstraints).toContain("Destination: Tokyo");
    expect(result.hardConstraints).toContain("Must-visit places: Senso-ji");
    expect(result.softPreferences.join("\n")).toContain("Interests: food, culture");
    expect(result.userIntent).toBe("Plan a 2-day trip to Tokyo.");
  });
});
