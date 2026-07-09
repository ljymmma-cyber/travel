import type { TravelPlan } from "../schemas/travel-plan.schema";
import type { JsonPatchOperation, ReplanRequest } from "../schemas/replanning.schema";

export type LockViolation = {
  activityId: string;
  path: string;
  reason: string;
};

export function getLockedActivityPaths(plan: TravelPlan, request: ReplanRequest) {
  const lockedIds = new Set([
    ...request.lockedActivityIds,
    ...(request.constraints.keepFavorites ? request.favoriteActivityIds : []),
  ]);

  return plan.days.flatMap((day, dayIndex) =>
    day.activities.flatMap((activity, activityIndex) => {
      if (!lockedIds.has(activity.id)) {
        return [];
      }

      return [
        {
          activityId: activity.id,
          path: `/days/${dayIndex}/activities/${activityIndex}`,
          dayId: day.id,
        },
      ];
    }),
  );
}

export function findLockViolations(
  plan: TravelPlan,
  request: ReplanRequest,
  patches: JsonPatchOperation[],
): LockViolation[] {
  const lockedPaths = getLockedActivityPaths(plan, request);

  return patches.flatMap((patch) => {
    const touchedPaths = [patch.path, patch.op === "move" ? patch.from : undefined].filter(
      Boolean,
    ) as string[];

    return lockedPaths.flatMap((locked) => {
      const touchesLockedPath = touchedPaths.some(
        (path) => path === locked.path || path.startsWith(`${locked.path}/`),
      );

      if (!touchesLockedPath) {
        return [];
      }

      return [
        {
          activityId: locked.activityId,
          path: locked.path,
          reason: "Patch attempts to modify an activity locked by the user.",
        },
      ];
    });
  });
}
