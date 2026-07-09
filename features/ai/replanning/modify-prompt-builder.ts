import type { TravelPlan } from "../schemas/travel-plan.schema";
import type { ReplanRequest } from "../schemas/replanning.schema";
import type { ModelMessage } from "../prompts/prompt-template";
import { evaluateReplanConstraints, summarizeDayForReplan } from "./constraint-engine";

export const modifyPromptVersion = "modify-v1";

export function buildModifyPrompt(plan: TravelPlan, request: ReplanRequest): ModelMessage[] {
  const targetDay = plan.days.find((day) => day.id === request.targetDayId);
  const preservedDays = plan.days
    .filter((day) => day.id !== request.targetDayId)
    .map((day) => ({
      id: day.id,
      dayIndex: day.dayIndex,
      title: day.title,
      activityIds: day.activities.map((activity) => activity.id),
    }));
  const constraintSignals = evaluateReplanConstraints(plan, request);

  return [
    {
      role: "system",
      content: [
        "You are AI Travel Planner Partial Replanner.",
        "You are not a chat assistant.",
        "Return JSON only.",
        "Return a JSON Patch response only; do not return the full TravelPlan.",
        "Minimize impact: modify the target day only and preserve all non-target days exactly.",
        "Never modify locked or favorite activities.",
      ].join("\n"),
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          task: "Create a minimal JSON Patch for partial replanning.",
          outputShape: {
            patches: [
              {
                op: "add | remove | replace | move",
                path: "/days/{targetDayIndex}/...",
                value: "required for add/replace",
                from: "required for move",
                reason: "why this exact patch is needed",
              },
            ],
            explanation: {
              summary: "human readable reason",
              changed: ["what changed"],
              preserved: ["what stayed unchanged"],
              constraintChecks: ["budget/time/weather/route checks"],
              riskNotes: ["what user should verify"],
            },
            metadata: {
              targetDayId: request.targetDayId,
              changedActivityIds: [],
              preservedDayIds: [],
              lockedActivityIds: [],
              promptVersion: modifyPromptVersion,
            },
          },
          originalPlanContext: {
            planId: plan.id,
            destination: plan.destination,
            durationDays: plan.durationDays,
            totalBudget: plan.totalBudget,
          },
          request,
          targetDay: targetDay ? summarizeDayForReplan(targetDay) : null,
          nonTargetDaysMustRemainUnchanged: preservedDays,
          constraintSignals,
          patchRules: [
            "Patch paths must target the selected day only.",
            "Do not patch /days as a full array.",
            "Do not patch the root object.",
            "Use remove for Delete Activity.",
            "Use replace for Replace Activity or Change Budget.",
            "Use add with /activities/{index} for Insert Activity.",
            "Use move only inside the same target day.",
            "Preserve lockedActivityIds and favoriteActivityIds.",
          ],
        },
        null,
        2,
      ),
    },
  ];
}
