import type { Activity, TravelPlan } from "../schemas/travel-plan.schema";

export type DiffStatus = "added" | "modified" | "removed" | "unchanged";

export type ActivityDiff = {
  activityId: string;
  title: string;
  dayId: string;
  status: DiffStatus;
  changedFields: string[];
};

export type TravelPlanDiff = {
  activities: ActivityDiff[];
  changedDayIds: string[];
  preservedDayIds: string[];
};

export function diffTravelPlans(before: TravelPlan, after: TravelPlan): TravelPlanDiff {
  const beforeActivities = flattenActivities(before);
  const afterActivities = flattenActivities(after);
  const beforeById = new Map(beforeActivities.map((item) => [item.activity.id, item]));
  const afterById = new Map(afterActivities.map((item) => [item.activity.id, item]));
  const activityIds = new Set([...beforeById.keys(), ...afterById.keys()]);
  const activities: ActivityDiff[] = [];

  for (const activityId of activityIds) {
    const beforeItem = beforeById.get(activityId);
    const afterItem = afterById.get(activityId);

    if (!beforeItem && afterItem) {
      activities.push({
        activityId,
        title: afterItem.activity.title,
        dayId: afterItem.dayId,
        status: "added",
        changedFields: ["activity"],
      });
      continue;
    }

    if (beforeItem && !afterItem) {
      activities.push({
        activityId,
        title: beforeItem.activity.title,
        dayId: beforeItem.dayId,
        status: "removed",
        changedFields: ["activity"],
      });
      continue;
    }

    if (!beforeItem || !afterItem) {
      continue;
    }

    const changedFields = getActivityChangedFields(beforeItem.activity, afterItem.activity);
    activities.push({
      activityId,
      title: afterItem.activity.title,
      dayId: afterItem.dayId,
      status:
        changedFields.length > 0 || beforeItem.dayId !== afterItem.dayId ? "modified" : "unchanged",
      changedFields: beforeItem.dayId !== afterItem.dayId ? ["day"] : changedFields,
    });
  }

  const changedDayIds = Array.from(
    new Set(
      activities
        .filter((activity) => activity.status !== "unchanged")
        .map((activity) => activity.dayId),
    ),
  );

  return {
    activities,
    changedDayIds,
    preservedDayIds: after.days
      .map((day) => day.id)
      .filter((dayId) => !changedDayIds.includes(dayId)),
  };
}

function flattenActivities(plan: TravelPlan) {
  return plan.days.flatMap((day) =>
    day.activities.map((activity) => ({
      dayId: day.id,
      activity,
    })),
  );
}

function getActivityChangedFields(before: Activity, after: Activity) {
  const fields: Array<keyof Activity> = [
    "title",
    "type",
    "startTime",
    "durationMinutes",
    "location",
    "budget",
    "reason",
    "userValue",
    "transportToNext",
  ];

  return fields.filter((field) => JSON.stringify(before[field]) !== JSON.stringify(after[field]));
}
