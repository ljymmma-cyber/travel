import { describe, expect, it } from "vitest";

import { buildPlannerPrompt } from "@/features/ai/planner/prompt-builder";
import { buildPlanningContext } from "@/features/ai/planner/context-builder";
import { parseRequirements } from "@/features/ai/parser/requirement-parser";

import { plannerInputFixture } from "./fixtures";

describe("prompt builder", () => {
  it("renders registered planner prompts without unresolved variables", () => {
    const requirement = parseRequirements(plannerInputFixture, "en");
    const context = buildPlanningContext(requirement, new Date("2026-07-09T00:00:00.000Z"));
    const prompt = buildPlannerPrompt(context, "planner-v1");

    expect(prompt.version).toBe("planner-v1");
    expect(prompt.messages.length).toBeGreaterThan(1);
    expect(prompt.messages.map((message) => message.content).join("\n")).not.toContain("{{");
    expect(prompt.messages.at(-1)?.role).toBe("user");
  });
});
