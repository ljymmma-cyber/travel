import { describe, expect, it } from "vitest";

import { diffTravelPlans } from "@/features/ai/diff/travel-plan-diff";
import {
  createReplanHistory,
  pushReplanHistory,
  redoReplan,
  undoReplan,
} from "@/features/ai/history/replan-history";
import { partiallyReplanTravelPlan } from "@/features/ai/replanning/replanning-engine";
import { buildModifyPrompt } from "@/features/ai/replanning/modify-prompt-builder";
import { applyTravelPlanPatch } from "@/features/ai/replanning/json-patch";
import { evaluateReplanConstraints } from "@/features/ai/replanning/constraint-engine";
import { findLockViolations, getLockedActivityPaths } from "@/features/ai/replanning/lock-engine";
import { validateReplanPatchScope } from "@/features/ai/replanning/patch-validator";
import type { AIModelClient } from "@/features/ai/types/engine.types";
import type { JsonPatchOperation, ReplanRequest } from "@/features/ai/schemas/replanning.schema";
import {
  replanPatchResponseSchema,
  replanRequestSchema,
} from "@/features/ai/schemas/replanning.schema";

import { travelPlanFixture } from "./fixtures";

const baseRequest: ReplanRequest = {
  action: "replace_activity",
  targetDayId: "day_1",
  targetActivityId: "activity_1_1",
  reasons: ["not_interested"],
  lockedActivityIds: [],
  favoriteActivityIds: [],
  constraints: {
    keepFavorites: true,
    avoidCrowds: false,
  },
};

const replacementActivity = {
  ...travelPlanFixture.days[0]!.activities[0]!,
  id: "activity_1_1_replaced",
  title: "Indoor Culture Alternative",
  type: "museum" as const,
  reason: "Better fit for user request.",
  userValue: "Keeps the day in the same area.",
};

function validPatchResponse(patches: JsonPatchOperation[]) {
  return {
    patches,
    explanation: {
      summary: "Changed only the target day.",
      changed: ["Updated one activity."],
      preserved: ["Preserved non-target days."],
      constraintChecks: ["Checked route and budget."],
      riskNotes: [],
    },
    metadata: {
      targetDayId: "day_1",
      changedActivityIds: ["activity_1_1_replaced"],
      preservedDayIds: ["day_2"],
      lockedActivityIds: [],
      promptVersion: "modify-v1",
    },
  };
}

describe("partial replanning schemas", () => {
  it("accepts a structured replace request", () => {
    expect(replanRequestSchema.safeParse(baseRequest).success).toBe(true);
  });

  it("requires at least one reason", () => {
    expect(replanRequestSchema.safeParse({ ...baseRequest, reasons: [] }).success).toBe(false);
  });

  it("accepts a JSON Patch response", () => {
    const result = replanPatchResponseSchema.safeParse(
      validPatchResponse([
        {
          op: "replace",
          path: "/days/0/activities/0",
          value: replacementActivity,
          reason: "Replace selected activity.",
        },
      ]),
    );

    expect(result.success).toBe(true);
  });

  it("rejects empty patch responses", () => {
    expect(replanPatchResponseSchema.safeParse(validPatchResponse([])).success).toBe(false);
  });
});

describe("JSON Patch application", () => {
  it("replaces one activity", () => {
    const result = applyTravelPlanPatch(travelPlanFixture, [
      {
        op: "replace",
        path: "/days/0/activities/0",
        value: replacementActivity,
        reason: "Replace selected activity.",
      },
    ]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.plan.days[0]?.activities[0]?.title).toBe("Indoor Culture Alternative");
      expect(result.plan.days[1]?.title).toBe(travelPlanFixture.days[1]?.title);
    }
  });

  it("deletes one activity", () => {
    const result = applyTravelPlanPatch(travelPlanFixture, [
      { op: "remove", path: "/days/0/activities/1", reason: "Delete selected activity." },
    ]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.plan.days[0]?.activities).toHaveLength(1);
    }
  });

  it("inserts one activity", () => {
    const result = applyTravelPlanPatch(travelPlanFixture, [
      {
        op: "add",
        path: "/days/0/activities/1",
        value: replacementActivity,
        reason: "Insert activity.",
      },
    ]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.plan.days[0]?.activities).toHaveLength(3);
    }
  });

  it("moves an activity inside the same day", () => {
    const result = applyTravelPlanPatch(travelPlanFixture, [
      {
        op: "move",
        from: "/days/0/activities/0",
        path: "/days/0/activities/1",
        reason: "Change order.",
      },
    ]);

    expect(result.ok).toBe(true);
  });

  it("rejects root replacement", () => {
    const result = applyTravelPlanPatch(travelPlanFixture, [
      {
        op: "replace",
        path: "/",
        value: travelPlanFixture,
        reason: "Unsafe full rewrite.",
      },
    ]);

    expect(result.ok).toBe(false);
  });

  it("rejects invalid paths", () => {
    const result = applyTravelPlanPatch(travelPlanFixture, [
      {
        op: "remove",
        path: "/days/9/activities/0",
        reason: "Invalid day.",
      },
    ]);

    expect(result.ok).toBe(false);
  });

  it("rejects schema-invalid patched plans", () => {
    const result = applyTravelPlanPatch(travelPlanFixture, [
      {
        op: "replace",
        path: "/days/0/activities/0/durationMinutes",
        value: -1,
        reason: "Invalid duration.",
      },
    ]);

    expect(result.ok).toBe(false);
  });
});

describe("patch scope and lock validation", () => {
  it("allows target day patches", () => {
    const issues = validateReplanPatchScope(travelPlanFixture, baseRequest, [
      {
        op: "replace",
        path: "/days/0/activities/0",
        value: replacementActivity,
        reason: "Valid target day patch.",
      },
    ]);

    expect(issues).toHaveLength(0);
  });

  it("blocks non-target day patches", () => {
    const issues = validateReplanPatchScope(travelPlanFixture, baseRequest, [
      {
        op: "replace",
        path: "/days/1/activities/0",
        value: replacementActivity,
        reason: "Wrong day.",
      },
    ]);

    expect(issues[0]?.code).toBe("OUT_OF_SCOPE");
  });

  it("blocks root patches before application", () => {
    const issues = validateReplanPatchScope(travelPlanFixture, baseRequest, [
      {
        op: "replace",
        path: "/",
        value: travelPlanFixture,
        reason: "Wrong scope.",
      },
    ]);

    expect(issues[0]?.code).toBe("UNSAFE_ROOT");
  });

  it("detects locked activity paths", () => {
    const paths = getLockedActivityPaths(travelPlanFixture, {
      ...baseRequest,
      lockedActivityIds: ["activity_1_1"],
    });

    expect(paths[0]?.path).toBe("/days/0/activities/0");
  });

  it("blocks locked activity replacement", () => {
    const violations = findLockViolations(
      travelPlanFixture,
      { ...baseRequest, lockedActivityIds: ["activity_1_1"] },
      [
        {
          op: "replace",
          path: "/days/0/activities/0",
          value: replacementActivity,
          reason: "Try locked replacement.",
        },
      ],
    );

    expect(violations[0]?.activityId).toBe("activity_1_1");
  });

  it("treats favorites as locked when keepFavorites is enabled", () => {
    const violations = findLockViolations(
      travelPlanFixture,
      {
        ...baseRequest,
        favoriteActivityIds: ["activity_1_1"],
        constraints: { keepFavorites: true, avoidCrowds: false },
      },
      [
        {
          op: "remove",
          path: "/days/0/activities/0",
          reason: "Try favorite removal.",
        },
      ],
    );

    expect(violations).toHaveLength(1);
  });
});

describe("constraint engine", () => {
  it("returns weather signals for rain plans", () => {
    const signals = evaluateReplanConstraints(travelPlanFixture, {
      ...baseRequest,
      action: "rain_plan",
    });

    expect(signals.some((signal) => signal.code === "WEATHER_REPLAN")).toBe(true);
  });

  it("returns accessibility signals", () => {
    const signals = evaluateReplanConstraints(travelPlanFixture, {
      ...baseRequest,
      action: "accessibility",
      constraints: { accessibility: "low-walking", keepFavorites: true, avoidCrowds: false },
    });

    expect(signals.some((signal) => signal.code === "ACCESSIBILITY_REPLAN")).toBe(true);
  });

  it("returns crowd signals", () => {
    const signals = evaluateReplanConstraints(travelPlanFixture, {
      ...baseRequest,
      action: "avoid_crowds",
      constraints: { avoidCrowds: true, keepFavorites: true },
    });

    expect(signals.some((signal) => signal.code === "CROWD_REPLAN")).toBe(true);
  });

  it("returns blocking signal when target day is missing", () => {
    const signals = evaluateReplanConstraints(travelPlanFixture, {
      ...baseRequest,
      targetDayId: "missing",
    });

    expect(signals[0]?.severity).toBe("blocking");
  });
});

describe("diff and history", () => {
  it("marks replaced activities as added and removed", () => {
    const patched = applyTravelPlanPatch(travelPlanFixture, [
      {
        op: "replace",
        path: "/days/0/activities/0",
        value: replacementActivity,
        reason: "Replace selected activity.",
      },
    ]);

    expect(patched.ok).toBe(true);
    if (patched.ok) {
      const diff = diffTravelPlans(travelPlanFixture, patched.plan);
      expect(diff.activities.some((activity) => activity.status === "added")).toBe(true);
      expect(diff.activities.some((activity) => activity.status === "removed")).toBe(true);
      expect(diff.preservedDayIds).toContain("day_2");
    }
  });

  it("marks field edits as modified", () => {
    const patched = applyTravelPlanPatch(travelPlanFixture, [
      {
        op: "replace",
        path: "/days/0/activities/0/title",
        value: "Renamed Senso-ji",
        reason: "Rename only.",
      },
    ]);

    expect(patched.ok).toBe(true);
    if (patched.ok) {
      const diff = diffTravelPlans(travelPlanFixture, patched.plan);
      expect(
        diff.activities.find((activity) => activity.activityId === "activity_1_1")?.status,
      ).toBe("modified");
    }
  });

  it("creates initial history", () => {
    const history = createReplanHistory(travelPlanFixture);

    expect(history.present.id).toBe(travelPlanFixture.id);
    expect(history.past).toHaveLength(0);
  });

  it("pushes history entries", () => {
    const history = createReplanHistory(travelPlanFixture);
    const entry = {
      id: "entry_1",
      createdAt: "2026-07-09T00:00:00.000Z",
      request: baseRequest,
      before: travelPlanFixture,
      after: travelPlanFixture,
      patchResponse: validPatchResponse([
        {
          op: "replace",
          path: "/days/0/activities/0",
          value: replacementActivity,
          reason: "Replace.",
        },
      ]),
      diff: diffTravelPlans(travelPlanFixture, travelPlanFixture),
    };

    expect(pushReplanHistory(history, entry).past).toHaveLength(1);
  });

  it("undoes the latest history entry", () => {
    const history = createReplanHistory(travelPlanFixture);
    const next = pushReplanHistory(history, {
      id: "entry_1",
      createdAt: "2026-07-09T00:00:00.000Z",
      request: baseRequest,
      before: travelPlanFixture,
      after: { ...travelPlanFixture, title: "Changed" },
      patchResponse: validPatchResponse([
        {
          op: "replace",
          path: "/title",
          value: "Changed",
          reason: "Test.",
        },
      ]),
      diff: diffTravelPlans(travelPlanFixture, travelPlanFixture),
    });

    expect(undoReplan(next).present.title).toBe(travelPlanFixture.title);
  });

  it("redoes the next history entry", () => {
    const history = createReplanHistory(travelPlanFixture);
    const changed = { ...travelPlanFixture, title: "Changed" };
    const pushed = pushReplanHistory(history, {
      id: "entry_1",
      createdAt: "2026-07-09T00:00:00.000Z",
      request: baseRequest,
      before: travelPlanFixture,
      after: changed,
      patchResponse: validPatchResponse([
        {
          op: "replace",
          path: "/title",
          value: "Changed",
          reason: "Test.",
        },
      ]),
      diff: diffTravelPlans(travelPlanFixture, changed),
    });

    expect(redoReplan(undoReplan(pushed)).present.title).toBe("Changed");
  });
});

describe("modify prompt and engine", () => {
  it("builds prompt messages that demand JSON Patch", () => {
    const messages = buildModifyPrompt(travelPlanFixture, baseRequest);
    const text = messages.map((message) => message.content).join("\n");

    expect(text).toContain("JSON Patch");
    expect(text).toContain("targetDay");
    expect(text).toContain("nonTargetDaysMustRemainUnchanged");
  });

  it("partial replanning applies a valid model patch", async () => {
    const modelClient: AIModelClient = {
      requestJson: async () => ({
        rawText: JSON.stringify(
          validPatchResponse([
            {
              op: "replace",
              path: "/days/0/activities/0",
              value: replacementActivity,
              reason: "Replace selected activity.",
            },
          ]),
        ),
        model: "test-model",
        inputTokens: 10,
        outputTokens: 20,
        latencyMs: 1,
      }),
    };

    const result = await partiallyReplanTravelPlan(
      travelPlanFixture,
      baseRequest,
      {},
      { modelClient },
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.plan.days[0]?.activities[0]?.title).toBe("Indoor Culture Alternative");
      expect(result.diff.preservedDayIds).toContain("day_2");
    }
  });

  it("partial replanning rejects model patches outside target day", async () => {
    const modelClient: AIModelClient = {
      requestJson: async () => ({
        rawText: JSON.stringify(
          validPatchResponse([
            {
              op: "replace",
              path: "/days/1/activities/0",
              value: replacementActivity,
              reason: "Wrong day.",
            },
          ]),
        ),
        model: "test-model",
        inputTokens: 10,
        outputTokens: 20,
        latencyMs: 1,
      }),
    };

    const result = await partiallyReplanTravelPlan(
      travelPlanFixture,
      baseRequest,
      {},
      { modelClient },
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("partial replanning returns JSON error for invalid model output", async () => {
    const modelClient: AIModelClient = {
      requestJson: async () => ({
        rawText: "not json",
        model: "test-model",
        inputTokens: 10,
        outputTokens: 20,
        latencyMs: 1,
      }),
    };

    const result = await partiallyReplanTravelPlan(
      travelPlanFixture,
      baseRequest,
      {},
      { modelClient },
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("JSON_ERROR");
    }
  });
});
