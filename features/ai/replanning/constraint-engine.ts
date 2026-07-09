import type { DayPlan, TravelPlan } from "../schemas/travel-plan.schema";
import type { ReplanRequest } from "../schemas/replanning.schema";

export type ConstraintSignal = {
  code: string;
  severity: "info" | "warning" | "blocking";
  message: string;
};

export function evaluateReplanConstraints(
  plan: TravelPlan,
  request: ReplanRequest,
): ConstraintSignal[] {
  const targetDay = plan.days.find((day) => day.id === request.targetDayId);
  const signals: ConstraintSignal[] = [];

  if (!targetDay) {
    return [
      {
        code: "TARGET_DAY_NOT_FOUND",
        severity: "blocking",
        message: "Target day does not exist in the current travel plan.",
      },
    ];
  }

  if (
    request.targetActivityId &&
    !targetDay.activities.some((activity) => activity.id === request.targetActivityId)
  ) {
    signals.push({
      code: "TARGET_ACTIVITY_NOT_FOUND",
      severity: "blocking",
      message: "Target activity does not belong to the target day.",
    });
  }

  if (
    request.constraints.budgetMax !== undefined &&
    targetDay.dailyBudget.max > request.constraints.budgetMax
  ) {
    signals.push({
      code: "BUDGET_OVER_TARGET",
      severity: "warning",
      message: `Day budget is above the requested ${plan.totalBudget.currency} ${request.constraints.budgetMax} cap.`,
    });
  }

  if (
    request.action === "rain_plan" ||
    request.constraints.weather === "rain" ||
    request.constraints.weather === "storm"
  ) {
    signals.push({
      code: "WEATHER_REPLAN",
      severity: "info",
      message:
        "Prioritize indoor or weather-resilient activities and add weather verification notes.",
    });
  }

  if (request.action === "accessibility" || request.constraints.accessibility) {
    signals.push({
      code: "ACCESSIBILITY_REPLAN",
      severity: "warning",
      message: "Reduce walking load, avoid stairs-heavy transfers, and preserve rest windows.",
    });
  }

  if (request.action === "avoid_crowds" || request.constraints.avoidCrowds) {
    signals.push({
      code: "CROWD_REPLAN",
      severity: "info",
      message: "Prefer off-peak timing and less crowded alternatives.",
    });
  }

  return signals;
}

export function summarizeDayForReplan(day: DayPlan) {
  return {
    id: day.id,
    dayIndex: day.dayIndex,
    title: day.title,
    theme: day.theme,
    areaFocus: day.areaFocus,
    dailyBudget: day.dailyBudget,
    routeRisk: day.routeRisk,
    paceRisk: day.paceRisk,
    activities: day.activities.map((activity) => ({
      id: activity.id,
      title: activity.title,
      type: activity.type,
      startTime: activity.startTime,
      durationMinutes: activity.durationMinutes,
      area: activity.location.area,
      budget: activity.budget,
      reason: activity.reason,
    })),
  };
}
