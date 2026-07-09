import { describe, expect, it } from "vitest";

import { generateTravelPlan } from "@/features/ai/planner/planning-engine";
import type { AIModelClient } from "@/features/ai/types/engine.types";

import { plannerInputFixture, travelPlanFixture } from "./fixtures";

describe("generateTravelPlan", () => {
  it("returns a validated travel plan", async () => {
    const modelClient: AIModelClient = {
      requestJson: async () => ({
        rawText: JSON.stringify(travelPlanFixture),
        model: "test-model",
        inputTokens: 100,
        outputTokens: 200,
        latencyMs: 1,
      }),
    };

    const result = await generateTravelPlan(
      plannerInputFixture,
      {},
      {
        modelClient,
        now: () => new Date("2026-07-09T00:00:00.000Z"),
        requestIdFactory: () => "request_1",
      },
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.plan.destination).toBe("Tokyo");
      expect(result.log.success).toBe(true);
    }
  });

  it("repairs invalid model output before returning", async () => {
    let calls = 0;
    const modelClient: AIModelClient = {
      requestJson: async () => {
        calls += 1;

        return {
          rawText: calls === 1 ? "{ invalid" : JSON.stringify(travelPlanFixture),
          model: "test-model",
          inputTokens: 100,
          outputTokens: 200,
          latencyMs: 1,
        };
      },
    };

    const result = await generateTravelPlan(plannerInputFixture, {}, { modelClient });

    expect(result.ok).toBe(true);
    expect(calls).toBe(2);
    expect(result.log.retries).toBe(1);
  });
});
