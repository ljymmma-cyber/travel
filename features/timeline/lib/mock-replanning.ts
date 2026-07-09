import type { Activity, DayPlan, TravelPlan } from "@/features/ai/schemas/travel-plan.schema";
import type { ReplanPatchResponse, ReplanRequest } from "@/features/ai/schemas/replanning.schema";

export function createMockReplanPatch(
  plan: TravelPlan,
  request: ReplanRequest,
): ReplanPatchResponse {
  const dayIndex = plan.days.findIndex((day) => day.id === request.targetDayId);

  if (dayIndex < 0) {
    throw new Error("Target day not found.");
  }

  const day = plan.days[dayIndex];
  const activityIndex = request.targetActivityId
    ? day.activities.findIndex((activity) => activity.id === request.targetActivityId)
    : 0;
  const safeActivityIndex = Math.max(0, activityIndex);
  const lockedActivityIds = request.lockedActivityIds;
  const preservedDayIds = plan.days.filter((item) => item.id !== day.id).map((item) => item.id);

  if (request.action === "delete_activity" && request.targetActivityId) {
    return {
      patches: [
        {
          op: "remove",
          path: `/days/${dayIndex}/activities/${safeActivityIndex}`,
          reason: "User asked to delete this activity and keep the rest of the day intact.",
        },
      ],
      explanation: buildExplanation(
        "Removed one activity with minimal impact.",
        day,
        preservedDayIds,
      ),
      metadata: {
        targetDayId: day.id,
        changedActivityIds: [request.targetActivityId],
        preservedDayIds,
        lockedActivityIds,
        promptVersion: "mock-modify-v1",
      },
    };
  }

  if (request.action === "change_budget") {
    const budgetMax = request.constraints.budgetMax ?? Math.max(40, day.dailyBudget.max * 0.8);

    return {
      patches: [
        {
          op: "replace",
          path: `/days/${dayIndex}/dailyBudget`,
          value: {
            ...day.dailyBudget,
            max: Math.round(budgetMax),
            min: Math.min(day.dailyBudget.min, Math.round(budgetMax * 0.65)),
            shoppingBuffer: Math.round(day.dailyBudget.shoppingBuffer * 0.6),
            confidence: 0.66,
          },
          reason:
            "Budget cap changed, so the day budget is tightened without changing non-target days.",
        },
      ],
      explanation: buildExplanation("Adjusted the target day budget only.", day, preservedDayIds),
      metadata: {
        targetDayId: day.id,
        changedActivityIds: [],
        preservedDayIds,
        lockedActivityIds,
        promptVersion: "mock-modify-v1",
      },
    };
  }

  if (request.action === "insert_activity") {
    const insertIndex = Math.min(day.activities.length, safeActivityIndex + 1);
    const newActivity = buildInsertedActivity(day, request);

    return {
      patches: [
        {
          op: "add",
          path: `/days/${dayIndex}/activities/${insertIndex}`,
          value: newActivity,
          reason:
            "Inserted a new activity into the target day while preserving surrounding activities.",
        },
      ],
      explanation: buildExplanation(
        "Inserted one new activity into the selected day.",
        day,
        preservedDayIds,
      ),
      metadata: {
        targetDayId: day.id,
        changedActivityIds: [newActivity.id],
        preservedDayIds,
        lockedActivityIds,
        promptVersion: "mock-modify-v1",
      },
    };
  }

  const replacement = buildReplacementActivity(day.activities[safeActivityIndex], request);

  return {
    patches: [
      {
        op: "replace",
        path: `/days/${dayIndex}/activities/${safeActivityIndex}`,
        value: replacement,
        reason:
          "Replaced the selected activity while preserving the day structure and non-target days.",
      },
    ],
    explanation: buildExplanation(
      "Replaced one activity based on the selected modification reason.",
      day,
      preservedDayIds,
    ),
    metadata: {
      targetDayId: day.id,
      changedActivityIds: [replacement.id],
      preservedDayIds,
      lockedActivityIds,
      promptVersion: "mock-modify-v1",
    },
  };
}

function buildReplacementActivity(activity: Activity, request: ReplanRequest): Activity {
  if (request.action === "rain_plan") {
    return {
      ...activity,
      id: `${activity.id}_rain`,
      title: "Indoor Culture Backup",
      type: "museum",
      location: {
        ...activity.location,
        name: "Indoor museum or gallery near the same area",
        sourceStatus: "estimated",
      },
      budget: {
        ...activity.budget,
        max: Math.max(activity.budget.max, 20),
        category: "ticket",
      },
      reason: "Rain plan requested, so this swaps the outdoor block for a nearby indoor option.",
      userValue: "You keep the route shape but reduce weather risk.",
      confidence: 0.68,
      warnings: [
        {
          code: "MOCK_RAIN_REPLAN",
          message: "Verify live opening hours before using this rain backup.",
          severity: "info",
          fixStrategy: "Connect place and weather APIs in Sprint 4.",
        },
      ],
    };
  }

  if (request.action === "more_food") {
    return {
      ...activity,
      id: `${activity.id}_food`,
      title: "Local Food Stop",
      type: "restaurant",
      budget: {
        ...activity.budget,
        min: Math.max(activity.budget.min, 18),
        max: Math.max(activity.budget.max, 40),
        category: "food",
      },
      reason: "User asked for more food, so this block becomes a route-compatible food experience.",
      userValue: "You get a stronger local food moment without changing the rest of the itinerary.",
      confidence: 0.7,
    };
  }

  if (request.action === "more_museums") {
    return {
      ...activity,
      id: `${activity.id}_museum`,
      title: "Museum Alternative",
      type: "museum",
      reason:
        "User asked for more museums, so this replaces the selected block with a culture-heavy option.",
      userValue:
        "The day becomes more aligned with museum interest while staying in the same area.",
      confidence: 0.7,
    };
  }

  return {
    ...activity,
    id: `${activity.id}_modified`,
    title: request.customInstruction || "Lower-friction Alternative",
    reason: "User requested a targeted replacement, so only this activity changes.",
    userValue: "The rest of the route stays familiar while this specific concern is resolved.",
    confidence: 0.67,
  };
}

function buildInsertedActivity(day: DayPlan, request: ReplanRequest): Activity {
  const base = day.activities[0];

  return {
    ...base,
    id: `${day.id}_insert_${Date.now()}`,
    title:
      request.action === "more_shopping"
        ? "Curated Shopping Window"
        : request.action === "more_food"
          ? "Snack and Cafe Break"
          : "Flexible Local Add-on",
    type:
      request.action === "more_shopping"
        ? "shopping"
        : request.action === "more_food"
          ? "cafe"
          : "free-time",
    timeSlot: "flexible",
    startTime: null,
    durationMinutes: 75,
    budget: {
      ...base.budget,
      min: request.action === "more_shopping" ? 20 : 10,
      max: request.action === "more_shopping" ? 80 : 30,
      category: request.action === "more_shopping" ? "shopping" : "food",
      confidence: 0.62,
    },
    restaurant: null,
    transportToNext: null,
    reason: "Inserted as a flexible block so existing route anchors do not move.",
    userValue: "Adds optional value without forcing a full day rewrite.",
    sourceStatus: "estimated",
    confidence: 0.64,
    warnings: [],
    alternatives: [],
  };
}

function buildExplanation(summary: string, day: DayPlan, preservedDayIds: string[]) {
  return {
    summary,
    changed: [`Updated ${day.title}.`],
    preserved: [
      `Preserved ${preservedDayIds.length} non-target day(s).`,
      "Kept locked and favorite items unchanged.",
    ],
    constraintChecks: [
      "Checked target day scope.",
      "Kept patch minimal.",
      "Preserved route continuity where possible.",
    ],
    riskNotes: ["This is mock replanning until the real AI modify endpoint is connected."],
  };
}
