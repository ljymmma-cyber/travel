import type { TravelPlan } from "../schemas/travel-plan.schema";
import type { JsonPatchOperation, ReplanRequest } from "../schemas/replanning.schema";
import { findLockViolations } from "./lock-engine";

export type PatchValidationIssue = {
  code: "OUT_OF_SCOPE" | "LOCKED_ACTIVITY" | "UNSAFE_ROOT" | "INVALID_TARGET";
  path: string;
  message: string;
};

export function validateReplanPatchScope(
  plan: TravelPlan,
  request: ReplanRequest,
  patches: JsonPatchOperation[],
): PatchValidationIssue[] {
  const targetDayIndex = plan.days.findIndex((day) => day.id === request.targetDayId);

  if (targetDayIndex === -1) {
    return [
      {
        code: "INVALID_TARGET",
        path: request.targetDayId,
        message: "Target day does not exist.",
      },
    ];
  }

  const allowedDayPath = `/days/${targetDayIndex}`;
  const issues: PatchValidationIssue[] = [];

  for (const patch of patches) {
    const touchedPaths = [patch.path, patch.op === "move" ? patch.from : undefined].filter(
      Boolean,
    ) as string[];

    for (const path of touchedPaths) {
      if (path === "" || path === "/") {
        issues.push({
          code: "UNSAFE_ROOT",
          path,
          message:
            "Root replacement is not allowed. Return a minimal patch for the target day only.",
        });
        continue;
      }

      if (!isAllowedPath(path, allowedDayPath)) {
        issues.push({
          code: "OUT_OF_SCOPE",
          path,
          message: `Patch is outside target day ${request.targetDayId}. Non-target days must remain unchanged.`,
        });
      }
    }
  }

  const lockViolations = findLockViolations(plan, request, patches);

  return [
    ...issues,
    ...lockViolations.map((violation) => ({
      code: "LOCKED_ACTIVITY" as const,
      path: violation.path,
      message: violation.reason,
    })),
  ];
}

function isAllowedPath(path: string, allowedDayPath: string) {
  if (path === allowedDayPath || path.startsWith(`${allowedDayPath}/`)) {
    return true;
  }

  return path === "/warnings" || path.startsWith("/warnings/") || path === "/metadata/retries";
}
